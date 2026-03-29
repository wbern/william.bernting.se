import { test, expect } from "@playwright/test";

/** Navigate to the timeline slide (index 3) and wait for blocks to settle. */
async function goToTimeline(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });
  await page.click("body");

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(700);
  }

  await page.waitForFunction(
    () => {
      const blocks = document.querySelectorAll("[data-testid='tower-stage'] .tower-block");
      return blocks.length > 0 && Array.from(blocks).every(b => b.classList.contains("settled"));
    },
    { timeout: 15_000 },
  );
}

test.describe("timeline block drag interaction", () => {
  test("settled blocks have grab cursor indicating they are draggable", async ({ page }) => {
    await goToTimeline(page);

    const cursor = await page.evaluate(() => {
      const block = document.querySelector("[data-testid='tower-stage'] .tower-block.settled") as HTMLElement;
      if (!block) return null;
      return getComputedStyle(block).cursor;
    });

    expect(cursor).toBe("grab");
  });

  test("mousedown on a settled block adds freed class to enable physics", async ({ page }) => {
    await goToTimeline(page);

    // Use last block (topmost visually, most likely to be unobstructed)
    const settledBlock = page.locator("[data-testid='tower-stage'] .tower-block.settled").last();
    const box = await settledBlock.boundingBox();
    expect(box).not.toBeNull();

    // Pin the element by data-block-index so the selector stays stable after class changes
    const blockIndex = await settledBlock.getAttribute("data-block-index");
    const block = page.locator(`[data-testid='tower-stage'] .tower-block[data-block-index="${blockIndex}"]`);

    // Verify block has settled class
    const isSettled = await block.evaluate(el => el.classList.contains("settled"));
    expect(isSettled).toBe(true);

    // Mouse down on the center of the block
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();

    // Small wait for event to propagate
    await page.waitForTimeout(100);

    const hasFreed = await block.evaluate(el => el.classList.contains("freed"));
    expect(hasFreed).toBe(true);

    await page.mouse.up();
  });

  test("dragging one block frees all blocks", async ({ page }) => {
    await goToTimeline(page);

    const settledBlock = page.locator("[data-testid='tower-stage'] .tower-block.settled").last();
    const box = await settledBlock.boundingBox();
    expect(box).not.toBeNull();

    // Mouse down on one block
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.waitForTimeout(100);

    // All blocks should now have freed class, none should have settled
    const counts = await page.evaluate(() => {
      const blocks = document.querySelectorAll("[data-testid='tower-stage'] .tower-block");
      let freed = 0, settled = 0;
      blocks.forEach(b => {
        if (b.classList.contains("freed")) freed++;
        if (b.classList.contains("settled")) settled++;
      });
      return { freed, settled, total: blocks.length };
    });

    expect(counts.settled).toBe(0);
    expect(counts.freed).toBe(counts.total);

    await page.mouse.up();
  });

  test("dragging a freed block moves it to the mouse position", async ({ page }) => {
    await goToTimeline(page);

    // Pin a block by index before interaction
    const settledBlock = page.locator("[data-testid='tower-stage'] .tower-block.settled").last();
    const box = await settledBlock.boundingBox();
    expect(box).not.toBeNull();
    const blockIndex = await settledBlock.getAttribute("data-block-index");
    const block = page.locator(`[data-testid='tower-stage'] .tower-block[data-block-index="${blockIndex}"]`);

    // Mouse down on center of block
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.waitForTimeout(50);

    // Drag 100px to the right and 50px down
    await page.mouse.move(cx + 100, cy + 50, { steps: 5 });
    await page.waitForTimeout(50);

    // Block should have moved — check its new bounding box
    const newBox = await block.boundingBox();
    expect(newBox).not.toBeNull();
    expect(newBox!.x).toBeGreaterThan(box!.x + 50); // moved at least 50px right

    await page.mouse.up();
  });

  test("throwing a freed block applies velocity and block falls with gravity", async ({ page }) => {
    await goToTimeline(page);

    const settledBlock = page.locator("[data-testid='tower-stage'] .tower-block.settled").last();
    const box = await settledBlock.boundingBox();
    expect(box).not.toBeNull();
    const blockIndex = await settledBlock.getAttribute("data-block-index");
    const block = page.locator(`[data-testid='tower-stage'] .tower-block[data-block-index="${blockIndex}"]`);

    // Mouse down, drag upward quickly, then release (throw up)
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.waitForTimeout(50);

    // Quick upward drag
    await page.mouse.move(cx, cy - 80, { steps: 3 });
    await page.waitForTimeout(20);
    await page.mouse.up();

    // Record position right after release
    const posAfterRelease = await block.boundingBox();
    expect(posAfterRelease).not.toBeNull();

    // Wait for gravity to pull it down
    await page.waitForTimeout(500);

    const posAfterGravity = await block.boundingBox();
    expect(posAfterGravity).not.toBeNull();

    // Block should have fallen (y increased) due to gravity after throw
    expect(posAfterGravity!.y).toBeGreaterThan(posAfterRelease!.y);
  });
});

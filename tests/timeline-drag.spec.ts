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

  test("dragging a freed block moves it toward the mouse position", async ({ page }) => {
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

    // Drag 150px to the right — use many steps and give the physics engine time
    // to converge (Matter.js MouseConstraint uses a spring constraint with
    // stiffness 0.8, not direct positioning, so the block lags the cursor)
    await page.mouse.move(cx + 150, cy, { steps: 20 });
    await page.waitForTimeout(400);

    // Block should have moved — check its new bounding box
    const newBox = await block.boundingBox();
    expect(newBox).not.toBeNull();
    expect(newBox!.x).toBeGreaterThan(box!.x + 10); // moved toward mouse

    await page.mouse.up();
  });

  test("throwing a freed block horizontally moves it from its original position", async ({ page }) => {
    await goToTimeline(page);

    const settledBlock = page.locator("[data-testid='tower-stage'] .tower-block.settled").last();
    const box = await settledBlock.boundingBox();
    expect(box).not.toBeNull();
    const blockIndex = await settledBlock.getAttribute("data-block-index");
    const block = page.locator(`[data-testid='tower-stage'] .tower-block[data-block-index="${blockIndex}"]`);

    // Record original position before any interaction
    const origX = box!.x;

    // Mouse down, drag right quickly, then release (throw right)
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.waitForTimeout(50);

    // Quick rightward drag and release
    await page.mouse.move(cx + 120, cy, { steps: 5 });
    await page.waitForTimeout(20);
    await page.mouse.up();

    // Wait for physics to settle
    await page.waitForTimeout(1000);

    const posAfterSettle = await block.boundingBox();
    expect(posAfterSettle).not.toBeNull();

    // Block should have moved from its original position (thrown right)
    expect(posAfterSettle!.x).not.toBeCloseTo(origX, 0);
  });

  test("dragging a block vertically does not trigger a slide change", async ({ page }) => {
    await goToTimeline(page);

    // Record current slide index before interaction
    const slideBefore = await page.evaluate(() => {
      const dots = document.querySelectorAll(".slide-dot");
      return Array.from(dots).findIndex(d => d.classList.contains("active"));
    });

    // Grab a settled block and drag it vertically (the gesture keen-slider
    // would interpret as a slide swipe if propagation weren't stopped)
    const settledBlock = page.locator("[data-testid='tower-stage'] .tower-block.settled").last();
    const box = await settledBlock.boundingBox();
    expect(box).not.toBeNull();

    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.waitForTimeout(100);

    // Drag vertically — 150px is enough to trigger a keen-slider slide change
    await page.mouse.move(cx, cy - 150, { steps: 10 });
    await page.waitForTimeout(100);
    await page.mouse.up();

    // Wait for any potential slide transition (500ms keen-slider duration + buffer)
    await page.waitForTimeout(800);

    // Slide should not have changed
    const slideAfter = await page.evaluate(() => {
      const dots = document.querySelectorAll(".slide-dot");
      return Array.from(dots).findIndex(d => d.classList.contains("active"));
    });
    expect(slideAfter).toBe(slideBefore);

    // Blocks should still be freed (not reset)
    const freedCount = await page.evaluate(() => {
      const blocks = document.querySelectorAll("[data-testid='tower-stage'] .tower-block.freed");
      return blocks.length;
    });
    expect(freedCount).toBeGreaterThan(0);
  });
});

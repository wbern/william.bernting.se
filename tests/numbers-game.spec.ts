import { test, expect, type Page } from "@playwright/test";

const STATS_SLIDE = 2;

async function gotoStatsSlide(page: Page) {
  await page.goto("/");
  await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });
  await page.locator(`.slide-dot[data-slide="${STATS_SLIDE}"]`).click();
  await page.waitForFunction(
    (idx) => {
      const slides = document.querySelectorAll<HTMLElement>(".keen-slider__slide");
      const slide = slides[idx];
      if (!slide) return false;
      return Math.abs(slide.getBoundingClientRect().top) < 2;
    },
    STATS_SLIDE,
    { timeout: 5_000 },
  );
  await page.waitForSelector("[data-board] .numbers-tile", { timeout: 5_000 });
}

type MergeApi = {
  setBoard(b: number[][]): void;
  attemptMerge(from: { row: number; col: number }, to: { row: number; col: number }): void;
};

test.describe("numbers game", () => {
  test("renders a 4x4 board seeded with several starting tiles", async ({ page }) => {
    await gotoStatsSlide(page);
    const cellCount = await page.locator("[data-board] .numbers-cell").count();
    const tileCount = await page.locator("[data-board] .numbers-tile").count();
    expect(cellCount).toBe(16);
    expect(tileCount).toBeGreaterThanOrEqual(4);
  });

  test("attemptMerge on two adjacent equal tiles merges them and updates score", async ({ page }) => {
    await gotoStatsSlide(page);
    await page.evaluate(() => {
      const api = (window as unknown as { __numbersGame?: MergeApi }).__numbersGame;
      if (!api) throw new Error("numbers game test hook not exposed");
      api.setBoard([
        [3, 3, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
      api.attemptMerge({ row: 0, col: 0 }, { row: 0, col: 1 });
    });
    const mergedTile = page.locator('[data-board] .numbers-tile[data-value="6"]');
    await expect(mergedTile.first()).toBeVisible();
    expect(await page.locator("[data-score]").textContent()).toBe("6");
  });

  test("dragging a tile onto an adjacent equal neighbor merges them", async ({ page }) => {
    await gotoStatsSlide(page);
    await page.evaluate(() => {
      const api = (window as unknown as { __numbersGame?: MergeApi }).__numbersGame;
      api!.setBoard([
        [3, 3, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
    });
    const sourceTile = page.locator('[data-board] .numbers-cell[data-row="0"][data-col="0"] .numbers-tile');
    const targetCell = page.locator('[data-board] .numbers-cell[data-row="0"][data-col="1"]');
    const sourceBox = await sourceTile.boundingBox();
    const targetBox = await targetCell.boundingBox();
    if (!sourceBox || !targetBox) throw new Error("tile bounding box missing");
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(sourceBox.x + sourceBox.width / 2 + 20, sourceBox.y + sourceBox.height / 2, { steps: 5 });
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
    await page.mouse.up();
    await expect(page.locator('[data-board] .numbers-tile[data-value="6"]').first()).toBeVisible();
  });

  test("clicking the game-over banner restarts the game", async ({ page }) => {
    await gotoStatsSlide(page);
    await page.evaluate(() => {
      const api = (window as unknown as { __numbersGame?: MergeApi }).__numbersGame;
      api!.setBoard([
        [3, 6, 12, 24],
        [48, 96, 192, 384],
        [768, 1536, 3072, 6144],
        [12288, 24576, 49152, 98304],
      ]);
    });
    const gameover = page.locator("[data-gameover]");
    await expect(gameover).toBeVisible();
    await gameover.click();
    await expect(gameover).toBeHidden();
    expect(await page.locator("[data-score]").textContent()).toBe("0");
    const tileCount = await page.locator("[data-board] .numbers-tile").count();
    expect(tileCount).toBeGreaterThanOrEqual(4);
  });

  test("dragging any 6 onto another 6 merges them across 10 non-adjacent scenarios", async ({ page }) => {
    await gotoStatsSlide(page);

    const scenarios: Array<{ from: { row: number; col: number }; to: { row: number; col: number } }> = [
      { from: { row: 3, col: 2 }, to: { row: 0, col: 2 } },
      { from: { row: 0, col: 0 }, to: { row: 3, col: 3 } },
      { from: { row: 0, col: 3 }, to: { row: 3, col: 0 } },
      { from: { row: 0, col: 0 }, to: { row: 0, col: 3 } },
      { from: { row: 0, col: 0 }, to: { row: 3, col: 0 } },
      { from: { row: 1, col: 1 }, to: { row: 2, col: 2 } },
      { from: { row: 3, col: 1 }, to: { row: 0, col: 1 } },
      { from: { row: 2, col: 0 }, to: { row: 1, col: 3 } },
      { from: { row: 0, col: 2 }, to: { row: 3, col: 1 } },
      { from: { row: 3, col: 3 }, to: { row: 0, col: 0 } },
    ];

    for (const [i, { from, to }] of scenarios.entries()) {
      const seed = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
      seed[from.row][from.col] = 6;
      seed[to.row][to.col] = 6;
      await page.evaluate((b) => {
        (window as unknown as { __numbersGame: MergeApi }).__numbersGame.setBoard(b);
      }, seed);

      const sourceTile = page.locator(`[data-board] .numbers-cell[data-row="${from.row}"][data-col="${from.col}"] .numbers-tile`);
      const targetCell = page.locator(`[data-board] .numbers-cell[data-row="${to.row}"][data-col="${to.col}"]`);
      const sBox = await sourceTile.boundingBox();
      const tBox = await targetCell.boundingBox();
      if (!sBox || !tBox) throw new Error(`scenario ${i}: missing bounding box`);

      await page.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(sBox.x + sBox.width / 2 + 20, sBox.y + sBox.height / 2, { steps: 5 });
      await page.mouse.move(tBox.x + tBox.width / 2, tBox.y + tBox.height / 2, { steps: 10 });
      await page.mouse.up();

      const label = `scenario ${i}: (${from.row},${from.col}) → (${to.row},${to.col})`;
      await expect(
        page.locator('[data-board] .numbers-tile[data-value="12"]').first(),
        label,
      ).toBeVisible();
    }
  });

  test("only one starter tile shows the drag hint on first load", async ({ page }) => {
    await gotoStatsSlide(page);
    const starterTiles = page.locator('[data-board] .numbers-tile[data-starter="true"]');
    await expect(starterTiles).toHaveCount(1);
  });

  test("milestone tile displays the stat achievement inside the tile", async ({ page }) => {
    await gotoStatsSlide(page);
    await page.evaluate(() => {
      const api = (window as unknown as { __numbersGame?: MergeApi }).__numbersGame;
      api!.setBoard([
        [48, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
    });
    const milestone = page.locator('[data-board] .numbers-tile[data-stat="prototypes"]');
    await expect(milestone).toHaveCount(1);
    await expect(milestone).toContainText(/47/);
    await expect(milestone).toContainText(/prototyp/i);
  });
});

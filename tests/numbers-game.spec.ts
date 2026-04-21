import { test, expect, type Page } from "@playwright/test";

const STATS_SLIDE = 2;
const HERO_WAIT_MS = 4200;
const SLIDE_TRANSITION_MS = 2300;

async function gotoStatsSlide(page: Page) {
  await page.goto("/");
  await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });
  await page.click("body");
  await page.waitForTimeout(HERO_WAIT_MS);
  for (let i = 0; i < STATS_SLIDE; i++) {
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(SLIDE_TRANSITION_MS);
  }
}

test.describe("numbers game", () => {
  test("renders a 4x4 board with two starting tiles", async ({ page }) => {
    await gotoStatsSlide(page);
    const cellCount = await page.locator("[data-board] .numbers-cell").count();
    const tileCount = await page.locator("[data-board] .numbers-tile").count();
    expect(cellCount).toBe(16);
    expect(tileCount).toBe(2);
  });

  test("ArrowLeft on focused board merges adjacent equal tiles and updates score", async ({ page }) => {
    await gotoStatsSlide(page);
    await page.evaluate(() => {
      const api = (window as unknown as { __numbersGame?: { setBoard(b: number[][]): void } }).__numbersGame;
      if (!api) throw new Error("numbers game test hook not exposed");
      api.setBoard([
        [3, 3, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ]);
    });
    await page.locator("[data-board]").focus();
    await page.keyboard.press("ArrowLeft");
    const tileValues = await page.locator("[data-board] .numbers-tile").evaluateAll(
      (els) => els.map((el) => (el as HTMLElement).dataset.value),
    );
    // Two starting 3s merge into a 6; spawn adds one more tile (value 3).
    expect(tileValues).toContain("6");
    expect(await page.locator("[data-score]").textContent()).toBe("6");
  });

  test("milestone tile displays the stat achievement inside the tile", async ({ page }) => {
    await gotoStatsSlide(page);
    await page.evaluate(() => {
      const api = (window as unknown as { __numbersGame?: { setBoard(b: number[][]): void } }).__numbersGame;
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

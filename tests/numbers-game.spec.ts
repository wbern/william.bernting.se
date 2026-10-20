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
  getBoard(): number[][];
  getUnlocked(): string[];
  attemptMerge(from: { row: number; col: number }, to: { row: number; col: number }): boolean;
};

function api(page: Page) {
  return {
    setBoard: (b: number[][]) =>
      page.evaluate((board) => (window as unknown as { __numbersGame: MergeApi }).__numbersGame.setBoard(board), b),
    merge: (from: { row: number; col: number }, to: { row: number; col: number }) =>
      page.evaluate(
        ([f, t]) => (window as unknown as { __numbersGame: MergeApi }).__numbersGame.attemptMerge(f, t),
        [from, to] as const,
      ),
  };
}

test.describe("numbers game", () => {
  test("renders a 4x4 board seeded with several starting tiles", async ({ page }) => {
    await gotoStatsSlide(page);
    const cellCount = await page.locator("[data-board] .numbers-cell").count();
    const tileCount = await page.locator("[data-board] .numbers-tile").count();
    expect(cellCount).toBe(16);
    expect(tileCount).toBeGreaterThanOrEqual(4);
  });

  test("the first merge into a stat reveals its story and counts toward progress", async ({ page }) => {
    await gotoStatsSlide(page);
    const game = api(page);
    await game.setBoard([
      [3, 3, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    await expect(page.locator("[data-progress-count]")).toHaveText("0");
    await game.merge({ row: 0, col: 0 }, { row: 0, col: 1 });
    await expect(page.locator('[data-board] .numbers-tile[data-value="6"]').first()).toBeVisible();
    await expect(page.locator("[data-progress-count]")).toHaveText("1");
    await expect(page.locator("[data-reveal]")).toHaveAttribute("data-stat", "recruited");
    await expect(page.locator("[data-reveal-story]")).toContainText(/NetConsult/);
    await expect(page.locator('.numbers-chip[data-stat-key="recruited"]')).toHaveAttribute("data-unlocked", "true");
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

  test("the game-over panel's restart button starts a fresh game", async ({ page }) => {
    await gotoStatsSlide(page);
    await api(page).setBoard([
      [3, 6, 12, 24],
      [48, 96, 192, 384],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const gameover = page.locator("[data-gameover]");
    await expect(gameover).toBeVisible();
    await gameover.locator("[data-restart]").click();
    await expect(gameover).toBeHidden();
    expect(await page.locator("[data-board] .numbers-tile").count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator("[data-progress-count]")).toHaveText("0");
  });

  test("forming the top tile shows the finish panel, and its CTA moves on to the timeline", async ({ page }) => {
    await gotoStatsSlide(page);
    const game = api(page);
    await game.setBoard([
      [384, 0, 0, 384],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    await game.merge({ row: 0, col: 0 }, { row: 0, col: 3 });
    // The top tile stays on the board instead of exploding back to a 3.
    await expect(page.locator('[data-board] .numbers-tile[data-value="768"]')).toHaveCount(1);
    await expect(page.locator("[data-reveal]")).toHaveAttribute("data-stat", "users");
    const finish = page.locator("[data-finish]");
    await expect(finish).toBeVisible();
    await finish.locator("[data-finish-cta]").click();
    await page.waitForFunction(() => {
      const slide = document.querySelectorAll<HTMLElement>(".keen-slider__slide")[3];
      return slide && Math.abs(slide.getBoundingClientRect().top) < 2;
    }, null, { timeout: 5_000 });
  });

  test("clicking a number chip shows its story without playing", async ({ page }) => {
    await gotoStatsSlide(page);
    const chip = page.locator('.numbers-chip[data-stat-key="kids"]');
    await chip.evaluate((el) => (el as HTMLElement).click());
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-reveal-value]")).toHaveText("~500");
    await expect(page.locator("[data-reveal-story]")).toContainText(/Schack4an/);
    await expect(page.locator("[data-reveal-locked]")).toBeVisible();
    await expect(page.locator("[data-progress-count]")).toHaveText("0");
  });

  test("keyboard: Enter picks a tile, arrows move, Enter on its twin merges", async ({ page }) => {
    await gotoStatsSlide(page);
    await api(page).setBoard([
      [3, 0, 3, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    await page.locator('[data-board] .numbers-cell[data-row="0"][data-col="0"] .numbers-tile').focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-board] .numbers-tile[data-value="6"]').first()).toBeVisible();
    await expect(page.locator("[data-progress-count]")).toHaveText("1");
    // Arrow keys stayed inside the board: still on the numbers slide.
    const top = await page.evaluate(() => document.querySelectorAll<HTMLElement>(".keen-slider__slide")[2].getBoundingClientRect().top);
    expect(Math.abs(top)).toBeLessThan(2);
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

  test("no starter tile shows the drag hint", async ({ page }) => {
    await gotoStatsSlide(page);
    const starterTiles = page.locator('[data-board] .numbers-tile[data-starter="true"]');
    await expect(starterTiles).toHaveCount(0);
  });

  test("milestone tile displays the stat inside the tile, without a fake approximation mark", async ({ page }) => {
    await gotoStatsSlide(page);
    await api(page).setBoard([
      [48, 192, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const teams = page.locator('[data-board] .numbers-tile[data-stat="teams"]');
    await expect(teams).toHaveCount(1);
    await expect(teams.locator(".numbers-tile-value")).toHaveText("14");
    await expect(teams).toContainText(/Telia/i);
    const projects = page.locator('[data-board] .numbers-tile[data-stat="projects"]');
    await expect(projects.locator(".numbers-tile-value")).toHaveText("77");
    await expect(page.locator(".numbers-tile-value[data-approx]")).toHaveCount(0);
  });

  test("stat labels fit their tiles without clipping", async ({ page }) => {
    await gotoStatsSlide(page);
    await api(page).setBoard([
      [6, 12, 24, 48],
      [96, 192, 384, 768],
      [3, 0, 0, 0],
      [0, 0, 0, 3],
    ]);
    await page.waitForTimeout(300);
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".numbers-tile-prefix, .numbers-tile-stat, .numbers-tile-value")]
        .filter((el) => el.scrollWidth > el.clientWidth + 1)
        .map((el) => el.textContent),
    );
    expect(clipped).toEqual([]);
  });

  test("the slide fits the viewport on desktop so the first scroll moves on", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop layout only");
    await gotoStatsSlide(page);
    const { sh, ch } = await page.evaluate(() => {
      const slide = document.querySelectorAll<HTMLElement>(".keen-slider__slide")[2];
      return { sh: slide.scrollHeight, ch: slide.clientHeight };
    });
    expect(sh).toBeLessThanOrEqual(ch);
  });
});

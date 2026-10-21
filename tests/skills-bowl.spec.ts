import { test, expect, type Page } from "@playwright/test";

const SKILLS_SLIDE = 4;

type GameApi = {
    fruits(): { tier: number; x: number; y: number; r: number }[];
    bowl(): { x: number; y: number; w: number; h: number; bottom: number; dangerY: number; dropY: number };
    state(): { score: number; current: number; upcoming: number; gameOver: boolean; reached: number[]; running: boolean };
    drop(xFrac: number, tier?: number): boolean;
    place(tier: number, xFrac: number, yFrac?: number): number;
    newGame(): void;
};

async function gotoSkills(page: Page, prefix = "") {
    await page.goto(prefix + "/");
    await page.waitForSelector("#slider[data-keen-slider-v]", { timeout: 10_000 });
    await page.evaluate((index) => document.dispatchEvent(new CustomEvent("slider-goto", { detail: { index } })), SKILLS_SLIDE);
    await page.waitForFunction(
        (idx) => Math.abs(document.querySelectorAll<HTMLElement>(".keen-slider__slide")[idx].getBoundingClientRect().top) < 2,
        SKILLS_SLIDE,
        { timeout: 5_000 },
    );
    await page.waitForFunction(() => (window as unknown as { __skillsBowl?: GameApi }).__skillsBowl?.fruits().length);
}

const api = <T>(page: Page, fn: (g: GameApi) => T) =>
    page.evaluate(`(${fn.toString()})(window.__skillsBowl)`) as Promise<T>;
const fruits = (page: Page) => api(page, (g) => g.fruits());
const state = (page: Page) => api(page, (g) => g.state());

const activeSlide = (page: Page) =>
    page.evaluate(() => [...document.querySelectorAll(".slide-dot")].findIndex((d) => d.classList.contains("active")));

test.describe("skills merge game", () => {
    test("opens on a settled, mixed pile that doesn't merge by itself", async ({ page }) => {
        await gotoSkills(page);
        const list = await fruits(page);
        expect(list.length).toBeGreaterThanOrEqual(8);
        expect(new Set(list.map((f) => f.tier)).size).toBeGreaterThanOrEqual(5);
        await page.waitForTimeout(1500);
        expect((await state(page)).score).toBe(0);
        expect(await fruits(page)).toHaveLength(list.length);
        // Instructions are on screen, not hidden behind a hover.
        await expect(page.locator(".skills-caption")).toHaveText("Släpp frukter. Två likadana blir en större.");
        await expect(page.locator(".skills-rung.is-reached")).toHaveCount(6);
        await expect(page.locator(".skills-rung")).toHaveCount(11);
    });

    test("fruit stays inside the stage, below the heading", async ({ page }) => {
        await gotoSkills(page);
        const box = (await page.locator(".skills-canvas").boundingBox())!;
        const heading = (await page.locator(".skills-heading").boundingBox())!;
        for (const f of await fruits(page)) {
            expect(f.y - f.r).toBeGreaterThanOrEqual(0);
            expect(f.y + f.r).toBeLessThanOrEqual(box.height + 1);
        }
        if (box.x < heading.x + heading.width && box.x + box.width > heading.x) {
            expect(box.y).toBeGreaterThan(heading.y + heading.height);
        }
    });

    test("two of the same fruit merge into the next one and tell its story", async ({ page }) => {
        await gotoSkills(page);
        await api(page, (g) => { g.place(5, 0.5, 0.1); g.place(5, 0.5, 0.35); });
        await expect.poll(async () => (await fruits(page)).some((f) => f.tier === 6)).toBe(true);
        const s = await state(page);
        expect(s.score).toBeGreaterThanOrEqual(21);
        expect(s.reached).toContain(6);
        const card = page.locator(".skills-card");
        await expect(card).toHaveClass(/is-open/);
        await expect(card.locator(".skills-card-title")).toHaveText("DevOps / CI/CD");
        await expect(card.locator(".skills-card-kicker")).toContainText("Nytt steg");
        await expect(card.locator(".skills-card-meta")).toContainText("3,3 år i uppdrag");
        await expect(page.locator('.skills-rung[data-tier="6"]')).toHaveClass(/is-reached/);
        await expect(page.locator(".skills-live")).toHaveText("Nytt steg: DevOps / CI/CD.");
    });

    test("a merge chain reaches AI agents, and its card links to the project", async ({ page }) => {
        await gotoSkills(page, "/en");
        await api(page, (g) => { g.place(9, 0.5, 0.75); g.place(8, 0.5, 0.2); });
        await page.waitForTimeout(800);
        await api(page, (g) => { g.place(8, 0.52, 0); });
        await expect.poll(async () => (await state(page)).reached).toContain(10);
        const card = page.locator(".skills-card");
        await expect(card.locator(".skills-card-kicker")).toHaveText("The top · Step 11 of 11");
        await expect(card.locator(".skills-card-title")).toHaveText("AI agents");
        await expect(card.locator(".skills-card-body")).toContainText("~500 kids");
        await card.locator(".skills-card-link").click();
        await expect.poll(() => activeSlide(page)).toBe(1);
        await expect(page).toHaveURL(/#legacy-chess-tool-rewrite$/);
    });

    test("the ladder strip reopens reached stories and keeps the rest locked", async ({ page }) => {
        await gotoSkills(page, "/en");
        await page.locator('.skills-rung[data-tier="5"]').click();
        const card = page.locator(".skills-card");
        await expect(card).toHaveClass(/is-open/);
        await expect(card.locator(".skills-card-title")).toHaveText("C# / .NET");
        await expect(card.locator(".skills-card-body")).toContainText("5,000 active users");
        await expect(card.locator(".skills-card-kicker")).toHaveText("Step 6 of 11");
        await page.locator(".skills-card-close").click();
        await expect(card).not.toHaveClass(/is-open/);
        const locked = page.locator('.skills-rung[data-tier="8"]');
        await expect(locked).toHaveAttribute("aria-disabled", "true");
        await expect(locked).toHaveAttribute("aria-label", /TDD.*not reached yet/);
        await locked.click({ force: true });
        await expect(card).not.toHaveClass(/is-open/);
    });

    test("clicking in the bowl drops the fruit and keeps the slide", async ({ page, isMobile }) => {
        test.skip(isMobile, "mouse only; touch is covered below");
        await gotoSkills(page);
        const before = (await fruits(page)).length;
        const box = (await page.locator(".skills-canvas").boundingBox())!;
        const bowl = await api(page, (g) => g.bowl());
        await page.mouse.move(box.x + bowl.x + bowl.w * 0.2, box.y + bowl.y - 20);
        await page.mouse.click(box.x + bowl.x + bowl.w * 0.2, box.y + bowl.y - 20);
        await expect.poll(async () => (await fruits(page)).length).toBeGreaterThan(before);
        await page.waitForTimeout(600);
        expect(await activeSlide(page)).toBe(SKILLS_SLIDE);
    });

    test("keyboard: arrows aim, space drops", async ({ page }) => {
        await gotoSkills(page);
        const before = (await fruits(page)).length;
        await page.locator(".skills-canvas").focus();
        for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("Space");
        await expect.poll(async () => (await fruits(page)).length).toBe(before + 1);
        const bowl = await api(page, (g) => g.bowl());
        const dropped = (await fruits(page)).reduce((a, b) => (a.y < b.y ? a : b));
        expect(dropped.x).toBeLessThan(bowl.x + bowl.w * 0.35);
        expect(await activeSlide(page)).toBe(SKILLS_SLIDE);
    });

    test("hovering a pillar lights its rung on the ladder", async ({ page, isMobile }) => {
        test.skip(isMobile, "hover");
        await gotoSkills(page);
        await page.locator('.skills-pillar[data-pillar="coaching"] .skills-pillar-title').hover();
        await expect(page.locator('.skills-rung[data-tier="9"]')).toHaveClass(/is-lit/);
        await page.locator('.skills-pillar[data-pillar="tdd"] .skills-pillar-title').hover();
        await expect(page.locator('.skills-rung[data-tier="8"]')).toHaveClass(/is-lit/);
        await expect(page.locator('.skills-rung[data-tier="9"]')).not.toHaveClass(/is-lit/);
    });

    test("an overfull bowl ends the game gently, and play again starts over", async ({ page }) => {
        await gotoSkills(page);
        await api(page, (g) => {
            // Distinct tiers so nothing merges away: a tower over the rim.
            [7, 6, 5, 4, 3, 2, 1, 0].forEach((t, i) => g.place(t, 0.5, 0.5 - i * 0.3));
            [9, 8].forEach((t, i) => g.place(t, 0.15 + i * 0.7, 0.2));
        });
        const over = page.locator(".skills-over");
        await expect(over).toBeVisible({ timeout: 8_000 });
        await expect(over.locator(".skills-over-title")).toHaveText("Skålen är full.");
        expect((await state(page)).gameOver).toBe(true);
        await over.locator("button").click();
        await expect(over).toBeHidden();
        const s = await state(page);
        expect(s.gameOver).toBe(false);
        expect(s.score).toBe(0);
    });

    test("screen readers get the whole ladder with the story lines", async ({ page }) => {
        await gotoSkills(page, "/en");
        const items = (await page.locator(".skills-list li").allTextContents()).map((s) => s.trim());
        expect(items).toHaveLength(11);
        expect(items[0]).toMatch(/^Vue \(cherry\), 5\.2 years on the job: /);
        expect(items[10]).toMatch(/^AI agents \(watermelon\): The pairing tool/);
        await expect(page.locator(".skills-canvas")).toHaveAttribute("aria-label", /arrows move the fruit/);
    });
});

test.describe("skills merge game with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("fruit still merge", async ({ page }) => {
        await gotoSkills(page);
        await api(page, (g) => { g.place(2, 0.5, 0.1); g.place(2, 0.5, 0.3); });
        await expect.poll(async () => (await state(page)).score).toBeGreaterThan(0);
    });
});

// Touch emulation via CDP needs Chromium, so this runs in the desktop
// (Chromium) project with a phone-sized touch context.
test.describe("skills merge game on a touch phone", () => {
    test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

    async function swipe(page: Page, from: { x: number; y: number }, dx: number, dy: number) {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
        for (let i = 1; i <= 10; i++) {
            await cdp.send("Input.dispatchTouchEvent", {
                type: "touchMove",
                touchPoints: [{ x: from.x + (dx * i) / 10, y: from.y + (dy * i) / 10 }],
            });
        }
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }

    test("dragging along the bowl aims, letting go drops there", async ({ page, browserName }) => {
        test.skip(browserName !== "chromium", "needs CDP touch emulation");
        await gotoSkills(page);
        const box = (await page.locator(".skills-canvas").boundingBox())!;
        const bowl = await api(page, (g) => g.bowl());
        const before = (await fruits(page)).length;
        const y = box.y + bowl.y - 10;
        await swipe(page, { x: box.x + bowl.x + bowl.w * 0.5, y }, bowl.w * 0.35, 0);
        await expect.poll(async () => (await fruits(page)).length).toBe(before + 1);
        const dropped = (await fruits(page)).reduce((a, b) => (a.y < b.y ? a : b));
        expect(dropped.x).toBeGreaterThan(bowl.x + bowl.w * 0.7);
        await page.waitForTimeout(600);
        expect(await activeSlide(page)).toBe(SKILLS_SLIDE);
    });

    test("a vertical swipe on the bowl doesn't change slide by accident", async ({ page, browserName }) => {
        test.skip(browserName !== "chromium", "needs CDP touch emulation");
        await gotoSkills(page);
        const box = (await page.locator(".skills-canvas").boundingBox())!;
        const bowl = await api(page, (g) => g.bowl());
        await swipe(page, { x: box.x + bowl.x + bowl.w / 2, y: box.y + bowl.y + bowl.h * 0.6 }, 0, -300);
        await page.waitForTimeout(800);
        expect(await activeSlide(page)).toBe(SKILLS_SLIDE);
    });

    test("a vertical swipe on the copy still changes slide", async ({ page, browserName }) => {
        test.skip(browserName !== "chromium", "needs CDP touch emulation");
        await gotoSkills(page);
        const h = (await page.locator(".skills-pillar").first().boundingBox())!;
        await swipe(page, { x: h.x + 40, y: h.y + h.height / 2 + 200 }, 0, -400);
        await expect.poll(() => activeSlide(page)).toBe(SKILLS_SLIDE + 1);
    });
});

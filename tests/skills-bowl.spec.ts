import { test, expect, type Page } from "@playwright/test";

const SKILLS_SLIDE = 4;

type BowlApi = {
    fruits(): { id: string; x: number; y: number; r: number; tier: number }[];
    combos(): string[];
    throwAt(a: string, b: string): boolean;
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
}

const fruits = (page: Page) =>
    page.evaluate(() => (window as unknown as { __skillsBowl: BowlApi }).__skillsBowl.fruits());

async function waitForFullBowl(page: Page) {
    await expect.poll(async () => (await fruits(page)).length, { timeout: 6_000 }).toBe(13);
}

const activeSlide = (page: Page) =>
    page.evaluate(() => [...document.querySelectorAll(".slide-dot")].findIndex((d) => d.classList.contains("active")));

test.describe("skills bowl", () => {
    test("fills with one fruit per skill, no duplicates, pillars biggest", async ({ page }) => {
        await gotoSkills(page);
        await waitForFullBowl(page);
        const list = await fruits(page);
        expect(new Set(list.map((f) => f.id)).size).toBe(list.length);
        const pillarR = list.filter((f) => ["tdd", "ai", "coaching"].includes(f.id)).map((f) => f.r);
        const toolR = list.filter((f) => !["tdd", "ai", "coaching"].includes(f.id)).map((f) => f.r);
        expect(Math.min(...pillarR)).toBeGreaterThan(Math.max(...toolR));
        // TypeScript (9.1 y) is bigger than C# (1.5 y): size follows years.
        const r = Object.fromEntries(list.map((f) => [f.id, f.r]));
        expect(r.typescript).toBeGreaterThan(r.csharp);
    });

    test("fruit stays inside the stage, below the heading", async ({ page }) => {
        await gotoSkills(page);
        await waitForFullBowl(page);
        const box = (await page.locator(".skills-canvas").boundingBox())!;
        const heading = (await page.locator(".skills-heading").boundingBox())!;
        for (const f of await fruits(page)) {
            expect(f.y - f.r).toBeGreaterThanOrEqual(0);
            expect(f.y + f.r).toBeLessThanOrEqual(box.height + 1);
        }
        // On phones the stage starts under the copy, so fruit can't cover the title.
        if (box.x < heading.x + heading.width && box.x + box.width > heading.x) {
            expect(box.y).toBeGreaterThan(heading.y + heading.height);
        }
    });

    test("throwing two related skills together reveals a combo story", async ({ page }) => {
        await gotoSkills(page);
        await waitForFullBowl(page);
        await page.evaluate(() => (window as unknown as { __skillsBowl: BowlApi }).__skillsBowl.throwAt("react", "coaching"));
        const card = page.locator(".skills-card");
        await expect(card).toHaveAttribute("data-kind", "combo");
        await expect(card.locator(".skills-card-title")).toHaveText("Sembo: startsidan");
        await expect(card.locator(".skills-card-link")).toHaveAttribute("data-project", "sembo-se-startpage");
        await expect(page.locator("[data-combos-found]")).not.toHaveText("0");
    });

    test("a pillar's project link opens that project on the projects slide", async ({ page }) => {
        await gotoSkills(page);
        await page.locator(".skills-pillar-link").first().click();
        await expect.poll(() => activeSlide(page)).toBe(1);
        await expect(page).toHaveURL(/#tdd-command-generator$/);
    });

    test("screen readers get the full list: pillars first, then tools with years", async ({ page }) => {
        await gotoSkills(page, "/en");
        await expect(page.locator(".skills-canvas")).toHaveAttribute("role", "img");
        const items = await page.locator(".skills-list li").allTextContents();
        expect(items).toHaveLength(13);
        expect(items[0]).toContain("Test first");
        expect(items[3]).toMatch(/^TypeScript, 9\.1 years on the job/);
    });
});

// Touch emulation via CDP needs Chromium, so this runs in the desktop
// (Chromium) project with a phone-sized touch context.
test.describe("skills bowl on a touch phone", () => {
    test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

    test("a vertical swipe that starts on the fruit pile still changes slide", async ({ page, browserName }) => {
        test.skip(browserName !== "chromium", "needs CDP touch emulation");
        await gotoSkills(page);
        await waitForFullBowl(page);
        const box = (await page.locator(".skills-canvas").boundingBox())!;
        const tdd = (await fruits(page)).find((f) => f.id === "tdd")!;
        const x = box.x + tdd.x, y = box.y + tdd.y;
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
        for (let i = 1; i <= 12; i++) {
            await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - i * 40 }] });
        }
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await expect.poll(() => activeSlide(page)).toBe(SKILLS_SLIDE + 1);
    });

    test("a sideways drag on a fruit moves the fruit, not the slide", async ({ page, browserName }) => {
        test.skip(browserName !== "chromium", "needs CDP touch emulation");
        await gotoSkills(page);
        await waitForFullBowl(page);
        const box = (await page.locator(".skills-canvas").boundingBox())!;
        const before = (await fruits(page)).find((f) => f.id === "coaching")!;
        const x = box.x + before.x, y = box.y + before.y;
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
        for (let i = 1; i <= 10; i++) {
            await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - i * 16, y: y - i * 3 }] });
        }
        const during = (await fruits(page)).find((f) => f.id === "coaching")!;
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        expect(before.x - during.x).toBeGreaterThan(60);
        await page.waitForTimeout(800);
        expect(await activeSlide(page)).toBe(SKILLS_SLIDE);
    });
});

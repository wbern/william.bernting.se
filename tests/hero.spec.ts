import { test, expect } from "@playwright/test";

const LOCALES = [
  { prefix: "", label: "sv", teach: "lär ut AI" },
  { prefix: "/en", label: "en", teach: "teach AI" },
];

for (const locale of LOCALES) {
  test.describe(`hero [${locale.label}]`, () => {
    test("name, pitch and contact are visible almost immediately", async ({ page }) => {
      await page.goto(locale.prefix + "/");
      await page.waitForSelector(".hero-slide");
      await page.waitForTimeout(1000);
      for (const sel of ["h1", ".hero-tagline", ".hero-proof", ".hero-email"]) {
        const opacity = await page.locator(`.hero-slide ${sel}`).first().evaluate((el) => Number(getComputedStyle(el).opacity));
        expect(opacity, `${sel} opacity`).toBeGreaterThan(0.95);
      }
      await expect(page.locator(".hero-verb").first()).toHaveText(new RegExp(locale.teach));
    });

    test("tagline verb jumps to the finale with that track picked", async ({ page }) => {
      await page.goto(locale.prefix + "/");
      await page.waitForTimeout(800);
      await page.locator('.hero-verb[data-track="legacy"]').click();
      await page.waitForTimeout(1200);
      await expect(page.locator("[data-finale]")).toHaveAttribute("data-track", "legacy");
      await expect(page.locator('.track[data-track="legacy"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", "5");
    });

    test("scroll hint sits below the marquee, not on top of it", async ({ page }) => {
      await page.goto(locale.prefix + "/");
      await page.waitForTimeout(1600);
      const field = await page.locator(".hero-marquee-bottom .marquee-field").boundingBox();
      const hint = await page.locator(".hero-scroll-hint").boundingBox();
      expect(hint!.y).toBeGreaterThanOrEqual(field!.y + field!.height - 1);
    });

    test("hover/tap on a marquee word shows its caption and pauses the row", async ({ page }, testInfo) => {
      await page.goto(locale.prefix + "/");
      await page.waitForTimeout(1600);
      // The tap goes to page coordinates, so the marquee row must really be on screen,
      // and the word itself must be inside the viewport (the rows scroll; pick one that is).
      await expect(page.locator(".hero-marquee-bottom .marquee-field")).toBeInViewport({ ratio: 0.5 });
      const idx = await page.evaluate(() => {
        const items = [...document.querySelectorAll<HTMLElement>(".hero-marquee-bottom .marquee-item")];
        return items.findIndex((el) => { const r = el.getBoundingClientRect(); return r.left > 24 && r.right < innerWidth - 24; });
      });
      expect(idx, "a marquee word is on screen").toBeGreaterThanOrEqual(0);
      const item = page.locator('.hero-marquee-bottom .marquee-item').nth(idx);
      const box = (await item.boundingBox())!;
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      if (testInfo.project.name === "mobile") await page.touchscreen.tap(x, y);
      else await page.mouse.move(x, y);
      const tip = page.locator("[data-trait-tip]");
      await expect(tip).toHaveClass(/is-visible/);
      const caption = await page.locator(".hero-marquee-wrap .marquee-item.is-active").getAttribute("data-caption");
      await expect(tip.locator("[data-tip-text]")).toHaveText(caption!);
      const state = await page.locator(".marquee-row.is-paused .marquee-track").evaluate((el) => getComputedStyle(el).animationPlayState);
      expect(state).toBe("paused");
    });
  });
}

test("reduced motion: content visible at once and marquee holds still", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForSelector(".hero-slide h1");
  expect(await page.locator(".hero-slide h1").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  expect(await page.locator(".marquee-track").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await ctx.close();
});

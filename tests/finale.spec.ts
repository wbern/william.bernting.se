import { test, expect } from "@playwright/test";

const LOCALES = [
  { prefix: "", label: "sv", legacySubject: "Spår: Legacy", copied: "Kopierat!" },
  { prefix: "/en", label: "en", legacySubject: "Track: Legacy", copied: "Copied!" },
];

async function openFinale(page: import("@playwright/test").Page, prefix: string) {
  await page.goto(prefix + "/");
  await page.waitForSelector(".slide-dot", { timeout: 10_000 });
  await page.click('.slide-dot[data-slide="5"]');
  await expect(page.locator(".slide-dot").nth(5)).toHaveClass(/active/);
  await page.waitForTimeout(700);
}

for (const locale of LOCALES) {
  test.describe(`[${locale.label}] finale slide`, () => {
    test("picking a track tailors the primary CTA", async ({ page }) => {
      await openFinale(page, locale.prefix);
      const cta = page.locator("[data-cta-primary]");
      await expect(cta).toHaveAttribute("href", "mailto:william@bernting.se");

      const legacy = page.locator('.track[data-track="legacy"]');
      await legacy.click();
      await expect(legacy).toHaveAttribute("aria-pressed", "true");
      const href = await cta.getAttribute("href");
      expect(decodeURIComponent(href!.split("subject=")[1])).toBe(locale.legacySubject);

      // Clicking again deselects and restores the generic CTA
      await legacy.click();
      await expect(legacy).toHaveAttribute("aria-pressed", "false");
      await expect(cta).toHaveAttribute("href", "mailto:william@bernting.se");
    });

    test("recommendations cycle and wrap around", async ({ page }) => {
      await openFinale(page, locale.prefix);
      const reviews = page.locator("[data-review]");
      const n = await reviews.count();
      expect(n).toBeGreaterThan(1);
      await expect(reviews.nth(0)).toBeVisible();
      const next = page.locator("[data-reviews-next]");
      await next.click();
      await expect(reviews.nth(1)).toBeVisible();
      await expect(reviews.nth(0)).toBeHidden();
      for (let i = 1; i < n; i++) await next.click();
      await expect(reviews.nth(0)).toBeVisible();
    });

    test("copy button copies the email and confirms", async ({ page, context, browserName }) => {
      test.skip(browserName !== "chromium", "clipboard permissions are chromium-only");
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await openFinale(page, locale.prefix);
      const copy = page.locator("[data-copy-email]");
      await copy.scrollIntoViewIfNeeded();
      await copy.click();
      await expect(page.locator("[data-copy-toast]")).toHaveText(locale.copied);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("william@bernting.se");
    });

    test("external links open in a new tab", async ({ page }) => {
      await openFinale(page, locale.prefix);
      for (const href of ["https://www.linkedin.com/in/williambernting", "https://www.kendev.se/"]) {
        const link = page.locator(`.dock a[href="${href}"]`);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/);
      }
    });

    test("going past the end nudges, back-to-top returns to slide 1", async ({ page }) => {
      await openFinale(page, locale.prefix);
      await page.keyboard.press("ArrowDown");
      await expect(page.locator(".keen-slider__slide").nth(5)).toHaveClass(/end-bump/);
      await expect(page.locator(".slide-dot").nth(5)).toHaveClass(/active/);

      const top = page.locator("[data-back-to-top]");
      await top.scrollIntoViewIfNeeded();
      await top.click();
      await expect(page.locator(".slide-dot").nth(0)).toHaveClass(/active/);
    });

    test("only the current slide is focusable", async ({ page }) => {
      await openFinale(page, locale.prefix);
      const inert = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>("#slider > .keen-slider__slide")).map((s) => s.inert),
      );
      expect(inert).toEqual([true, true, true, true, true, false]);
    });

    test("location is localised", async ({ page }) => {
      await openFinale(page, locale.prefix);
      const sign = await page.locator(".proof-sign").textContent();
      expect(sign).toContain(locale.label === "sv" ? "Göteborg" : "Gothenburg");
    });
  });
}

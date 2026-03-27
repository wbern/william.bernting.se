import { test, expect } from "@playwright/test";

const LOCALES = [
  { prefix: "", lang: "sv", greeting: "Hej!", ogLocale: "sv_SE" },
  { prefix: "/en", lang: "en", greeting: "Hey!", ogLocale: "en_US" },
];

for (const locale of LOCALES) {
  test.describe(`${locale.lang} (${locale.prefix || "/"})`, () => {
    test("html lang attribute is correct", async ({ page }) => {
      await page.goto(locale.prefix + "/");
      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toBe(locale.lang);
    });

    test("hero greeting matches locale", async ({ page }) => {
      await page.goto(locale.prefix + "/");
      await page.waitForSelector(".hero-greeting", { timeout: 5000 });
      const text = await page.locator(".hero-greeting").textContent();
      expect(text).toBe(locale.greeting);
    });

    test("hreflang tags are present and correct", async ({ page }) => {
      await page.goto(locale.prefix + "/");
      const svHref = await page
        .locator('link[hreflang="sv"]')
        .getAttribute("href");
      const enHref = await page
        .locator('link[hreflang="en"]')
        .getAttribute("href");
      const defaultHref = await page
        .locator('link[hreflang="x-default"]')
        .getAttribute("href");

      // In dev mode Astro uses localhost; in prod it uses the site URL.
      // Assert the path structure is correct regardless of origin.
      expect(svHref).toBeTruthy();
      expect(svHref).not.toContain("/en/");
      expect(enHref).toContain("/en/");
      expect(defaultHref).toBe(svHref);
    });

    test("og:locale is correct", async ({ page }) => {
      await page.goto(locale.prefix + "/");
      const ogLocale = await page
        .locator('meta[property="og:locale"]')
        .getAttribute("content");
      expect(ogLocale).toBe(locale.ogLocale);
    });
  });
}

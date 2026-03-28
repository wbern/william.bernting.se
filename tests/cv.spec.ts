import { test, expect } from "@playwright/test";

const LOCALES = [
  { prefix: "", lang: "sv", path: "/cv" },
  { prefix: "/en", lang: "en", path: "/en/cv" },
];

for (const locale of LOCALES) {
  test.describe(`CV page — ${locale.lang} (${locale.path})`, () => {
    test("renders with correct html lang", async ({ page }) => {
      await page.goto(locale.path);
      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toBe(locale.lang);
    });

    test("has header with name", async ({ page }) => {
      await page.goto(locale.path);
      const h1 = await page.locator("h1").first().textContent();
      expect(h1).toContain("WILLIAM BERNTING");
    });

    test("has all major sections", async ({ page }) => {
      await page.goto(locale.path);
      const sections = await page.locator(".section-title").allTextContents();
      const sectionTexts = sections.map((s) => s.toLowerCase());

      // Work history appears twice (page 1 and page 2)
      const hasWorkHistory = sectionTexts.filter((s) =>
        s.includes("work history") || s.includes("arbetshistorik")
      ).length >= 2;
      expect(hasWorkHistory).toBe(true);

      // Other sections should appear once each
      const expectedSections = locale.lang === "sv"
        ? ["intro", "favoritböcker", "tillkännagivanden", "egenskaper", "kompetenser", "favoritcitat", "språk", "utbildning", "samhällsengagemang"]
        : ["intro", "favorite books", "acknowledgements", "traits", "skills", "favorite quote", "languages", "education", "community"];

      for (const section of expectedSections) {
        const found = sectionTexts.some((s) => s.includes(section));
        expect(found, `Missing section: ${section}`).toBe(true);
      }
    });

    test("jobs have bullets and tech stacks", async ({ page }) => {
      await page.goto(locale.path);

      // At least some jobs should have bullets
      const bullets = await page.locator(".job-tasks li").count();
      expect(bullets).toBeGreaterThan(5);

      // At least some jobs should have tech stacks
      const techStacks = await page.locator(".job-tech").count();
      expect(techStacks).toBeGreaterThan(3);
    });

    test("has two pages", async ({ page }) => {
      await page.goto(locale.path);
      const pages = await page.locator(".page").count();
      expect(pages).toBe(2);
    });

    test("has back-to-site link", async ({ page }) => {
      await page.goto(locale.path);
      const backLink = page.locator(".cv-back-link");
      await expect(backLink).toBeVisible();
      const href = await backLink.getAttribute("href");
      if (locale.lang === "sv") {
        expect(href).toBe("/");
      } else {
        expect(href).toBe("/en/");
      }
    });

    test("language dots render for all languages", async ({ page }) => {
      await page.goto(locale.path);
      const langItems = await page.locator(".language-item").count();
      expect(langItems).toBe(4);
    });

    test("skills tags render", async ({ page }) => {
      await page.goto(locale.path);
      const skills = await page.locator(".skill-tag").count();
      expect(skills).toBe(12);
    });

    test("hreflang tags are present", async ({ page }) => {
      await page.goto(locale.path);
      const svHref = await page.locator('link[hreflang="sv"]').getAttribute("href");
      const enHref = await page.locator('link[hreflang="en"]').getAttribute("href");
      expect(svHref).toBeTruthy();
      expect(enHref).toBeTruthy();
    });
  });
}

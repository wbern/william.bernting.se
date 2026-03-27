import { test, expect } from "@playwright/test";

const SLIDES = [
  "hero",
  "projects",
  "stats",
  "traits",
  "timeline",
  "skills",
  "quote",
] as const;

// Hero CSS animations finish at ~3.2s + 1s buffer
const HERO_WAIT_MS = 4200;
// keen-slider transition duration (800ms) + reveal animations (~700ms + delays up to 600ms) + buffer
const SLIDE_TRANSITION_MS = 2600;

const LOCALES = [
  { prefix: "", label: "sv" },
  { prefix: "/en", label: "en" },
];

/** Navigate to a slide index and wait for its reveal animations. */
async function goToSlide(page: import("@playwright/test").Page, index: number) {
  if (index === 0) {
    await page.waitForTimeout(HERO_WAIT_MS);
  } else {
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(SLIDE_TRANSITION_MS);
  }

  await page.waitForFunction(
    (slideIndex) => {
      const slides = document.querySelectorAll(".keen-slider__slide");
      const slide = slides[slideIndex];
      if (!slide) return false;
      const reveals = slide.querySelectorAll(".reveal");
      if (reveals.length === 0) return true;
      return Array.from(reveals).every((el) =>
        el.classList.contains("visible"),
      );
    },
    index,
    { timeout: 5000 },
  );
}

for (const locale of LOCALES) {
  test.describe(`[${locale.label}]`, () => {
    test("screenshot every slide", async ({ page }, testInfo) => {
      await page.goto(locale.prefix + "/");
      await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });
      await page.click("body");

      for (let i = 0; i < SLIDES.length; i++) {
        await goToSlide(page, i);

        const project = testInfo.project.name;
        await page.screenshot({
          path: `test-results/${locale.label}-${project}-${String(i + 1).padStart(2, "0")}-${SLIDES[i]}.png`,
          fullPage: false,
        });
      }
    });

    test("no slide content clipped without being scrollable", async ({ page }) => {
      await page.goto(locale.prefix + "/");
      await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });
      await page.click("body");

      for (let i = 0; i < SLIDES.length; i++) {
        await goToSlide(page, i);

        const result = await page.evaluate((slideIndex) => {
          const slide = document.querySelectorAll(".keen-slider__slide")[slideIndex] as HTMLElement;
          if (!slide) return { ok: false, reason: "slide not found" };

          const child = slide.firstElementChild as HTMLElement;
          if (!child) return { ok: true, reason: "empty slide" };

          const slideRect = slide.getBoundingClientRect();
          const childRect = child.getBoundingClientRect();

          const overflowsTop = childRect.top < slideRect.top - 1;
          const overflowsBottom = childRect.bottom > slideRect.bottom + 1;
          const isScrollable = slide.scrollHeight > slide.clientHeight + 1;

          if ((overflowsTop || overflowsBottom) && !isScrollable) {
            return {
              ok: false,
              reason: `content clipped (top: ${Math.round(childRect.top - slideRect.top)}px, bottom: ${Math.round(childRect.bottom - slideRect.bottom)}px) but slide is not scrollable`,
            };
          }

          return { ok: true, reason: isScrollable ? "scrollable" : "fits" };
        }, i);

        expect(result.ok, `Slide ${i} "${SLIDES[i]}": ${result.reason}`).toBe(true);
      }
    });
  });
}

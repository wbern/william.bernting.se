import { test, expect } from "@playwright/test";

const LOCALES = [
  { prefix: "", label: "sv", spin: "Snurra", open: "Visa", back: "Tillbaka" },
  { prefix: "/en", label: "en", spin: "Spin", open: "Open", back: "Back" },
];

/** Navigate to the projects slide (index 1) and wait for reveals. */
async function goToProjectsSlide(
  page: import("@playwright/test").Page,
  prefix: string,
) {
  await page.goto(prefix + "/", { waitUntil: "networkidle" });
  await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });
  await page.click("body");

  // Wait for hero animations, then navigate to slide 1
  await page.waitForTimeout(4500);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(3000);

  // Wait for reveal animations on the projects slide
  await page.waitForFunction(
    () => {
      const slides = document.querySelectorAll(
        "#slider > .keen-slider__slide",
      );
      const slide = slides[1];
      if (!slide) return false;
      const reveals = slide.querySelectorAll(".reveal");
      if (reveals.length === 0) return true;
      return Array.from(reveals).every((el) =>
        el.classList.contains("visible"),
      );
    },
    { timeout: 10_000 },
  );
}

for (const locale of LOCALES) {
  test.describe(`[${locale.label}]`, () => {
    test.setTimeout(60_000);
    test("roller renders with project items", async ({ page }) => {
      await goToProjectsSlide(page, locale.prefix);

      const roller = page.locator("[data-testid='roller']");
      await expect(roller).toBeVisible();

      // All 13 project slides are in the DOM
      const bars = roller.locator(".roller-slide");
      const count = await bars.count();
      expect(count).toBe(13);
    });

    test("displays a highlighted current selection", async ({ page }) => {
      await goToProjectsSlide(page, locale.prefix);

      const selected = page.locator("[data-testid='roller-selected']");
      await expect(selected).toHaveCount(1);

      await expect(selected).toHaveClass(/roller-slide--selected/);
    });

    test("manual navigation with arrow buttons", async ({ page }) => {
      await goToProjectsSlide(page, locale.prefix);

      const selectedTitle = () =>
        page.locator(
          "[data-testid='roller-selected'] .roller-slide__title",
        );

      const initialText = await selectedTitle().textContent();

      await page.click("[data-testid='roller-arrow-down']");
      await page.waitForTimeout(500);

      const afterDown = await selectedTitle().textContent();
      expect(afterDown).not.toBe(initialText);

      await page.click("[data-testid='roller-arrow-up']");
      await page.waitForTimeout(500);

      const afterUp = await selectedTitle().textContent();
      expect(afterUp).toBe(initialText);
    });

    test("keyboard navigation on focused roller", async ({ page }) => {
      await goToProjectsSlide(page, locale.prefix);

      await page.locator("[data-testid='roller']").focus();

      const selectedTitle = () =>
        page.locator(
          "[data-testid='roller-selected'] .roller-slide__title",
        );

      const initialText = await selectedTitle().textContent();

      await page.locator("[data-testid='roller']").press("ArrowDown");
      await page.waitForTimeout(500);

      const afterDown = await selectedTitle().textContent();
      expect(afterDown).not.toBe(initialText);

      await page.locator("[data-testid='roller']").press("ArrowUp");
      await page.waitForTimeout(500);

      const afterUp = await selectedTitle().textContent();
      expect(afterUp).toBe(initialText);
    });

    test("spin button exists and triggers spinning state", async ({
      page,
    }) => {
      await goToProjectsSlide(page, locale.prefix);

      const spinBtn = page.locator("[data-testid='spin-button']");
      await expect(spinBtn).toBeVisible();
      await expect(spinBtn).toContainText(locale.spin);

      await spinBtn.click();

      const viewport = page.locator("[data-testid='roller']");
      await expect(viewport).toHaveClass(/roller-spinning/, {
        timeout: 1000,
      });
    });

    test("spin lands and auto-transitions to detail view, back returns", async ({
      page,
    }) => {
      await goToProjectsSlide(page, locale.prefix);

      await page.click("[data-testid='spin-button']");

      // Wait for detail-active class (spin → auto-open)
      await page.waitForFunction(
        () => {
          const section = document.querySelector(
            "[data-testid='projects-section']",
          );
          return section && section.classList.contains("detail-active");
        },
        { timeout: 15000 },
      );

      // Detail card visible with tag, title, description
      const detailCard = page.locator("[data-testid='detail-card']");
      await expect(detailCard).toBeVisible();
      await expect(detailCard.locator(".project-tag")).not.toBeEmpty();
      await expect(detailCard.locator("h3")).not.toBeEmpty();
      await expect(detailCard.locator("p")).not.toBeEmpty();

      // Back button returns to roller
      const backBtn = page.locator("[data-testid='back-button']");
      await expect(backBtn).toBeVisible();
      await backBtn.click();
      await page.waitForTimeout(700);

      await expect(
        page.locator("[data-testid='roller-view']"),
      ).toBeVisible();
    });

    test("open button transitions to detail view", async ({ page }) => {
      await goToProjectsSlide(page, locale.prefix);

      const openBtn = page.locator("[data-testid='open-button']");
      await expect(openBtn).toBeVisible();
      await expect(openBtn).toContainText(locale.open);

      await openBtn.click();
      await page.waitForTimeout(600);

      const section = page.locator("[data-testid='projects-section']");
      await expect(section).toHaveClass(/detail-active/);

      await expect(
        page.locator("[data-testid='detail-card'] h3"),
      ).not.toBeEmpty();
    });

    /* ===== Diorama illustration tests ===== */

    test("diorama renders for Community Assistant (index 0)", async ({
      page,
    }) => {
      await goToProjectsSlide(page, locale.prefix);

      // Index 0 is the default selection — open the detail view
      const openBtn = page.locator("[data-testid='open-button']");
      await openBtn.click();
      await page.waitForTimeout(600);

      const diorama = page.locator(
        "[data-testid='detail-card'] .diorama",
      );
      await expect(diorama).toBeVisible();
      await expect(diorama.locator("svg")).toBeVisible();

      // Verify all four diorama element groups are present
      await expect(diorama.locator(".diorama-el--center")).toHaveCount(1);
      await expect(diorama.locator(".diorama-el--left")).toHaveCount(1);
      await expect(diorama.locator(".diorama-el--right")).toHaveCount(1);
      await expect(diorama.locator(".diorama-el--back")).toHaveCount(1);

      // Screenshots for visual inspection
      await page.waitForTimeout(400); // let curtain animation settle
      await page
        .locator("[data-testid='detail-card']")
        .screenshot({
          path: `test-results/${locale.label}-diorama-community-assistant.png`,
        });
      await page.screenshot({
        path: `test-results/${locale.label}-diorama-community-assistant-viewport.png`,
      });
    });

    test("detail card with diorama fits inside viewport", async ({
      page,
    }) => {
      await goToProjectsSlide(page, locale.prefix);

      const openBtn = page.locator("[data-testid='open-button']");
      await openBtn.click();
      await page.waitForTimeout(600);

      const viewport = page.viewportSize()!;
      const card = page.locator("[data-testid='detail-card']");
      const cardBox = (await card.boundingBox())!;

      // Card must not overflow the viewport horizontally
      expect(cardBox.x).toBeGreaterThanOrEqual(0);
      expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(
        viewport.width + 1,
      );

      // Card bottom must not exceed viewport height
      expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(
        viewport.height,
      );

      // Diorama (if present) must sit inside the card
      const diorama = card.locator(".diorama");
      if ((await diorama.count()) > 0) {
        const dioBox = (await diorama.boundingBox())!;
        expect(dioBox.x).toBeGreaterThanOrEqual(cardBox.x);
        expect(dioBox.y).toBeGreaterThanOrEqual(cardBox.y);
        expect(dioBox.x + dioBox.width).toBeLessThanOrEqual(
          cardBox.x + cardBox.width + 1,
        );
        expect(dioBox.y + dioBox.height).toBeLessThanOrEqual(
          cardBox.y + cardBox.height + 1,
        );
      }

      // Back button must be visible (not pushed off top)
      const backBtn = page.locator("[data-testid='back-button']");
      const backBox = (await backBtn.boundingBox())!;
      expect(backBox.y).toBeGreaterThanOrEqual(0);
      expect(backBox.y + backBox.height).toBeLessThanOrEqual(
        viewport.height,
      );
    });

    test("slide dots are hidden when detail view is open", async ({
      page,
    }) => {
      await goToProjectsSlide(page, locale.prefix);

      const dots = page.locator("#slide-dots");
      await expect(dots).toBeVisible();

      // Open detail view
      await page.locator("[data-testid='open-button']").click();
      await page.waitForTimeout(600);

      // Dots should be hidden (not overlapping card content)
      await expect(dots).toHaveClass(/hidden/);
      const opacity = await dots.evaluate(
        (el) => getComputedStyle(el).opacity,
      );
      expect(opacity).toBe("0");

      // Go back — dots should reappear
      await page.locator("[data-testid='back-button']").click();
      await page.waitForTimeout(600);
      await expect(dots).not.toHaveClass(/hidden/);
    });

    test("diorama SVG content is not clipped on mobile", async ({
      page,
    }) => {
      await goToProjectsSlide(page, locale.prefix);

      const openBtn = page.locator("[data-testid='open-button']");
      await openBtn.click();
      await page.waitForTimeout(800); // wait for curtain-reveal animation

      const diorama = page.locator(
        "[data-testid='detail-card'] .diorama",
      );
      if ((await diorama.count()) === 0) return;

      const clipped = await diorama.evaluate((container) => {
        const svg = container.querySelector("svg")!;
        const vb = svg.viewBox.baseVal;
        const svgRect = svg.getBoundingClientRect();

        const scaleX = svgRect.width / vb.width;
        const scaleY = svgRect.height / vb.height;

        const style = getComputedStyle(container);
        const radius = parseFloat(style.borderRadius) || 0;

        const radiusVbX = radius / scaleX;
        const radiusVbY = radius / scaleY;

        const groups = [
          ".diorama-el--left",
          ".diorama-el--center",
          ".diorama-el--right",
        ];
        const issues: string[] = [];

        for (const sel of groups) {
          const g = svg.querySelector(sel) as SVGGraphicsElement | null;
          if (!g) continue;

          const bbox = g.getBBox();

          if (bbox.x < vb.x) {
            issues.push(
              `${sel} left edge (${bbox.x}) extends past viewBox left (${vb.x})`,
            );
          }
          if (bbox.x + bbox.width > vb.x + vb.width) {
            issues.push(
              `${sel} right edge (${bbox.x + bbox.width}) extends past viewBox right (${vb.x + vb.width})`,
            );
          }
          if (bbox.y < vb.y) {
            issues.push(
              `${sel} top edge (${bbox.y}) extends past viewBox top (${vb.y})`,
            );
          }
          if (bbox.y + bbox.height > vb.y + vb.height) {
            issues.push(
              `${sel} bottom edge (${bbox.y + bbox.height}) extends past viewBox bottom (${vb.y + vb.height})`,
            );
          }

          const inTopLeft =
            bbox.x < vb.x + radiusVbX && bbox.y < vb.y + radiusVbY;
          const inTopRight =
            bbox.x + bbox.width > vb.x + vb.width - radiusVbX &&
            bbox.y < vb.y + radiusVbY;
          const inBotLeft =
            bbox.x < vb.x + radiusVbX &&
            bbox.y + bbox.height > vb.y + vb.height - radiusVbY;
          const inBotRight =
            bbox.x + bbox.width > vb.x + vb.width - radiusVbX &&
            bbox.y + bbox.height > vb.y + vb.height - radiusVbY;

          if (inTopLeft || inTopRight || inBotLeft || inBotRight) {
            issues.push(
              `${sel} overlaps border-radius corner zone (radius ~${radiusVbX.toFixed(0)}vb units)`,
            );
          }

          const marginLeft = (bbox.x - vb.x) / vb.width;
          const marginRight =
            (vb.x + vb.width - (bbox.x + bbox.width)) / vb.width;
          if (marginLeft < 0.04) {
            issues.push(
              `${sel} left margin is only ${(marginLeft * 100).toFixed(1)}% (min 4%)`,
            );
          }
          if (marginRight < 0.04) {
            issues.push(
              `${sel} right margin is only ${(marginRight * 100).toFixed(1)}% (min 4%)`,
            );
          }
        }

        return issues;
      });

      expect(
        clipped,
        `Diorama content clipping issues:\n${clipped.join("\n")}`,
      ).toEqual([]);
    });

    test("wheel events inside roller do not change the page slide", async ({
      page,
    }) => {
      await goToProjectsSlide(page, locale.prefix);

      // Record which keen-slider slide we're on (should be index 1 = Projects)
      const slideIndexBefore = await page.evaluate(() => {
        const slides = document.querySelectorAll(
          "#slider > .keen-slider__slide",
        );
        for (let i = 0; i < slides.length; i++) {
          const rect = slides[i].getBoundingClientRect();
          if (rect.top >= -1 && rect.top < window.innerHeight) return i;
        }
        return -1;
      });

      // Scroll down multiple times on the roller
      const roller = page.locator("[data-testid='roller']");
      await roller.hover();
      for (let i = 0; i < 5; i++) {
        await roller.evaluate((el) =>
          el.dispatchEvent(
            new WheelEvent("wheel", {
              deltaY: 120,
              bubbles: true,
              cancelable: true,
            }),
          ),
        );
        await page.waitForTimeout(100);
      }
      await page.waitForTimeout(500);

      // The page slide must NOT have changed
      const slideIndexAfter = await page.evaluate(() => {
        const slides = document.querySelectorAll(
          "#slider > .keen-slider__slide",
        );
        for (let i = 0; i < slides.length; i++) {
          const rect = slides[i].getBoundingClientRect();
          if (rect.top >= -1 && rect.top < window.innerHeight) return i;
        }
        return -1;
      });

      expect(slideIndexAfter).toBe(slideIndexBefore);
    });

    test("no diorama for project without illustration", async ({
      page,
    }) => {
      await goToProjectsSlide(page, locale.prefix);

      // Navigate to index 2 (Agentic DLL Decompilation) which has no illustration
      await page.click("[data-testid='roller-arrow-down']");
      await page.waitForTimeout(500);
      await page.click("[data-testid='roller-arrow-down']");
      await page.waitForTimeout(500);

      const openBtn = page.locator("[data-testid='open-button']");
      await openBtn.click();
      await page.waitForTimeout(600);

      const detailCard = page.locator("[data-testid='detail-card']");
      await expect(detailCard).toBeVisible();

      // No diorama should be injected
      const diorama = detailCard.locator(".diorama");
      await expect(diorama).toHaveCount(0);

      // But text content should still be present
      await expect(detailCard.locator("h3")).not.toBeEmpty();
    });

    test("touch drag inside roller does not change the page slide", async ({
      page,
      browserName,
    }, testInfo) => {
      // Touch drag is only relevant on touch-enabled devices
      if (!testInfo.project.use?.hasTouch) {
        test.skip();
        return;
      }

      await goToProjectsSlide(page, locale.prefix);

      const slideIndexBefore = await page.evaluate(() => {
        const slides = document.querySelectorAll(
          "#slider > .keen-slider__slide",
        );
        for (let i = 0; i < slides.length; i++) {
          const rect = slides[i].getBoundingClientRect();
          if (rect.top >= -1 && rect.top < window.innerHeight) return i;
        }
        return -1;
      });

      // Simulate a vertical touch drag on the roller
      const roller = page.locator("[data-testid='roller']");
      const rollerBox = (await roller.boundingBox())!;
      const cx = rollerBox.x + rollerBox.width / 2;
      const startY = rollerBox.y + rollerBox.height / 2;

      await page.mouse.move(cx, startY);
      await page.mouse.down();
      for (let i = 1; i <= 5; i++) {
        await page.waitForTimeout(50);
        await page.mouse.move(cx, startY + i * 30);
      }
      await page.mouse.up();
      await page.waitForTimeout(1000);

      const slideIndexAfter = await page.evaluate(() => {
        const slides = document.querySelectorAll(
          "#slider > .keen-slider__slide",
        );
        for (let i = 0; i < slides.length; i++) {
          const rect = slides[i].getBoundingClientRect();
          if (rect.top >= -1 && rect.top < window.innerHeight) return i;
        }
        return -1;
      });

      expect(slideIndexAfter).toBe(slideIndexBefore);
    });

    /* ===== Deep linking tests ===== */

    test("deep link to #pixi-platformer opens detail view", async ({ page }) => {
      await page.goto(locale.prefix + "/#pixi-platformer", { waitUntil: "networkidle" });
      await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });

      // Wait for detail-active class (deep link → auto-open)
      await page.waitForFunction(
        () => {
          const section = document.querySelector("[data-testid='projects-section']");
          return section && section.classList.contains("detail-active");
        },
        { timeout: 15000 },
      );

      const detailCard = page.locator("[data-testid='detail-card']");
      await expect(detailCard).toBeVisible();
      await expect(detailCard.locator("h3")).toHaveText("Pixi Platformer");
    });

    test("deep link to #community-assistant opens detail view", async ({ page }) => {
      await page.goto(locale.prefix + "/#community-assistant", { waitUntil: "networkidle" });
      await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });

      await page.waitForFunction(
        () => {
          const section = document.querySelector("[data-testid='projects-section']");
          return section && section.classList.contains("detail-active");
        },
        { timeout: 15000 },
      );

      const detailCard = page.locator("[data-testid='detail-card']");
      await expect(detailCard).toBeVisible();
      await expect(detailCard.locator("h3")).toHaveText("Community Assistant");
    });

    test("invalid hash does not crash and auto-spin still works", async ({ page }) => {
      await page.goto(locale.prefix + "/#nonexistent-project", { waitUntil: "networkidle" });
      await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });

      // The invalid hash still triggers navigation to the projects slide
      // Auto-spin should fire since hash doesn't match any slug
      await page.waitForFunction(
        () => {
          const section = document.querySelector("[data-testid='projects-section']");
          return section && section.classList.contains("detail-active");
        },
        { timeout: 15000 },
      );

      // If we reached detail-active, auto-spin completed and opened detail
      const detailCard = page.locator("[data-testid='detail-card']");
      await expect(detailCard).toBeVisible();
    });

    test("hash updates when opening and closing detail view", async ({ page }) => {
      await goToProjectsSlide(page, locale.prefix);

      // Auto-spin has landed and opened detail view
      await page.waitForFunction(
        () => document.querySelector("[data-testid='projects-section']")?.classList.contains("detail-active"),
        { timeout: 15000 },
      );

      // Hash should be set after auto-spin opens detail
      const hashAfterOpen = await page.evaluate(() => location.hash);
      expect(hashAfterOpen).toMatch(/^#.+/);

      // Close detail view
      await page.locator("[data-testid='back-button']").click();
      await page.waitForTimeout(600);

      // Hash should be cleared
      const hashAfterClose = await page.evaluate(() => location.hash);
      expect(hashAfterClose).toBe("");
    });

    test("projects slide fits viewport after closing detail view", async ({ page }, testInfo) => {
      if (testInfo.project.name !== "mobile") {
        test.skip();
        return;
      }

      await goToProjectsSlide(page, locale.prefix);

      // Open detail view via spin (auto-transitions to detail)
      await page.locator("[data-testid='spin-button']").click({ force: true });
      await page.waitForFunction(
        () => document.querySelector("[data-testid='projects-section']")?.classList.contains("detail-active"),
        { timeout: 15000 },
      );

      // Close detail view
      await page.click("[data-testid='back-button']");
      await page.waitForTimeout(600);
      await expect(page.locator("[data-testid='projects-section']")).not.toHaveClass(/detail-active/);

      // The slide's content should not exceed the viewport height
      const result = await page.evaluate(() => {
        const slide = document.querySelectorAll("#slider > .keen-slider__slide")[1] as HTMLElement;
        if (!slide) return { ok: false, reason: "slide not found" };

        const child = slide.firstElementChild as HTMLElement;
        if (!child) return { ok: true, reason: "empty slide" };

        const slideHeight = slide.clientHeight;
        const contentHeight = child.scrollHeight;

        return {
          ok: contentHeight <= slideHeight + 1,
          reason: `content=${contentHeight}px, slide=${slideHeight}px (overflow: ${contentHeight - slideHeight}px)`,
        };
      });

      expect(result.ok, `Projects slide overflows after closing detail: ${result.reason}`).toBe(true);
    });

    test("roulette is centered after scrolling detail card and navigating away then back", async ({ page }, testInfo) => {
      if (testInfo.project.name !== "mobile") {
        test.skip();
        return;
      }

      // Deep-link directly to Chess Reel (long content) to open its detail view
      await page.goto(locale.prefix + "/#chess-reel", { waitUntil: "networkidle" });
      await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });

      // Wait for detail view to open via deep link
      await page.waitForFunction(
        () => document.querySelector("[data-testid='projects-section']")?.classList.contains("detail-active"),
        { timeout: 15000 },
      );
      await page.waitForTimeout(600);

      // Scroll down inside the slide to simulate reading the long card content
      const slide = page.locator("#slider > .keen-slider__slide").nth(1);
      await slide.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await page.waitForTimeout(300);

      // Verify the slide is actually scrolled
      const scrollTopBefore = await slide.evaluate((el) => el.scrollTop);
      expect(scrollTopBefore).toBeGreaterThan(0);

      // Navigate to next slide (ArrowDown triggers keen-slider since slide is at scroll bottom)
      // Use evaluate to dispatch wheel event to trigger keen-slider navigation
      await slide.evaluate((el) => {
        el.dispatchEvent(new WheelEvent("wheel", { deltaY: 120, bubbles: true, cancelable: true }));
      });
      await page.waitForTimeout(1000);

      // Navigate back to projects slide
      await page.keyboard.press("ArrowUp");
      await page.waitForTimeout(1500);

      // The slide's scrollTop should be reset to 0
      const scrollTopAfter = await slide.evaluate((el) => el.scrollTop);
      expect(scrollTopAfter, "Slide scrollTop should reset to 0 after returning").toBe(0);

      // The roller section should be vertically centered in the viewport
      const rollerSection = page.locator("[data-testid='projects-section']");
      const sectionBox = (await rollerSection.boundingBox())!;
      const viewport = page.viewportSize()!;

      // The roller section should be fully visible (not offset below the viewport)
      expect(sectionBox.y, "Roller section should not be pushed below viewport top").toBeGreaterThanOrEqual(-10);
      expect(
        sectionBox.y + sectionBox.height,
        "Roller section bottom should be within viewport",
      ).toBeLessThanOrEqual(viewport.height + 10);
    });
  });
}

import { test, expect, type Page } from "@playwright/test";

/**
 * Mask themes: drag a mask from the tray onto the greeting to re-theme the site.
 */

const HERO_WAIT_MS = 1600;
const SLIDE_MS = 900;

async function open(page: Page, prefix = "") {
  await page.goto(prefix + "/");
  await page.waitForSelector("#slider[data-keen-slider-v]");
  await page.waitForTimeout(HERO_WAIT_MS);
}

async function centre(page: Page, selector: string) {
  const box = (await page.locator(selector).boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * Drag with the mouse (desktop) or a synthesized touch + pointer sequence
 * (mobile; Playwright has no touch drag API). The touch events bubble from the
 * mask, so keen-slider's own touchstart/touchmove listeners on the container
 * see exactly what they would in a real swipe unless the mask stops them.
 */
async function drag(page: Page, from: { x: number; y: number }, to: { x: number; y: number }, touch: boolean) {
  const steps = 10;
  const points = Array.from({ length: steps + 1 }, (_, i) => ({
    x: from.x + ((to.x - from.x) * i) / steps,
    y: from.y + ((to.y - from.y) * i) / steps,
  }));
  if (touch) {
    const fire = (type: "start" | "move" | "end", p: { x: number; y: number }) =>
      page.evaluate(({ type, p }) => {
        const w = window as any;
        if (type === "start") w.__maskTouchTarget = document.elementFromPoint(p.x, p.y);
        const el: Element = w.__maskTouchTarget;
        // WebKit has no Touch constructor; the handlers only need bubbling + cancelable
        const touchEvent = (name: string) => {
          const init = { bubbles: true, cancelable: true };
          try { return new TouchEvent(name, init); } catch { return new Event(name, init); }
        };
        const pointerInit = { pointerId: 7, pointerType: "touch", clientX: p.x, clientY: p.y, bubbles: true, cancelable: true, isPrimary: true, button: 0 };
        if (type === "end") {
          el.dispatchEvent(new PointerEvent("pointerup", pointerInit));
          el.dispatchEvent(touchEvent("touchend"));
        } else {
          el.dispatchEvent(touchEvent(`touch${type}`));
          el.dispatchEvent(new PointerEvent(`pointer${type === "start" ? "down" : "move"}`, pointerInit));
        }
      }, { type, p });
    await fire("start", from);
    for (const p of points.slice(1)) {
      await fire("move", p);
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(150);
    await fire("end", to);
  } else {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    for (const p of points.slice(1)) {
      await page.mouse.move(p.x, p.y);
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(150);
    await page.mouse.up();
  }
}

async function dragToFace(page: Page, mask: string, touch: boolean) {
  await drag(page, await centre(page, `[data-mask-slot="${mask}"]`), await centre(page, "[data-mask-zone]"), touch);
}

const maskAttr = (page: Page) => page.evaluate(() => document.documentElement.getAttribute("data-mask"));
const stored = (page: Page) => page.evaluate(() => localStorage.getItem("wb-mask"));

test.describe("masks", () => {
  test("tray is present and nothing is worn by default", async ({ page }) => {
    await open(page);
    await expect(page.locator("[data-mask-slot]")).toHaveCount(3);
    expect(await maskAttr(page)).toBeNull();
    await expect(page.locator("[data-mask-worn]")).toBeHidden();
    expect(await page.locator(".vhs").evaluate((el) => getComputedStyle(el).display)).toBe("none");
    expect(await page.locator(".slop").evaluate((el) => getComputedStyle(el).display)).toBe("none");
  });

  test("drag a mask onto the greeting to equip it; the slider stays put", async ({ page }, testInfo) => {
    await open(page);
    const touch = testInfo.project.name === "mobile";
    await dragToFace(page, "past", touch);
    await page.waitForTimeout(300);
    expect(await maskAttr(page)).toBe("past");
    expect(await stored(page)).toBe("past");
    await expect(page.locator("[data-mask-worn]")).toBeVisible();
    await expect(page.locator('[data-mask-slot="past"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", "0");
    await expect(page.locator(".vhs")).toBeVisible();
    await expect(page.locator(".vhs-play")).toContainText("PLAY");
  });

  test("dropping anywhere else springs the mask back", async ({ page }, testInfo) => {
    await open(page);
    const touch = testInfo.project.name === "mobile";
    const from = await centre(page, '[data-mask-slot="present"]');
    await drag(page, from, { x: 60, y: from.y - 160 }, touch);
    await page.waitForTimeout(600);
    expect(await maskAttr(page)).toBeNull();
    await expect(page.locator(".mask-ghost")).toHaveCount(0);
    await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", "0");
  });

  test("keyboard: Enter equips, aria-pressed and live region update, Escape takes it off", async ({ page }) => {
    await open(page);
    const slot = page.locator('[data-mask-slot="present"]');
    await slot.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    expect(await maskAttr(page)).toBe("present");
    await expect(slot).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-mask-live]")).toContainText(/Nutid|Present/);
    await expect(page.locator(".slop-ticker")).toBeVisible();

    const worn = page.locator("[data-mask-worn]");
    await expect(worn).toBeVisible();
    await worn.focus();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    expect(await maskAttr(page)).toBeNull();
    await expect(slot).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-mask-live]")).toContainText(/Masken är av|Mask off/);
  });

  test("swap: dropping another mask replaces the worn one", async ({ page }, testInfo) => {
    await open(page);
    const touch = testInfo.project.name === "mobile";
    await dragToFace(page, "past", touch);
    await page.waitForTimeout(300);
    expect(await maskAttr(page)).toBe("past");
    await dragToFace(page, "future", touch);
    await page.waitForTimeout(300);
    expect(await maskAttr(page)).toBe("future");
    await expect(page.locator('[data-mask-slot="past"]')).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('[data-mask-slot="future"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-mask-worn] use")).toHaveAttribute("href", "#mask-future");
  });

  test("take off: clicking the worn mask restores the default theme", async ({ page }) => {
    await open(page);
    await page.locator('[data-mask-slot="past"]').click();
    await page.waitForTimeout(300);
    expect(await maskAttr(page)).toBe("past");
    await page.locator("[data-mask-worn]").click();
    await page.waitForTimeout(300);
    expect(await maskAttr(page)).toBeNull();
    expect(await stored(page)).toBeNull();
    await expect(page.locator("[data-mask-worn]")).toBeHidden();
    await expect(page.locator(".hero-greeting")).toBeVisible();
  });

  test("persists across reload and between languages, applied before first paint", async ({ page }) => {
    await open(page);
    await page.locator('[data-mask-slot="future"]').click();
    await page.waitForTimeout(300);
    await page.reload();
    // The inline head script sets the attribute before any component script runs
    expect(await page.evaluate(() => document.documentElement.getAttribute("data-mask"))).toBe("future");
    await page.goto("/en/");
    expect(await maskAttr(page)).toBe("future");
    await page.waitForTimeout(500);
    await expect(page.locator("[data-mask-worn]")).toBeVisible();
    await expect(page.locator('[data-mask-slot="future"]')).toHaveAttribute("aria-pressed", "true");
  });

  for (const locale of [
    { prefix: "", lines: ["Människa", "Byggt: 1", "Anställningsbar", "15 år", "Kompatibel", "Anställ?"] },
    { prefix: "/en", lines: ["Human", "Built: 1", "Hireable", "15 years", "Compatible", "Hire?"] },
  ]) {
    test(`future [${locale.prefix || "sv"}]: only the name and one sentence per slide, navigation still works`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("wb-mask", "future"));
      await open(page, locale.prefix);
      await page.click("body", { position: { x: 4, y: 4 } });
      await expect(page.locator(".hero-slide h1")).toBeVisible();
      await expect(page.locator(".hero-tagline")).toBeHidden();
      await expect(page.locator(".hero-contact")).toBeHidden();
      await expect(page.locator(".hero-marquee-top")).toBeHidden();

      for (let i = 0; i < 6; i++) {
        if (i > 0) {
          await page.keyboard.press("ArrowDown");
          await page.waitForTimeout(SLIDE_MS);
        }
        await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", String(i));
        const slide = page.locator("#slider > .keen-slider__slide").nth(i);
        const line = slide.locator("[data-future-line]");
        await expect(line).toBeVisible();
        await expect(line).toContainText(locale.lines[i]);
        // nothing else in the slide is rendered (the hero keeps its name)
        const visibleOthers = await slide.evaluate((el) => {
          const line = el.querySelector("[data-future-line]")!;
          return [...el.querySelectorAll<HTMLElement>("*")].filter((n) => {
            if (line.contains(n) || n === line) return false;
            if (n.closest(".mask-tray") || n.closest(".mask-sprite") || n.closest(".hero-face") || n.closest("h1")) return false;
            if (n.classList.contains("hero-slide") || n.classList.contains("hero-center")) return false;
            const r = n.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && getComputedStyle(n).visibility !== "hidden";
          }).map((n) => `${n.tagName}.${typeof n.className === "string" ? n.className : ""}`);
        });
        expect(visibleOthers, `slide ${i} leaks content`).toEqual([]);
      }
      await expect(page.locator("[data-future-line] a.future-email")).toHaveAttribute("href", /^mailto:/);
    });
  }

  for (const mask of ["past", "present"]) {
    test(`${mask}: every slide reachable and the overlay stays out of the way`, async ({ page }) => {
      await page.addInitScript((m) => localStorage.setItem("wb-mask", m), mask);
      await open(page);
      await page.click("body", { position: { x: 4, y: 4 } });
      for (let i = 1; i < 6; i++) {
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(SLIDE_MS);
        await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", String(i));
      }
      const overlay = page.locator(mask === "past" ? ".vhs" : ".slop");
      await expect(overlay).toBeVisible();
      expect(await overlay.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
      // the contact dock underneath is still clickable
      await expect(page.locator(".cta-primary")).toBeVisible();
    });
  }

  test("present: rejecting cookies cracks the glass; more rejects add cracks; taking the mask off clears them", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("wb-mask", "present"));
    await open(page);
    const reject = page.locator("[data-slop-cookie-reject]");
    await expect(reject).toBeVisible();
    await reject.click();
    const cracks = page.locator(".slop-cracks path");
    await expect.poll(() => cracks.count()).toBeGreaterThan(20);
    const first = await cracks.count();
    await expect(page.locator("[data-slop-cookie]")).toBeHidden();
    // the overlay never blocks the site
    expect(await page.locator(".slop-cracks").evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
    // the banner comes back, pleading
    await expect(page.locator("[data-slop-cookie-text]")).toHaveText(/Är du säker|Are you sure/, { timeout: 4000 });
    await reject.click();
    await expect.poll(() => cracks.count()).toBeGreaterThan(first);
    await expect(page.locator("[data-slop-cookie-text]")).toHaveText(/familj|families/, { timeout: 4000 });
    // taking the mask off clears the cracks
    await page.locator("[data-mask-worn]").click();
    await page.waitForTimeout(300);
    expect(await maskAttr(page)).toBeNull();
    await expect(cracks).toHaveCount(0);
  });

  test("present: clicking anywhere on a pop-up dismisses it", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("wb-mask", "present"));
    await open(page);
    const pop = page.locator(".slop-pop").first();
    await expect(pop).toBeVisible({ timeout: 4000 });
    await pop.click({ position: { x: 10, y: 10 } });
    await expect(page.locator(".slop-pop.is-leaving, .slop-pop")).toHaveCount(0, { timeout: 2000 });
  });

  test("past fonts are only fetched while the past mask is worn", async ({ page }) => {
    const fonts: string[] = [];
    page.on("request", (r) => { if (r.url().includes("/fonts/past/")) fonts.push(r.url().split("/").pop()!); });
    await open(page);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(SLIDE_MS);
    expect(fonts, "default theme must not load the VHS fonts").toEqual([]);
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(SLIDE_MS);
    await page.locator('[data-mask-slot="past"]').click();
    await expect.poll(() => fonts.length, { timeout: 5000 }).toBeGreaterThanOrEqual(2);
    expect(fonts).toEqual(expect.arrayContaining(["VT323-Regular.woff2", "Silkscreen-Bold.woff2"]));
    expect(await page.locator(".vhs-play").evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/VCR OSD/);
  });

  for (const mask of ["past", "present"]) {
    test(`${mask}: the skills bowl still accepts a drop`, async ({ page }, testInfo) => {
      await page.addInitScript((m) => localStorage.setItem("wb-mask", m), mask);
      await open(page);
      await page.click("body", { position: { x: 4, y: 4 } });
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(SLIDE_MS);
      }
      await page.waitForTimeout(1500);
      // clear any pop-up parked over the bowl, then drop
      for (const pop of await page.locator(".slop-pop").all()) await pop.click().catch(() => {});
      const canvas = (await page.locator(".skills-canvas").boundingBox())!;
      const x = canvas.x + canvas.width * 0.5;
      const y = canvas.y + canvas.height * 0.25;
      const before = await page.evaluate(() => (window as any).__skillsBowl.state().score as number);
      const fruitsBefore = await page.evaluate(() => (window as any).__skillsBowl.fruits().length as number);
      if (testInfo.project.name === "mobile") await page.touchscreen.tap(x, y);
      else { await page.mouse.move(x, y); await page.mouse.click(x, y); }
      await page.waitForTimeout(1200);
      const after = await page.evaluate(() => ({
        score: (window as any).__skillsBowl.state().score as number,
        fruits: (window as any).__skillsBowl.fruits().length as number,
      }));
      expect(after.fruits !== fruitsBefore || after.score > before, "a fruit should drop (or merge)").toBe(true);
    });
  }

  test("present: pop-ups can be dismissed and the cookie banner accepted", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("wb-mask", "present"));
    await open(page);
    const pop = page.locator(".slop-pop").first();
    await expect(pop).toBeVisible({ timeout: 4000 });
    await pop.locator("button").click();
    await expect(pop).toHaveCount(0, { timeout: 2000 });
    await page.locator("[data-slop-cookie-accept]").click();
    await expect(page.locator("[data-slop-cookie]")).toBeHidden();
    expect(await page.locator(".slop-rain span").count()).toBeLessThanOrEqual(24);
  });
});

test("reduced motion: themed look without rolling band, pouring emoji or pop-ups", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem("wb-mask", "present"));
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForTimeout(2500);
  expect(await page.locator(".slop-rain").evaluate((el) => getComputedStyle(el).display)).toBe("none");
  expect(await page.locator(".slop-ticker-track").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await expect(page.locator(".slop-pop")).toHaveCount(0);
  await page.evaluate(() => localStorage.setItem("wb-mask", "past"));
  await page.goto("/");
  await page.waitForTimeout(500);
  expect(await page.locator(".vhs-band").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await ctx.close();
});

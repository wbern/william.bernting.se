import { test, expect, chromium, type Page } from "@playwright/test";

/**
 * Mask themes: the three masks ride in the hero's marquee rows; drag one onto
 * the greeting to re-theme the site. Keyboard users use the [data-mask-key] chips.
 */

const HERO_WAIT_MS = 1600;
const SLIDE_MS = 900;
const SLIDES = 6;

async function open(page: Page, prefix = "") {
  await page.goto(prefix + "/");
  await page.waitForSelector("#slider[data-keen-slider-v]");
  await page.waitForTimeout(HERO_WAIT_MS);
}

async function centre(page: Page, selector: string) {
  const box = (await page.locator(selector).boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Centre of a marquee copy of the mask that is currently well inside the viewport (the rows move; wait for one). */
async function visibleMask(page: Page, mask: string) {
  const handle = await page.waitForFunction(
    (m) => {
      const el = [...document.querySelectorAll<HTMLElement>(`[data-mask-slot="${m}"]`)].find((e) => {
        const r = e.getBoundingClientRect();
        return r.left > 50 && r.right < innerWidth - 50;
      });
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    mask,
    { timeout: 30_000, polling: 100 },
  );
  return (await handle.jsonValue()) as { x: number; y: number };
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
  await drag(page, await visibleMask(page, mask), await centre(page, "[data-mask-zone]"), touch);
}

/** Keyboard path: the chips are hidden (and inert) until focused, so focus + Enter rather than click. */
async function equipByKey(page: Page, mask: string) {
  await page.locator(`[data-mask-key="${mask}"]`).focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
}

const maskAttr = (page: Page) => page.evaluate(() => document.documentElement.getAttribute("data-mask"));
const stored = (page: Page) => page.evaluate(() => localStorage.getItem("wb-mask"));

/** Horizontal overflow must never exist: window, document and every slide. */
async function assertNoHorizontalOverflow(page: Page, label: string) {
  const r = await page.evaluate(() => {
    const slides = [...document.querySelectorAll<HTMLElement>("#slider > .keen-slider__slide")];
    // elements poking out of the viewport that no overflow-clipping ancestor contains
    const culprits = (root: Element, right: number) => {
      const clipped = (el: Element) => { let p = el.parentElement; while (p && p !== root) { if (/hidden|clip|scroll|auto/.test(getComputedStyle(p).overflowX)) return true; p = p.parentElement; } return false; };
      return [...root.querySelectorAll<HTMLElement>("*")].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && (b.right > right + 1 || b.left < -1) && !clipped(el); })
        .slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join(".")}[${Math.round(el.getBoundingClientRect().left)}..${Math.round(el.getBoundingClientRect().right)}]`);
    };
    const active = slides.find((s) => !s.inert) ?? slides[0];
    return {
      scrollX: Math.round(scrollX),
      docWidth: document.documentElement.scrollWidth,
      inner: innerWidth,
      scrolledSlides: slides.map((s) => s.scrollLeft),
      activeExtra: active.scrollWidth - active.clientWidth,
      activeIndex: slides.indexOf(active),
      culprits: culprits(active, innerWidth),
      docCulprits: culprits(document.body, innerWidth).filter((c) => !c.startsWith("div.keen-slider__slide")),
    };
  });
  expect(r.scrollX, `${label}: window scrolled sideways`).toBe(0);
  expect(r.docWidth, `${label}: document wider than the viewport: ${r.docCulprits.join(", ")}`).toBeLessThanOrEqual(r.inner);
  expect(r.scrolledSlides, `${label}: a slide is scrolled sideways`).toEqual(r.scrolledSlides.map(() => 0));
  expect(r.activeExtra, `${label}: slide ${r.activeIndex} overflows horizontally: ${r.culprits.join(", ")}`).toBeLessThanOrEqual(0);
}

/** Click (or tap) the bowl's drop column and expect a drop or a merge. */
async function dropInBowl(page: Page, touch: boolean) {
  const canvas = (await page.locator(".skills-canvas").boundingBox())!;
  const x = canvas.x + canvas.width * 0.5;
  const y = canvas.y + canvas.height * 0.25;
  // A pop-up may sit on the drop column (one click dismisses it, by design): clear it and make sure the canvas is on top
  for (let attempt = 0; attempt < 4; attempt++) {
    for (const pop of await page.locator(".slop-pop").all()) await pop.click().catch(() => {});
    await page.waitForTimeout(400);
    const onCanvas = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.classList.contains("skills-canvas"), { x, y });
    if (onCanvas) break;
  }
  const before = await page.evaluate(() => {
    const b = (window as any).__skillsBowl;
    return { score: b.state().score as number, fruits: b.fruits().length as number };
  });
  if (touch) await page.touchscreen.tap(x, y);
  else { await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.up(); }
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => {
    const b = (window as any).__skillsBowl;
    return { score: b.state().score as number, fruits: b.fruits().length as number, gameOver: b.state().gameOver as boolean };
  });
  expect(after.fruits !== before.fruits || after.score > before.score, "a fruit should drop (or merge)").toBe(true);
  expect(after.gameOver, "a single drop must not end the game").toBe(false);
}

test.describe("masks", () => {
  test("masks ride in the marquee rows; nothing is worn by default", async ({ page }) => {
    await open(page);
    for (const id of ["past", "present", "future"]) {
      expect(await page.locator(`[data-mask-slot="${id}"]`).count(), `${id} copies in the marquee`).toBeGreaterThanOrEqual(2);
    }
    await expect(page.locator("[data-mask-key]")).toHaveCount(3);
    // each mask lives in its own row
    const rows = await page.evaluate(() => [...document.querySelectorAll("[data-mask-slot]")].map((el) => `${el.getAttribute("data-mask-slot")}:${[...document.querySelectorAll(".marquee-row")].indexOf(el.closest(".marquee-row")!)}`));
    expect(new Set(rows).size).toBe(3);
    expect(await maskAttr(page)).toBeNull();
    await expect(page.locator("[data-mask-worn]")).toBeHidden();
    expect(await page.locator(".vhs").evaluate((el) => getComputedStyle(el).display)).toBe("none");
    expect(await page.locator(".slop").evaluate((el) => getComputedStyle(el).display)).toBe("none");
    // the keyboard chips are hidden until focused
    expect(await page.locator("[data-mask-keys]").evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
  });

  test("drag a mask from the marquee onto the greeting to equip it; the slider stays put and the name never moves", async ({ page }, testInfo) => {
    await open(page);
    const touch = testInfo.project.name === "mobile";
    const nameBefore = (await page.locator(".hero-slide h1").boundingBox())!;
    const from = await visibleMask(page, "past");
    const to = await centre(page, "[data-mask-zone]");
    // lift the mask sideways (well outside the drop target) and check the layout mid-air, then let it spring back
    await drag(page, from, { x: 70, y: from.y }, touch);
    const nameDuring = (await page.locator(".hero-slide h1").boundingBox())!;
    expect(Math.abs(nameDuring.y - nameBefore.y), "the outline must not shift the layout").toBeLessThan(1);
    expect(await maskAttr(page)).toBeNull();
    await page.waitForTimeout(600);
    await dragToFace(page, "past", touch);
    await page.waitForTimeout(300);
    expect(await maskAttr(page)).toBe("past");
    expect(await stored(page)).toBe("past");
    await expect(page.locator("[data-mask-worn]")).toBeVisible();
    await expect(page.locator('[data-mask-key="past"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", "0");
    await expect(page.locator(".vhs")).toBeVisible();
    await expect(page.locator(".vhs-play")).toContainText("PLAY");
    // the "take off" caption is a hover tooltip, not visible text (move the pointer off the mask first)
    await page.mouse.move(5, 5);
    await page.waitForTimeout(250);
    expect(await page.locator(".hero-mask-off").evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    await expect(page.locator("[data-mask-worn]")).toHaveAttribute("aria-label", /Ta av masken|Take off the mask/);
  });

  test("dropping anywhere else springs the mask back", async ({ page }, testInfo) => {
    await open(page);
    const touch = testInfo.project.name === "mobile";
    const from = await visibleMask(page, "present");
    await drag(page, from, { x: 60, y: from.y - 160 }, touch);
    await page.waitForTimeout(600);
    expect(await maskAttr(page)).toBeNull();
    await expect(page.locator(".mask-ghost")).toHaveCount(0);
    await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", "0");
  });

  test("keyboard: the chips appear on focus, Enter equips, aria-pressed and live region update, Escape takes it off", async ({ page }) => {
    await open(page);
    const key = page.locator('[data-mask-key="present"]');
    await key.focus();
    await expect(page.locator("[data-mask-keys]")).toHaveCSS("opacity", "1");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    expect(await maskAttr(page)).toBe("present");
    await expect(key).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-mask-live]")).toContainText(/Nutid|Present/);
    await expect(page.locator(".slop-ticker")).toBeVisible();

    const worn = page.locator("[data-mask-worn]");
    await expect(worn).toBeVisible();
    await worn.focus();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    expect(await maskAttr(page)).toBeNull();
    await expect(key).toHaveAttribute("aria-pressed", "false");
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
    await expect(page.locator('[data-mask-key="past"]')).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('[data-mask-key="future"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-mask-worn] use")).toHaveAttribute("href", "#mask-future");
  });

  test("take off: clicking the worn mask restores the default theme", async ({ page }) => {
    await open(page);
    await equipByKey(page, "past");
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
    await equipByKey(page, "future");
    await page.reload();
    // The inline head script sets the attribute before any component script runs
    expect(await page.evaluate(() => document.documentElement.getAttribute("data-mask"))).toBe("future");
    await page.goto("/en/");
    expect(await maskAttr(page)).toBe("future");
    await page.waitForTimeout(500);
    await expect(page.locator("[data-mask-worn]")).toBeVisible();
    await expect(page.locator('[data-mask-key="future"]')).toHaveAttribute("aria-pressed", "true");
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
      // the chips stay as the only way to swap masks
      await expect(page.locator("[data-mask-keys]")).toBeVisible();

      for (let i = 0; i < SLIDES; i++) {
        if (i > 0) {
          await page.keyboard.press("ArrowDown");
          await page.waitForTimeout(SLIDE_MS);
        }
        await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", String(i));
        const slide = page.locator("#slider > .keen-slider__slide").nth(i);
        const line = slide.locator("[data-future-line]");
        await expect(line).toBeVisible();
        await expect(line).toContainText(locale.lines[i]);
        // nothing else in the slide is rendered (the hero keeps its name and the chips)
        const visibleOthers = await slide.evaluate((el) => {
          const line = el.querySelector("[data-future-line]")!;
          return [...el.querySelectorAll<HTMLElement>("*")].filter((n) => {
            if (line.contains(n) || n === line) return false;
            if (n.closest(".mask-keys") || n.closest(".mask-sprite") || n.closest(".hero-face") || n.closest("h1")) return false;
            if (n.matches(".mask-tip, [data-mask-live]")) return false;
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
    test(`${mask}: every slide reachable, the overlay stays out of the way, no horizontal overflow anywhere`, async ({ page }) => {
      await page.addInitScript((m) => localStorage.setItem("wb-mask", m), mask);
      await open(page);
      await page.click("body", { position: { x: 4, y: 4 } });
      await assertNoHorizontalOverflow(page, `${mask} slide 0`);
      for (let i = 1; i < SLIDES; i++) {
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(SLIDE_MS);
        await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", String(i));
        await assertNoHorizontalOverflow(page, `${mask} slide ${i}`);
      }
      const overlay = page.locator(mask === "past" ? ".vhs" : ".slop");
      await expect(overlay).toBeVisible();
      expect(await overlay.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
      // the contact dock underneath is still clickable
      await expect(page.locator(".cta-primary")).toBeVisible();
    });

    test(`${mask}: the skills bowl accepts a drop after keyboard arrival`, async ({ page }, testInfo) => {
      await page.addInitScript((m) => localStorage.setItem("wb-mask", m), mask);
      await open(page);
      await page.click("body", { position: { x: 4, y: 4 } });
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(SLIDE_MS);
      }
      await page.waitForTimeout(1500);
      await dropInBowl(page, testInfo.project.name === "mobile");
      // a pointer press never paints the keyboard focus ring
      expect(await page.locator(".skills-canvas").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("none");
    });
  }

  test("present: the bowl accepts drops in real Chrome at 2x, arriving by trackpad wheel bursts and by the hero button, with pop-ups and cracks present", async () => {
    let browser;
    try { browser = await chromium.launch({ channel: "chrome" }); } catch { test.skip(true, "Google Chrome not installed"); return; }
    const ctx = await browser.newContext({ viewport: { width: 1256, height: 760 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => localStorage.setItem("wb-mask", "present"));
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(process.env.TEST_BASE_URL || "http://localhost:4321");
    await page.waitForSelector("#slider[data-keen-slider-v]");
    await page.waitForTimeout(HERO_WAIT_MS);
    // crack the glass first so the overlay is at its busiest
    await page.locator("[data-slop-cookie-reject]").click();
    await page.waitForTimeout(800);
    await assertNoHorizontalOverflow(page, "after reject");

    // 1) the hero's "see what I've built" button, then trackpad-style wheel bursts (CDP, inertial tails included)
    await page.locator("[data-hero-next]").click();
    await page.waitForTimeout(SLIDE_MS);
    await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", "1");
    const cdp = await ctx.newCDPSession(page);
    const burst = async () => {
      for (const d of [8, 40, 90, 60, 30, 14, 6, 3, 1]) {
        await cdp.send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 900, y: 400, deltaX: 0, deltaY: d });
        await page.waitForTimeout(16);
      }
      await page.waitForTimeout(1100);
    };
    for (let i = 1; i < 4; i++) {
      await burst();
      await expect(page.locator(".slide-dot.active")).toHaveAttribute("data-slide", String(i + 1));
      await assertNoHorizontalOverflow(page, `wheel slide ${i + 1}`);
    }
    await page.waitForTimeout(1500);
    await dropInBowl(page, false);
    await assertNoHorizontalOverflow(page, "after drop");
    expect(errors).toEqual([]);
    await browser.close();
  });

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
    // the impact jolt translates the body for half a second; measure once it has settled
    await expect(page.locator("html")).not.toHaveClass(/mask-jolt/, { timeout: 2000 });
    await assertNoHorizontalOverflow(page, "cracked");
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
    await equipByKey(page, "past");
    await expect.poll(() => fonts.length, { timeout: 5000 }).toBeGreaterThanOrEqual(2);
    expect(fonts).toEqual(expect.arrayContaining(["VT323-Regular.woff2", "Silkscreen-Bold.woff2"]));
    expect(await page.locator(".vhs-play").evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/VCR OSD/);
  });

  test("past: nothing flickers (no opacity/brightness animation on full-screen layers)", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("wb-mask", "past"));
    await open(page);
    for (const sel of [".vhs-noise", ".vhs-scan", ".vhs-tint", ".vhs-chroma"]) {
      const anim = await page.locator(sel).evaluate((el) => getComputedStyle(el).animationName);
      expect(["none", "vhs-jitter"], `${sel} animates ${anim}`).toContain(anim);
    }
    // the tracking bands move and tear by transform only
    expect(await page.locator(".vhs-band--a").evaluate((el) => getComputedStyle(el).animationName)).toBe("vhs-roll");
    expect(await page.locator(".vhs-band i").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("vhs-tear");
  });

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
  expect(await page.locator(".vhs-band--a").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  expect(await page.locator(".vhs-band i").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await ctx.close();
});

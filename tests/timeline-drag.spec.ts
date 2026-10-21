import { test, expect, type Page } from "@playwright/test";

const STAGE = "[data-testid='tower-stage']";

/** Navigate to the timeline slide (index 3) and wait for blocks to settle. */
async function goToTimeline(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForSelector(".keen-slider__slide", { timeout: 10_000 });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    document.querySelector("astro-dev-toolbar")?.remove();
    document.dispatchEvent(new CustomEvent("slider-goto", { detail: { index: 3 } }));
  });

  await page.waitForFunction(
    (sel) => {
      const blocks = document.querySelectorAll(`${sel} .tower-block`);
      return blocks.length > 0 && Array.from(blocks).every((b) => b.classList.contains("settled"));
    },
    STAGE,
    { timeout: 15_000 },
  );
}

const activeSlide = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll(".slide-dot")).findIndex((d) => d.classList.contains("active")),
  );

const visibleCard = (page: Page) =>
  page.evaluate(() => (document.querySelector(".tl-card:not([hidden])") as HTMLElement | null)?.dataset.card ?? null);

async function knockDown(page: Page) {
  await page.locator("[data-knock]").click();
  await page.waitForFunction(
    (sel) => document.querySelectorAll(`${sel} .tower-block.freed`).length > 0,
    STAGE,
  );
}

/** Wait for the blast to finish and the pile to stop moving (physics asleep). */
async function waitForPileAtRest(page: Page) {
  await page.waitForFunction(() => !document.querySelector("[data-timeline]")?.hasAttribute("data-blast"), null, {
    timeout: 15_000,
  });
  const snapshot = () =>
    page.locator(`${STAGE} .tower-block`).evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform).join("|"));
  let prev = await snapshot();
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(250);
    const next = await snapshot();
    if (next === prev) return;
    prev = next;
  }
}

test.describe("timeline: explore the tower", () => {
  test("blocks are buttons in chronological order, oldest first", async ({ page }) => {
    await goToTimeline(page);
    const jobs = await page.locator(`${STAGE} .tower-block`).evaluateAll((els) =>
      els.map((el) => ({ tag: el.tagName, job: (el as HTMLElement).dataset.job })),
    );
    expect(jobs.every((j) => j.tag === "BUTTON")).toBe(true);
    expect(jobs[0].job).toBe("hp");
    expect(jobs[jobs.length - 1].job).toBe("kendev");
  });

  test("the short-version panel shows before anything is picked", async ({ page }) => {
    await goToTimeline(page);
    await expect(page.locator("[data-arc]")).toBeVisible();
    expect(await visibleCard(page)).toBeNull();
  });

  test("clicking a block opens its story card without freeing the tower", async ({ page }) => {
    await goToTimeline(page);
    await page.locator(`${STAGE} .tower-block[data-job="telia-lead"]`).click();

    expect(await visibleCard(page)).toBe("telia-lead");
    await expect(page.locator("#tl-card-telia-lead .tl-stat-value")).toHaveText("14");
    await expect(page.locator(`${STAGE} .tower-block[data-job="telia-lead"]`)).toHaveAttribute("aria-pressed", "true");
    expect(await page.locator(`${STAGE} .tower-block.freed`).count()).toBe(0);
  });

  test("card arrows walk the tower and close returns to the short version", async ({ page }) => {
    await goToTimeline(page);
    await page.locator(`${STAGE} .tower-block[data-job="hp"]`).click();
    await page.locator("#tl-card-hp [data-step='1']").click();
    expect(await visibleCard(page)).toBe("kits");
    await page.locator("#tl-card-kits [data-close]").click();
    expect(await visibleCard(page)).toBeNull();
    await expect(page.locator("[data-arc]")).toBeVisible();
  });

  test("arrow keys move between blocks and do not change slide", async ({ page }) => {
    await goToTimeline(page);
    await page.locator(`${STAGE} .tower-block[data-job="kendev"]`).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await visibleCard(page)).toBe("hedin");
    expect(await page.evaluate(() => (document.activeElement as HTMLElement)?.dataset.job)).toBe("hedin");
    await page.keyboard.press("Escape");
    expect(await visibleCard(page)).toBeNull();
    expect(await activeSlide(page)).toBe(3);
  });

  test("an arc step opens the block it is about", async ({ page, isMobile }) => {
    test.skip(isMobile, "the arc list is desktop-only; phones get the hint + sheet");
    await goToTimeline(page);
    await page.locator("[data-arc-step='netconsult']").click();
    expect(await visibleCard(page)).toBe("netconsult");
  });

  test("'let's talk' goes to the contact slide", async ({ page }) => {
    await goToTimeline(page);
    await page.locator("[data-arc] [data-goto-contact]").click();
    await expect.poll(() => activeSlide(page)).toBe(5);
  });

  test("'see the project' opens that project in the roulette", async ({ page }) => {
    await goToTimeline(page);
    await page.locator(`${STAGE} .tower-block[data-job="telia-senior"]`).click();
    await page.locator("#tl-card-telia-senior [data-project]").click();
    await expect.poll(() => activeSlide(page)).toBe(1);
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#telia-se");
  });

  test("the date gutter never wraps, even beside the shortest block", async ({ page }) => {
    await goToTimeline(page);
    const heights = await page.locator(`${STAGE} .row-date`).evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return r.height / parseFloat(getComputedStyle(el).lineHeight || "16");
      }),
    );
    for (const lines of heights) expect(lines).toBeLessThan(1.6);
  });

  test("labels stay inside the viewport", async ({ page }) => {
    await goToTimeline(page);
    const vw = page.viewportSize()!.width;
    const rights = await page.locator(`${STAGE} .tower-label`).evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().right),
    );
    for (const r of rights) expect(r).toBeLessThanOrEqual(vw);
  });
});

test.describe("timeline: knock it down (opt-in physics)", () => {
  test("settled blocks are not grab-cursors until knocked down", async ({ page }) => {
    await goToTimeline(page);
    const cursor = await page.locator(`${STAGE} .tower-block`).first().evaluate((el) => getComputedStyle(el).cursor);
    expect(cursor).toBe("pointer");
  });

  test("the knock-down button frees every block and shows rebuild", async ({ page }) => {
    await goToTimeline(page);
    await knockDown(page);

    const counts = await page.evaluate((sel) => {
      const blocks = document.querySelectorAll(`${sel} .tower-block`);
      let freed = 0, settled = 0;
      blocks.forEach((b) => {
        if (b.classList.contains("freed")) freed++;
        if (b.classList.contains("settled")) settled++;
      });
      return { freed, settled, total: blocks.length };
    }, STAGE);
    expect(counts.settled).toBe(0);
    expect(counts.freed).toBe(counts.total);
    await expect(page.locator("[data-knock]")).toHaveAttribute("data-state", "freed");
    expect(await visibleCard(page)).toBeNull();
  });

  test("the blast lands every block back on the floor, full size and inside the stage", async ({ page }) => {
    await goToTimeline(page);
    await page.locator("[data-knock]").click();
    await page.waitForFunction(() => document.querySelector("[data-timeline]")?.getAttribute("data-blast") === "on");

    // Mid-blast: blocks fly past the stage edges, but the slide must never scroll
    const slideOverflow = () =>
      page.evaluate(() => {
        const slide = document.querySelector("[data-timeline]")!.parentElement!;
        return slide.scrollHeight - slide.clientHeight + slide.scrollTop + slide.scrollLeft;
      });
    for (let i = 0; i < 5; i++) {
      expect(await slideOverflow()).toBe(0);
      await page.waitForTimeout(120);
    }

    await waitForPileAtRest(page);
    const out = await page.evaluate((sel) => {
      const stage = document.querySelector(sel)!.getBoundingClientRect();
      const problems: string[] = [];
      document.querySelectorAll<HTMLElement>(`${sel} .tower-block`).forEach((b) => {
        const r = b.getBoundingClientRect();
        if (r.left < stage.left - 3 || r.right > stage.right + 3 || r.top < stage.top - 3 || r.bottom > stage.bottom + 3) {
          problems.push(`${b.dataset.job} outside the stage`);
        }
        if (/scale\((?!1(\.0+)?\))/.test(b.style.transform)) problems.push(`${b.dataset.job} still scaled`);
        if (b.style.opacity !== "1") problems.push(`${b.dataset.job} opacity ${b.style.opacity}`);
        if (b.classList.contains("is-flying")) problems.push(`${b.dataset.job} still flying`);
      });
      return problems;
    }, STAGE);
    expect(out).toEqual([]);
    expect(await page.locator("[data-tl-fx]").isHidden()).toBe(true);
    expect(await slideOverflow()).toBe(0);
  });

  test("rebuilding mid-blast stacks the tower and clears the effects", async ({ page }) => {
    await goToTimeline(page);
    await page.locator("[data-knock]").click();
    await page.waitForFunction(() => document.querySelector("[data-timeline]")?.getAttribute("data-blast") === "on");
    await page.waitForTimeout(250);
    await page.locator("[data-knock]").click();
    await page.waitForFunction(
      (sel) => Array.from(document.querySelectorAll(`${sel} .tower-block`)).every((b) => b.classList.contains("settled")),
      STAGE,
      { timeout: 15_000 },
    );
    expect(await page.locator(`${STAGE} .tower-block.freed`).count()).toBe(0);
    expect(await page.locator("[data-timeline]").getAttribute("data-blast")).toBeNull();
    await expect(page.locator("[data-timeline]")).not.toHaveClass(/is-blasting/);
    expect(await page.locator("[data-tl-fx]").isHidden()).toBe(true);
  });

  test("rebuild stacks the tower again", async ({ page }) => {
    await goToTimeline(page);
    await knockDown(page);
    await page.locator("[data-knock]").click();
    await page.waitForFunction(
      (sel) => Array.from(document.querySelectorAll(`${sel} .tower-block`)).every((b) => b.classList.contains("settled")),
      STAGE,
      { timeout: 15_000 },
    );
    expect(await page.locator(`${STAGE} .tower-block.freed`).count()).toBe(0);
    await expect(page.locator("[data-knock]")).not.toHaveAttribute("data-state", "freed");
  });

  test("dragging a freed block moves it toward the mouse position", async ({ page, isMobile }) => {
    test.skip(isMobile, "mouse drag");
    await goToTimeline(page);
    await knockDown(page);
    // Let the blast land and the pile fall asleep: pressing a sleeping block
    // must wake the physics loop, or the block cannot be grabbed.
    await waitForPileAtRest(page);

    // Grab the highest block in the pile that is clear at its own centre
    // (physics piles are random). The widest block usually lands at the bottom
    // with the rest resting on it, so DOM order is a poor pick.
    const job = await page.evaluate((sel) => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(`${sel} .tower-block`))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .sort((a, b) => a.r.y - b.r.y);
      for (const { el, r } of els) {
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        if (hit && el.contains(hit)) return el.dataset.job!;
      }
      return "hp";
    }, STAGE);
    const block = page.locator(`${STAGE} .tower-block[data-job="${job}"]`);
    const box = (await block.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    // Matter's MouseConstraint only grabs on an engine tick while the pointer
    // is over the body — hold still long enough for a tick even under load.
    await page.mouse.move(cx + 1, cy);
    await page.waitForTimeout(250);
    await page.mouse.move(cx + 150, cy - 40, { steps: 20 });

    await expect
      .poll(async () => {
        const b = (await block.boundingBox())!;
        return Math.abs(b.x - box.x) + Math.abs(b.y - box.y);
      }, { timeout: 3000 })
      .toBeGreaterThan(10);
    await page.mouse.up();
  });

  test("dragging a freed block vertically does not trigger a slide change", async ({ page, isMobile }) => {
    test.skip(isMobile, "mouse drag");
    await goToTimeline(page);
    await knockDown(page);
    await waitForPileAtRest(page);

    const block = page.locator(`${STAGE} .tower-block[data-job="kits"]`);
    const box = (await block.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(cx, cy - 150, { steps: 10 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(800);

    expect(await activeSlide(page)).toBe(3);
    expect(await page.locator(`${STAGE} .tower-block.freed`).count()).toBeGreaterThan(0);
  });

  test("leaving the slide resets the tower", async ({ page }) => {
    await goToTimeline(page);
    await knockDown(page);
    await page.evaluate(() => document.dispatchEvent(new CustomEvent("slider-goto", { detail: { index: 4 } })));
    await expect.poll(() => activeSlide(page)).toBe(4);
    await page.waitForTimeout(1200); // slide animation ends, reveal class drops, reset runs
    await page.evaluate(() => document.dispatchEvent(new CustomEvent("slider-goto", { detail: { index: 3 } })));
    await page.waitForFunction(
      (sel) => Array.from(document.querySelectorAll(`${sel} .tower-block`)).every((b) => b.classList.contains("settled")),
      STAGE,
      { timeout: 15_000 },
    );
    expect(await page.locator(`${STAGE} .tower-block.freed`).count()).toBe(0);
  });
});

test.describe("timeline: knock-down with reduced motion", () => {
  test("the tower just tips over: no blast, no effects", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await goToTimeline(page);
    await page.evaluate(() => {
      const root = document.querySelector("[data-timeline]")!;
      (window as any).__blasted = false;
      new MutationObserver(() => {
        if (root.hasAttribute("data-blast")) (window as any).__blasted = true;
      }).observe(root, { attributes: true });
    });
    await knockDown(page);
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => (window as any).__blasted)).toBe(false);
    expect(await page.locator("[data-tl-fx]").isHidden()).toBe(true);
    expect(await page.locator(`${STAGE} .tower-block.freed`).count()).toBe(
      await page.locator(`${STAGE} .tower-block`).count(),
    );
  });
});

test.describe("timeline: English", () => {
  test("renders the English story for HP", async ({ page }) => {
    await goToTimeline(page, "/en/");
    await page.locator(`${STAGE} .tower-block[data-job="hp"]`).click();
    await expect(page.locator("#tl-card-hp .tl-card-headline")).toHaveText("Built a tool 5,000 colleagues chose to use.");
  });
});

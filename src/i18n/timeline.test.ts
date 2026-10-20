import { describe, it, expect } from "vitest";
import { getTimeline, getArcSteps, stories } from "./timeline";
import { getJobs } from "./jobs";
import { ui } from "./ui";
import { getProjectSlugs } from "./projects";

describe("timeline stories", () => {
  it("every tower block has a story in both languages", () => {
    for (const job of getJobs("en")) {
      expect(stories[job.id], job.id).toBeDefined();
    }
    expect(Object.keys(stories).sort()).toEqual(getJobs("en").map((j) => j.id).sort());
  });

  it("sv and en stories have the same shape", () => {
    for (const [id, s] of Object.entries(stories)) {
      expect(s.sv.bullets.length, id).toBe(s.en.bullets.length);
      expect(Boolean(s.sv.stat), id).toBe(Boolean(s.en.stat));
      expect(Boolean(s.sv.chip), id).toBe(Boolean(s.en.chip));
      for (const lang of ["sv", "en"] as const) {
        expect(s[lang].headline.trim(), `${id}.${lang}.headline`).toBeTruthy();
        expect(s[lang].context.trim(), `${id}.${lang}.context`).toBeTruthy();
        expect(s[lang].period.trim(), `${id}.${lang}.period`).toBeTruthy();
        expect(s[lang].bullets.length, `${id}.${lang}.bullets`).toBeGreaterThan(0);
      }
    }
  });

  it("getTimeline merges jobs and stories, newest first", () => {
    for (const lang of ["sv", "en"] as const) {
      const tl = getTimeline(lang);
      expect(tl.map((b) => b.id)).toEqual(getJobs(lang).map((j) => j.id));
      expect(tl[0].cta).toBe(true);
    }
  });

  it("resolves quotes from contact.ts testimonials", () => {
    const sv = getTimeline("sv");
    const en = getTimeline("en");
    expect(sv.find((b) => b.id === "telia-lead")?.quote?.name).toBe("Joel Ericsson");
    expect(en.find((b) => b.id === "telia-lead")?.quote?.name).toBe("Nina Fogelberg");
    expect(en.find((b) => b.id === "sembo")?.quote?.text).toBeTruthy();
  });

  it("caps turning-point chips at four so the tower stays quiet", () => {
    const chips = getTimeline("en").filter((b) => b.chip);
    expect(chips.length).toBeLessThanOrEqual(4);
  });

  it("does not claim 5,000 users anywhere but HP", () => {
    for (const lang of ["sv", "en"] as const) {
      for (const b of getTimeline(lang)) {
        if (b.id === "hp") continue;
        expect(JSON.stringify(b)).not.toMatch(/5[ ,]000/);
      }
    }
  });

  it("arc steps point at real blocks", () => {
    const ids = new Set(getJobs("en").map((j) => j.id));
    for (const lang of ["sv", "en"] as const) {
      for (const step of getArcSteps(lang)) {
        expect(ids.has(step.id), step.id).toBe(true);
        expect(step.text).toBeTruthy();
      }
    }
  });

  it("project deep links are real project slugs", () => {
    const slugs = new Set<string>(getProjectSlugs());
    const linked = getTimeline("en").filter((b) => b.project);
    expect(linked.length).toBeGreaterThan(0);
    for (const b of linked) expect(slugs.has(b.project!), b.project).toBe(true);
  });

  it("has the timeline UI strings in both languages", () => {
    for (const key of ["timeline.sub", "timeline.knock", "timeline.rebuild", "timeline.cta", "timeline.legend.width"] as const) {
      expect(ui.sv[key]).toBeTruthy();
      expect(ui.en[key]).toBeTruthy();
    }
  });
});

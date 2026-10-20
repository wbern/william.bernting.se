import { describe, it, expect } from "vitest";
import { getJobs, jobEntries } from "./jobs";
import { getCvJobs } from "./cv";

describe("jobs", () => {
  it("has the 8 CV jobs plus the own agency on top", () => {
    expect(jobEntries).toHaveLength(getCvJobs("en").length + 1);
    expect(jobEntries).toHaveLength(9);
  });

  it("returns 9 jobs for each locale", () => {
    expect(getJobs("sv")).toHaveLength(9);
    expect(getJobs("en")).toHaveLength(9);
  });

  it("each entry has both sv and en with role and company", () => {
    for (const entry of jobEntries) {
      expect(entry.sv.role).toBeTruthy();
      expect(entry.en.role).toBeTruthy();
      expect(entry.sv.company).toBeTruthy();
      expect(entry.en.company).toBeTruthy();
    }
  });

  it("preserves shared fields (id, date, color, w)", () => {
    const sv = getJobs("sv");
    const en = getJobs("en");
    for (let i = 0; i < sv.length; i++) {
      expect(sv[i].id).toBe(en[i].id);
      expect(sv[i].date).toBe(en[i].date);
      expect(sv[i].color).toBe(en[i].color);
      expect(sv[i].w).toBe(en[i].w);
    }
  });

  it("ids are unique", () => {
    const ids = jobEntries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("top block is the own agency, ongoing; then Akka", () => {
    const [top, next] = getJobs("en");
    expect(top.id).toBe("kendev");
    expect(top.ongoing).toBe(true);
    expect(next.company).toBe("Akka");
    expect(getJobs("en").filter((j) => j.ongoing)).toHaveLength(1);
  });

  it("bottom block is HP and starts in 2011 (the '15 years' heading)", () => {
    const jobs = getJobs("en");
    const hp = jobs[jobs.length - 1];
    expect(hp.id).toBe("hp");
    expect(hp.date.startsWith("2011")).toBe(true);
  });

  it("HP is the widest block (longest tenure) and widths stay in 20–100", () => {
    const jobs = getJobs("en");
    const widest = jobs.reduce((a, b) => (b.w > a.w ? b : a));
    expect(widest.id).toBe("hp");
    for (const j of jobs) {
      expect(j.w).toBeGreaterThanOrEqual(20);
      expect(j.w).toBeLessThanOrEqual(100);
    }
  });

  it("the freelance rail covers a contiguous run from Sembo to the top", () => {
    const ids = getJobs("en").filter((j) => j.freelance).map((j) => j.id);
    expect(ids).toEqual(["kendev", "akka", "hedin", "sembo"]);
  });
});

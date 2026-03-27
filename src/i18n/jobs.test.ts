import { describe, it, expect } from "vitest";
import { getJobs, jobEntries } from "./jobs";

describe("jobs", () => {
  it("has 7 jobs", () => {
    expect(jobEntries).toHaveLength(7);
  });

  it("returns 7 jobs for each locale", () => {
    expect(getJobs("sv")).toHaveLength(7);
    expect(getJobs("en")).toHaveLength(7);
  });

  it("each entry has both sv and en with role and company", () => {
    for (const entry of jobEntries) {
      expect(entry.sv.role).toBeTruthy();
      expect(entry.en.role).toBeTruthy();
      expect(entry.sv.company).toBeTruthy();
      expect(entry.en.company).toBeTruthy();
    }
  });

  it("preserves shared fields (date, color, w)", () => {
    const sv = getJobs("sv");
    const en = getJobs("en");
    for (let i = 0; i < sv.length; i++) {
      expect(sv[i].date).toBe(en[i].date);
      expect(sv[i].color).toBe(en[i].color);
      expect(sv[i].w).toBe(en[i].w);
    }
  });

  it("first job is Akka", () => {
    expect(getJobs("sv")[0].company).toBe("Akka");
    expect(getJobs("en")[0].company).toBe("Akka");
  });
});

import { describe, it, expect } from "vitest";
import { getProjects, projectEntries } from "./projects";

describe("projects", () => {
  it("has 13 projects", () => {
    expect(projectEntries).toHaveLength(13);
  });

  it("returns 13 projects for each locale", () => {
    expect(getProjects("sv")).toHaveLength(13);
    expect(getProjects("en")).toHaveLength(13);
  });

  it("each entry has both sv and en", () => {
    for (const entry of projectEntries) {
      expect(entry.sv).toBeDefined();
      expect(entry.en).toBeDefined();
      expect(entry.sv.tag).toBeTruthy();
      expect(entry.en.tag).toBeTruthy();
      expect(entry.sv.title).toBeTruthy();
      expect(entry.en.title).toBeTruthy();
      expect(entry.sv.description).toBeTruthy();
      expect(entry.en.description).toBeTruthy();
    }
  });

  it("first project is Community Assistant", () => {
    const sv = getProjects("sv")[0];
    const en = getProjects("en")[0];
    expect(sv.title).toBe("Community Assistant");
    expect(en.title).toBe("Community Assistant");
  });
});

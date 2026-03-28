import { describe, it, expect } from "vitest";
import { getProjects, projectEntries, slugify, getProjectSlugs } from "./projects";

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

  describe("slugify", () => {
    it("converts titles to URL slugs", () => {
      expect(slugify("Pixi Platformer")).toBe("pixi-platformer");
      expect(slugify("DLL Decompilation")).toBe("dll-decompilation");
      expect(slugify("Community Assistant")).toBe("community-assistant");
      expect(slugify("TDD with AI — Presentation")).toBe("tdd-with-ai-presentation");
      expect(slugify("Pi-PAI")).toBe("pi-pai");
      expect(slugify("Architectural Blueprint to 3D")).toBe("architectural-blueprint-to-3d");
    });

    it("handles edge cases", () => {
      expect(slugify("")).toBe("");
      expect(slugify("  spaces  ")).toBe("spaces");
      expect(slugify("UPPERCASE")).toBe("uppercase");
    });
  });

  describe("getProjectSlugs", () => {
    it("returns one slug per project", () => {
      const slugs = getProjectSlugs();
      expect(slugs).toHaveLength(projectEntries.length);
    });

    it("all slugs are unique", () => {
      const slugs = getProjectSlugs();
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it("contains expected slugs", () => {
      const slugs = getProjectSlugs();
      expect(slugs).toContain("pixi-platformer");
      expect(slugs).toContain("community-assistant");
      expect(slugs).toContain("knowledge-bot");
    });
  });
});

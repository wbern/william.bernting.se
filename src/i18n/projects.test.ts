import { describe, it, expect } from "vitest";
import {
  getProjects,
  projectEntries,
  slugify,
  getProjectSlugs,
  resolveProjectSlug,
  PROJECT_TRACKS,
  SLUG_ALIASES,
} from "./projects";

describe("projects", () => {
  it("is a curated list of 13 cases", () => {
    expect(projectEntries).toHaveLength(13);
    expect(getProjects("sv")).toHaveLength(13);
    expect(getProjects("en")).toHaveLength(13);
  });

  it("opens with current projects", () => {
    expect(getProjectSlugs().slice(0, 2)).toEqual(["slay-crm", "vibe-coding"]);
  });

  it("every entry tells the full story in both languages", () => {
    for (const lang of ["sv", "en"] as const) {
      for (const p of getProjects(lang)) {
        for (const field of ["title", "context", "hook", "problem", "did", "outcome", "tag"] as const) {
          expect(p[field], `${p.slug}.${lang}.${field}`).toBeTruthy();
        }
        expect(p.nerdy.length, `${p.slug}.${lang}.nerdy`).toBeGreaterThan(0);
      }
    }
  });

  it("sv and en have the same shape (facts, links, nerdy bits)", () => {
    for (const entry of projectEntries) {
      expect(entry.sv.facts.length, entry.slug).toBe(entry.en.facts.length);
      expect(entry.sv.links.length, entry.slug).toBe(entry.en.links.length);
      expect(entry.sv.nerdy.length, entry.slug).toBe(entry.en.nerdy.length);
      entry.sv.links.forEach((l, i) => expect(l.href).toBe(entry.en.links[i].href));
    }
  });

  it("hooks are one short line (they sit under the roller)", () => {
    for (const lang of ["sv", "en"] as const) {
      for (const p of getProjects(lang)) {
        expect(p.hook.length, `${p.slug}.${lang}`).toBeLessThanOrEqual(130);
        expect(p.hook).not.toMatch(/<[a-z]/i);
      }
    }
  });

  it("fact strips hold at most three short figures", () => {
    for (const lang of ["sv", "en"] as const) {
      for (const p of getProjects(lang)) {
        expect(p.facts.length).toBeLessThanOrEqual(3);
        for (const f of p.facts) expect(f.value.length, `${p.slug}: ${f.value}`).toBeLessThanOrEqual(10);
      }
    }
  });

  it("never shows a bare 100% accuracy claim", () => {
    for (const lang of ["sv", "en"] as const) {
      for (const p of getProjects(lang)) {
        const text = [p.hook, p.outcome, ...p.facts.map((f) => f.value)].join(" ");
        expect(text, p.slug).not.toMatch(/100\s?%/);
      }
    }
  });

  it("every track has a label and CTA in both languages", () => {
    for (const track of Object.values(PROJECT_TRACKS)) {
      expect(track.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(track.sv.label && track.en.label && track.sv.cta && track.en.cta).toBeTruthy();
    }
  });

  it("has a few flagship cases for the first spin", () => {
    const flagships = getProjects("en").filter((p) => p.flagship).map((p) => p.slug);
    expect(flagships.length).toBeGreaterThanOrEqual(2);
    expect(flagships).toContain("dll-decompilation");
  });

  it("resolves quotes to real testimonials", () => {
    const telia = getProjects("sv").find((p) => p.slug === "telia-se")!;
    expect(telia.quote?.name).toBe("Joel Ericsson");
    expect(telia.quote?.text).toBeTruthy();
  });

  describe("slugs", () => {
    it("are url-safe and unique", () => {
      const slugs = getProjectSlugs();
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const s of slugs) expect(slugify(s)).toBe(s);
    });

    it("keep the deep links that other slides point to", () => {
      const slugs = getProjectSlugs();
      for (const s of ["legacy-chess-tool-rewrite", "sembo-se-startpage", "telia-se", "tdd-command-generator", "community-assistant", "knowledge-bot"]) {
        expect(slugs).toContain(s);
      }
    });

    it("resolve old merged slugs via aliases", () => {
      expect(resolveProjectSlug("tdd-with-ai-presentation")).toBe("tdd-command-generator");
      expect(resolveProjectSlug("telia-se")).toBe("telia-se");
      expect(resolveProjectSlug("pixi-platformer")).toBeNull();
      for (const target of Object.values(SLUG_ALIASES)) expect(getProjectSlugs()).toContain(target);
    });
  });

  describe("slugify", () => {
    it("converts titles to URL slugs", () => {
      expect(slugify("DLL Decompilation")).toBe("dll-decompilation");
      expect(slugify("TDD with AI — Presentation")).toBe("tdd-with-ai-presentation");
      expect(slugify("Pi-PAI")).toBe("pi-pai");
    });

    it("handles edge cases", () => {
      expect(slugify("")).toBe("");
      expect(slugify("  spaces  ")).toBe("spaces");
      expect(slugify("UPPERCASE")).toBe("uppercase");
    });
  });
});

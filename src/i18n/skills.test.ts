import { describe, it, expect } from "vitest";
import {
    getSkillProfiles,
    getSkillCombos,
    parseDateRange,
    unionMonths,
    tierForYears,
} from "./skills";
import { getCvJobs } from "./cv";
import { getProjectSlugs } from "./projects";

const NOW = new Date(2026, 9, 20);

describe("skills: year math", () => {
    it("parses a closed date range as [start, end) months", () => {
        const [s, e] = parseDateRange("08/2025 – 04/2026", NOW);
        expect(e - s).toBe(8);
    });

    it("treats an open range as ending now", () => {
        const [s, e] = parseDateRange("10/2025 – Pågående", NOW);
        expect(e - s).toBe(12);
    });

    it("merges overlapping ranges instead of double counting", () => {
        expect(unionMonths([[0, 10], [5, 20], [30, 32]])).toBe(22);
        expect(unionMonths([])).toBe(0);
    });

    it("maps years to tool tiers", () => {
        expect(tierForYears(1.9)).toBe(0);
        expect(tierForYears(2)).toBe(1);
        expect(tierForYears(4.5)).toBe(2);
        expect(tierForYears(6.2)).toBe(3);
        expect(tierForYears(9.1)).toBe(4);
    });
});

describe("skills: profiles derived from cv.ts", () => {
    const byId = Object.fromEntries(getSkillProfiles("en", NOW).map((s) => [s.id, s]));

    // Sources: techStack + dateRange per job in src/i18n/cv.ts
    it.each([
        ["typescript", 9.1, 4],
        ["react", 7.7, 3],
        ["node", 7.0, 3],
        ["angular", 6.2, 3],
        ["vue", 5.2, 2],
        ["next", 4.5, 2],
        ["devops", 3.3, 1],
        ["cloud", 3.1, 1],
        ["microfrontends", 1.7, 0],
        ["csharp", 1.5, 0],
    ])("%s: %f years, tier %i", (id, years, tier) => {
        expect(byId[id].years).toBe(years);
        expect(byId[id].tier).toBe(tier);
        expect(byId[id].pillar).toBe(false);
    });

    it("lists employers from the timeline, most recent first", () => {
        expect(byId.react.employers).toEqual(["Akka", "Sembo", "Telia", "KITS AB"]);
        expect(byId.csharp.employers).toEqual(["Hedin IT", "HP · HPE"]);
    });

    it("every tool is backed by at least one cv.ts job", () => {
        for (const s of Object.values(byId)) {
            if (!s.pillar) expect(s.employers.length, s.id).toBeGreaterThan(0);
        }
    });

    it("has three pillars, bigger than every tool, each with proof", () => {
        const all = Object.values(byId);
        const pillars = all.filter((s) => s.pillar);
        const maxTool = Math.max(...all.filter((s) => !s.pillar).map((s) => s.tier));
        expect(pillars.map((p) => p.id)).toEqual(["tdd", "ai", "coaching"]);
        for (const p of pillars) {
            expect(p.tier).toBeGreaterThan(maxTool);
            expect(p.years).toBeNull();
            expect(p.proof).toBeTruthy();
            expect(p.proofSlug).toBeTruthy();
        }
        expect(new Set(pillars.map((p) => p.tier)).size).toBe(3);
    });

    it("has no duplicate labels", () => {
        for (const lang of ["sv", "en"] as const) {
            const labels = getSkillProfiles(lang, NOW).map((s) => s.label);
            expect(new Set(labels).size).toBe(labels.length);
        }
    });

    it("sv and en describe the same skills", () => {
        const sv = getSkillProfiles("sv", NOW);
        const en = getSkillProfiles("en", NOW);
        expect(sv.map((s) => [s.id, s.tier, s.years])).toEqual(en.map((s) => [s.id, s.tier, s.years]));
        for (const s of [...sv, ...en]) expect(s.value.trim()).toBeTruthy();
    });

    it("cv.ts still has the jobs the numbers come from", () => {
        expect(getCvJobs("en").some((j) => j.techStack.includes("Single-SPA"))).toBe(true);
    });
});

describe("skills: combos", () => {
    it("pair existing skills, each pair once, with valid project links", () => {
        const ids = new Set(getSkillProfiles("en", NOW).map((s) => s.id));
        const slugs = new Set(getProjectSlugs());
        const seen = new Set<string>();
        for (const lang of ["sv", "en"] as const) {
            for (const c of getSkillCombos(lang)) {
                expect(ids.has(c.pair[0]) && ids.has(c.pair[1])).toBe(true);
                expect(c.pair[0]).not.toBe(c.pair[1]);
                expect(c.title.trim()).toBeTruthy();
                expect(c.body.trim()).toBeTruthy();
                if (c.slug) expect(slugs.has(c.slug)).toBe(true);
                if (lang === "en") {
                    const key = [...c.pair].sort().join("+");
                    expect(seen.has(key), key).toBe(false);
                    seen.add(key);
                }
            }
        }
        expect(getSkillCombos("sv")).toHaveLength(getSkillCombos("en").length);
    });
});

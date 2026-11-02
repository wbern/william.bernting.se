import { describe, it, expect } from "vitest";
import { getSkillLadder, getSkillPillars, parseDateRange, unionMonths } from "./skills";
import { getCvJobs } from "./cv";
import { getProjectSlugs } from "./projects";
import { TIER_COUNT, FRUITS } from "../utils/skill-ladder";

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
});

describe("skills: the ladder", () => {
    const ladder = getSkillLadder("en", NOW);
    const byId = Object.fromEntries(ladder.map((r) => [r.id, r]));

    it("has one rung per fruit, in growth order, AI agents on top", () => {
        expect(ladder).toHaveLength(TIER_COUNT);
        expect(ladder.map((r) => r.id)).toEqual([
            "vue", "angular", "node", "react", "typescript", "csharp",
            "devops", "cloud", "tdd", "mob", "ai",
        ]);
        ladder.forEach((r, i) => {
            expect(r.tier).toBe(i);
            expect(r.fruit).toBe(FRUITS[i]);
        });
    });

    // Sources: techStack + dateRange per job in src/i18n/cv.ts
    it.each([
        ["vue", 5.2],
        ["angular", 6.2],
        ["node", 7.0],
        ["react", 7.7],
        ["typescript", 9.8],
        ["csharp", 1.5],
        ["devops", 3.3],
        ["cloud", 3.1],
    ])("%s: %f years on the job, computed from cv.ts", (id, years) => {
        expect(byId[id].years).toBe(years);
        expect(byId[id].employers.length).toBeGreaterThan(0);
    });

    it("lists employers from the timeline, most recent first", () => {
        expect(byId.react.employers).toEqual(["Akka", "Sembo", "Telia", "KITS AB"]);
        expect(byId.csharp.employers).toEqual(["Hedin IT", "HP · HPE"]);
    });

    it("the three top rungs are the things he sells, backed by proof, not years", () => {
        for (const id of ["tdd", "mob", "ai"]) {
            expect(byId[id].years).toBeNull();
            expect(byId[id].proof).toBeTruthy();
            expect(byId[id].slug).toBeTruthy();
        }
        expect(byId.tdd.pillar).toBe("tdd");
        expect(byId.mob.pillar).toBe("coaching");
        expect(byId.ai.pillar).toBe("ai");
    });

    it("story lines reuse the verified facts", () => {
        expect(byId.csharp.line).toContain("5,000");
        expect(byId.tdd.line).toContain("90%");
        expect(byId.tdd.proof).toContain("100 GitHub stars");
        expect(byId.mob.line).toContain("14");
        expect(byId.ai.line).toContain("~500");
        expect(byId.angular.line).toContain("7 client products");
    });

    it("sv and en describe the same ladder", () => {
        const sv = getSkillLadder("sv", NOW);
        expect(sv.map((r) => [r.id, r.tier, r.years, r.slug])).toEqual(ladder.map((r) => [r.id, r.tier, r.years, r.slug]));
        for (const r of [...sv, ...ladder]) {
            expect(r.line.trim()).toBeTruthy();
            expect(r.short.trim()).toBeTruthy();
        }
    });

    it("has no duplicate labels or short labels, and short labels stay short", () => {
        for (const lang of ["sv", "en"] as const) {
            const l = getSkillLadder(lang, NOW);
            expect(new Set(l.map((r) => r.label)).size).toBe(l.length);
            expect(new Set(l.map((r) => r.short)).size).toBe(l.length);
            for (const r of l) expect(r.short.length, r.short).toBeLessThanOrEqual(7);
        }
    });

    it("links only to projects that exist", () => {
        const slugs = new Set(getProjectSlugs());
        for (const r of ladder) if (r.slug) expect(slugs.has(r.slug), r.slug).toBe(true);
        for (const p of getSkillPillars("en")) expect(slugs.has(p.slug), p.slug).toBe(true);
    });

    it("cv.ts still has the jobs the numbers come from", () => {
        expect(getCvJobs("en").some((j) => j.techStack.includes("TDD"))).toBe(true);
    });
});

describe("skills: the pillar list", () => {
    it("keeps the three pillars, each pointing at a rung on the ladder", () => {
        const ids = new Set(getSkillLadder("en", NOW).map((r) => r.id));
        const pillars = getSkillPillars("sv");
        expect(pillars.map((p) => p.label)).toEqual(["Testa först", "AI-agenter", "Coachning"]);
        for (const p of pillars) {
            expect(ids.has(p.rung)).toBe(true);
            expect(p.value.trim()).toBeTruthy();
        }
    });
});

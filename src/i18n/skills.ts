import { getCvJobs } from "./cv";
import type { ProjectSlug } from "./projects";
import type { Lang } from "./ui";
import { FRUITS, TIER_COUNT, type Fruit } from "../utils/skill-ladder";

/**
 * Skills for the "Stacken" merge game (slide 5).
 *
 * The game is Suika style: two fruit of the same kind merge into the next
 * kind, and the fruit ladder is William's skill ladder, from the frameworks
 * you drop into the bowl up to the three things he sells (TDD, mob
 * programming, AI agents) at the top.
 *
 * Each rung's story line reuses a verified fact from cv.ts or projects.ts.
 * Years and employers are COMPUTED from `techStack` + `dateRange` in cv.ts,
 * so the cards can't drift from the CV. "Years" means "years on assignments
 * where the tool was in the stack", not hours of hands-on use; the copy says
 * "years on the job" for that reason.
 */

type Bi = { sv: string; en: string };

export type SkillId =
    | "vue" | "angular" | "node" | "react" | "typescript" | "csharp"
    | "devops" | "cloud" | "tdd" | "mob" | "ai";

export type PillarId = "tdd" | "ai" | "coaching";

interface RungDef {
    id: SkillId;
    label: Bi;
    /** Fruit label for phones, where long names don't fit inside a small fruit. */
    short?: Bi;
    /** cv.ts techStack names that count as this skill (years come from these). */
    aliases: string[];
    /** One plain-language line for a non-technical reader. Source in the comment. */
    line: Bi;
    /** Optional second, smaller proof line (the three top rungs only). */
    proof?: Bi;
    slug?: ProjectSlug;
}

/** The ladder, smallest fruit first. Index = tier = fruit in FRUITS. */
const ladder: RungDef[] = [
    {
        // cv.ts KITS bullet ("React, Angular och Vue åt flera klienter") + old value line.
        id: "vue", aliases: ["Vue"],
        label: { sv: "Vue", en: "Vue" },
        line: {
            sv: "Byggde sajter i React, Angular och Vue åt flera kunder. Jag kör det ni redan har.",
            en: "Built sites in React, Angular and Vue for several clients. I use what you already have.",
        },
    },
    {
        // cv.ts NetConsult bullet; NetConsult's stack lists Angular.
        id: "angular", aliases: ["Angular"],
        label: { sv: "Angular", en: "Angular" },
        line: {
            sv: "Som CTO på NetConsult drev jag tekniken för 7 kundprodukter samtidigt.",
            en: "As CTO at NetConsult I drove the tech strategy for 7 client products at once.",
        },
    },
    {
        // Old value line.
        id: "node", aliases: ["Node.js"],
        label: { sv: "Node.js", en: "Node.js" },
        short: { sv: "Node", en: "Node" },
        line: {
            sv: "Servern bakom sajten, i samma språk som sajten.",
            en: "The server behind the site, in the same language as the site.",
        },
    },
    {
        // cv.ts KITS bullet ("ensam skrev om hela systemet ... till React").
        id: "react", aliases: ["React"],
        label: { sv: "React", en: "React" },
        line: {
            sv: "Skrev ensam om ett system som inte skalade, till React.",
            en: "Single-handedly rewrote a system that didn't scale, into React.",
        },
    },
    {
        // Old value line. Longest-running tool in cv.ts.
        id: "typescript", aliases: ["TypeScript"],
        label: { sv: "TypeScript", en: "TypeScript" },
        short: { sv: "TS", en: "TS" },
        line: {
            sv: "Färre fel når användarna, för att koden kollar sig själv.",
            en: "Fewer bugs reach your users, because the code checks itself.",
        },
    },
    {
        // cv.ts HPE bullet (stack: C#, TypeScript).
        id: "csharp", aliases: ["C#"],
        label: { sv: "C# / .NET", en: "C# / .NET" },
        short: { sv: "C#", en: "C#" },
        line: {
            sv: "På HPE byggde jag 8 interna verktyg. Ett av dem växte till 5 000 aktiva användare.",
            en: "At HPE I built 8 internal tools. One of them grew to 5,000 active users.",
        },
    },
    {
        // Old value line.
        id: "devops", aliases: ["DevOps"],
        label: { sv: "DevOps / CI/CD", en: "DevOps / CI/CD" },
        short: { sv: "CI/CD", en: "CI/CD" },
        line: {
            sv: "Varje ändring testas och skeppas automatiskt.",
            en: "Every change gets tested and shipped automatically.",
        },
    },
    {
        // Old value line.
        id: "cloud", aliases: ["AWS", "Azure"],
        label: { sv: "AWS / Azure", en: "AWS / Azure" },
        short: { sv: "Moln", en: "Cloud" },
        line: {
            sv: "Molnet, uppsatt så att det bara funkar.",
            en: "The cloud, set up so it just works.",
        },
    },
    {
        // cv.ts Hedin bullet (90 %); proof: projects.ts tdd-command-generator.
        id: "tdd", aliases: ["TDD"],
        label: { sv: "TDD", en: "TDD" },
        line: {
            sv: "Testet före koden. På Hedin körde vi så i 90 % av jobbet, och leveranserna kom utan buggar.",
            en: "Test before code. At Hedin we did that for 90% of the work and shipped without bugs.",
        },
        proof: {
            sv: "Mina TDD-kommandon för AI-agenter fick 100 GitHub-stjärnor på under två dygn.",
            en: "My TDD commands for AI agents got 100 GitHub stars in under two days.",
        },
        slug: "tdd-command-generator",
    },
    {
        // cv.ts Telia bullet (14 teams) + NetConsult bullet (6 hires in 6 months).
        id: "mob", aliases: [],
        label: { sv: "Mob programming", en: "Mob programming" },
        short: { sv: "Mob", en: "Mob" },
        line: {
            sv: "Mob programming och coachning. På Telia stöttade jag 14 utvecklingsteam.",
            en: "Mob programming and coaching. At Telia I supported 14 development teams.",
        },
        proof: {
            sv: "Rekryterade 6 personer på 6 månader som utvecklingschef.",
            en: "Hired 6 people in 6 months as head of development.",
        },
        slug: "telia-se",
    },
    {
        // projects.ts legacy-chess-tool-rewrite (Schack4an, ~500 kids) + old value line.
        id: "ai", aliases: [],
        label: { sv: "AI-agenter", en: "AI agents" },
        short: { sv: "AI", en: "AI" },
        line: {
            sv: "Lottningen till en schackturnering för ~500 barn. AI skrev all kod.",
            en: "The pairing tool for a chess event with ~500 kids. AI wrote all of the code.",
        },
        proof: {
            sv: "AI skriver koden snabbt. Jag lär ditt team att kolla den.",
            en: "AI writes the code fast. I teach your team to check it.",
        },
        slug: "legacy-chess-tool-rewrite",
    },
];

/**
 * The left column: what William sells. Content unchanged from before the
 * game; each pillar points at its rung on the ladder.
 */
interface PillarDef {
    id: PillarId;
    rung: SkillId;
    label: Bi;
    value: Bi;
    slug: ProjectSlug;
}

const pillarDefs: PillarDef[] = [
    {
        id: "tdd", rung: "tdd",
        label: { sv: "Testa först", en: "Test first" },
        value: {
            sv: "Testet före koden. På Hedin körde vi så i 90 % av jobbet, och leveranserna kom utan buggar.",
            en: "Test before code. At Hedin we did that for 90% of the work and shipped without bugs.",
        },
        slug: "tdd-command-generator",
    },
    {
        id: "ai", rung: "ai",
        label: { sv: "AI-agenter", en: "AI agents" },
        value: {
            sv: "AI skriver koden snabbt. Jag lär ditt team att kolla den.",
            en: "AI writes the code fast. I teach your team to check it.",
        },
        slug: "legacy-chess-tool-rewrite",
    },
    {
        id: "coaching", rung: "mob",
        label: { sv: "Coachning", en: "Coaching" },
        value: {
            sv: "Mob programming och coachning, tills teamet klarar sig utan mig.",
            en: "Mob programming and coaching, until the team doesn't need me.",
        },
        slug: "sembo-se-startpage",
    },
];

// ===== Years from cv.ts =====

/** "08/2025 – 04/2026" → [start, end) in absolute months. Open ranges end at `now`. */
export function parseDateRange(range: string, now: Date = new Date()): [number, number] {
    const [a, b] = range.split(/\s*[–-]\s*/);
    const toMonth = (s: string) => {
        const m = s.trim().match(/^(\d{1,2})\/(\d{4})$/);
        if (!m) return now.getFullYear() * 12 + now.getMonth();
        return Number(m[2]) * 12 + Number(m[1]) - 1;
    };
    return [toMonth(a), toMonth(b ?? "")];
}

/** Total months covered by possibly overlapping [start, end) ranges. */
export function unionMonths(ranges: [number, number][]): number {
    const sorted = [...ranges].sort((x, y) => x[0] - y[0]);
    let total = 0;
    let cur: [number, number] | null = null;
    for (const [s, e] of sorted) {
        if (!cur) cur = [s, e];
        else if (s <= cur[1]) cur[1] = Math.max(cur[1], e);
        else { total += cur[1] - cur[0]; cur = [s, e]; }
    }
    if (cur) total += cur[1] - cur[0];
    return total;
}

export interface SkillRung {
    id: SkillId;
    tier: number;
    fruit: Fruit;
    label: string;
    /** Phone-sized fruit label (falls back to `label`). */
    short: string;
    /** Years on assignments with this tool in the stack, 1 decimal. Null for the method rungs. */
    years: number | null;
    /** Employers (timeline names, most recent first) whose stack lists the tool. */
    employers: string[];
    line: string;
    proof: string | null;
    slug: ProjectSlug | null;
    /** The left-column pillar that points here, if any. */
    pillar: PillarId | null;
}

export interface SkillPillar {
    id: PillarId;
    rung: SkillId;
    label: string;
    value: string;
    slug: ProjectSlug;
}

export function getSkillLadder(lang: Lang, now: Date = new Date()): SkillRung[] {
    if (ladder.length !== TIER_COUNT) throw new Error("skills ladder and fruit list differ in length");
    const jobs = getCvJobs("en");
    return ladder.map((d, tier) => {
        const hits = jobs.filter((j) => j.techStack.some((t) => d.aliases.includes(t)));
        const employers = [...new Set(hits.map((j) => j.timelineCompany))];
        const months = unionMonths(hits.map((j) => parseDateRange(j.dateRange, now)));
        // TDD is only listed at Hedin (0.4 y): a years badge would undersell
        // it, so the method rungs show proof instead of years.
        const method = d.proof !== undefined;
        return {
            id: d.id,
            tier,
            fruit: FRUITS[tier],
            label: d.label[lang],
            short: (d.short ?? d.label)[lang],
            years: method || !d.aliases.length ? null : Math.round((months / 12) * 10) / 10,
            employers: method ? [] : employers,
            line: d.line[lang],
            proof: d.proof?.[lang] ?? null,
            slug: d.slug ?? null,
            pillar: pillarDefs.find((p) => p.rung === d.id)?.id ?? null,
        };
    });
}

export function getSkillPillars(lang: Lang): SkillPillar[] {
    return pillarDefs.map((p) => ({
        id: p.id,
        rung: p.rung,
        label: p.label[lang],
        value: p.value[lang],
        slug: p.slug,
    }));
}

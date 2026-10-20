import { getCvJobs } from "./cv";
import type { ProjectSlug } from "./projects";
import type { Lang } from "./ui";

/**
 * Skills for the "Stacken" fruit bowl (slide 5).
 *
 * Two kinds of fruit:
 * - Pillars: what William sells. Sized big on purpose and backed by proof
 *   (talks, open source, client results), not by years.
 * - Tools: sized by years on assignments where the tool was in the stack.
 *   Years and employers are COMPUTED from `techStack` + `dateRange` in cv.ts,
 *   so the bowl cannot drift from the CV.
 *
 * "Years" means "years on assignments where the tool was in the stack",
 * not hours of hands-on use. The copy says "years on the job" for that reason.
 */

type Bi = { sv: string; en: string };

export type SkillId =
    | "tdd" | "ai" | "coaching"
    | "typescript" | "react" | "node" | "angular" | "vue" | "next"
    | "devops" | "cloud" | "csharp" | "microfrontends";

interface SkillDef {
    id: SkillId;
    label: Bi;
    pillar: boolean;
    /** cv.ts techStack names that count as this skill (tools only). */
    aliases: string[];
    /** Plain-language "what it buys you" line for a non-technical reader. */
    value: Bi;
    /** Pillars: the proof line shown instead of years. */
    proof?: Bi;
    /** Pillars: one-line client promise ("You get: ...") on the left-column card only. */
    gets?: Bi;
    proofSlug?: ProjectSlug;
}

const defs: SkillDef[] = [
    {
        id: "tdd", pillar: true, aliases: ["TDD"],
        label: { sv: "Testa först", en: "Test first" },
        value: {
            sv: "Jag skriver testet innan koden. Då kan vi ändra snabbt utan att något annat går sönder.",
            en: "I write the test before the code, so we can change things fast without breaking anything else.",
        },
        proof: {
            sv: "TDD i 90% av arbetet hos Hedin gav buggfria leveranser.",
            en: "TDD in 90% of the work at Hedin meant bug-free deliveries.",
        },
        proofSlug: "tdd-command-generator",
        gets: {
            sv: "Kod som går att ändra utan rädsla.",
            en: "Code you can change without fear.",
        },
    },
    {
        id: "ai", pillar: true, aliases: [],
        label: { sv: "AI-agenter", en: "AI agents" },
        value: {
            sv: "AI gör kod billigare. Jag ser till att det inte blir billig kod, och lär ditt team göra likadant.",
            en: "AI makes code cheaper. I make sure it doesn't make cheap code, and teach your team to do the same.",
        },
        proof: {
            sv: "Lottningen till en schackturnering för ~500 barn: AI-kodad, inte en rad skriven för hand.",
            en: "The pairing tool for a chess event with ~500 kids: AI-coded, not one line typed by hand.",
        },
        proofSlug: "legacy-chess-tool-rewrite",
        gets: {
            sv: "Ett team som vet när AI:n går att lita på, och när den inte gör det.",
            en: "A team that knows when to trust the AI, and when not to.",
        },
    },
    {
        id: "coaching", pillar: true, aliases: [],
        label: { sv: "Coachning", en: "Coaching" },
        value: {
            sv: "Mob programming, coachning och rekrytering. Folk tar mer ägarskap och ställer rätt frågor.",
            en: "Mob programming, coaching and hiring. People take more ownership and ask the right questions.",
        },
        proof: {
            sv: "Stöttade 14 utvecklingsteam på Telia. Rekryterade 6 personer på 6 månader.",
            en: "Supported 14 development teams at Telia. Hired 6 people in 6 months.",
        },
        proofSlug: "sembo-se-startpage",
        gets: {
            sv: "Ett team som fortsätter dra åt samma håll när jag har gått vidare.",
            en: "A team that keeps pulling in the same direction after I move on.",
        },
    },
    {
        id: "typescript", pillar: false, aliases: ["TypeScript"],
        label: { sv: "TypeScript", en: "TypeScript" },
        value: {
            sv: "Färre fel når användarna, för att koden kollar sig själv.",
            en: "Fewer bugs reach your users, because the code checks itself.",
        },
    },
    {
        id: "react", pillar: false, aliases: ["React"],
        label: { sv: "React", en: "React" },
        value: {
            sv: "Det mesta du klickar i på webben i dag är byggt med det här.",
            en: "Most of what you click on the web today is built with this.",
        },
    },
    {
        id: "node", pillar: false, aliases: ["Node.js"],
        label: { sv: "Node.js", en: "Node.js" },
        value: {
            sv: "Servern bakom sajten, i samma språk som sajten.",
            en: "The server behind the site, in the same language as the site.",
        },
    },
    {
        id: "angular", pillar: false, aliases: ["Angular"],
        label: { sv: "Angular", en: "Angular" },
        value: {
            sv: "Storbolagens favorit. Finns den redan hos er så jobbar jag i den.",
            en: "A big-company favourite. If you already have it, I work in it.",
        },
    },
    {
        id: "vue", pillar: false, aliases: ["Vue"],
        label: { sv: "Vue", en: "Vue" },
        value: {
            sv: "Ännu ett ramverk. Jag väljer inte sida, jag väljer det ni har.",
            en: "Another framework. I don't pick sides, I pick what you have.",
        },
    },
    {
        id: "next", pillar: false, aliases: ["Next.js"],
        label: { sv: "Next.js", en: "Next.js" },
        value: {
            sv: "Snabba sidor som Google hittar.",
            en: "Fast pages that Google can find.",
        },
    },
    {
        id: "devops", pillar: false, aliases: ["DevOps"],
        label: { sv: "DevOps / CI/CD", en: "DevOps / CI/CD" },
        value: {
            sv: "Varje ändring testas och skeppas automatiskt.",
            en: "Every change gets tested and shipped automatically.",
        },
    },
    {
        id: "cloud", pillar: false, aliases: ["AWS", "Azure"],
        label: { sv: "AWS / Azure", en: "AWS / Azure" },
        value: {
            sv: "Molnet, uppsatt så att det bara funkar.",
            en: "The cloud, set up so it just works.",
        },
    },
    {
        id: "csharp", pillar: false, aliases: ["C#"],
        label: { sv: "C# / .NET", en: "C# / .NET" },
        value: {
            sv: "Windows-system som fortfarande drar in pengar.",
            en: "Windows systems that still make money.",
        },
    },
    {
        id: "microfrontends", pillar: false, aliases: ["Single-SPA"],
        label: { sv: "Micro-frontends", en: "Micro-frontends" },
        value: {
            sv: "Många team kan bygga samma sajt utan att trampa varandra på tårna.",
            en: "Many teams can ship one website without stepping on each other's toes.",
        },
    },
];

/**
 * Combos: two skills that met in one real piece of work. Throwing one fruit
 * into its partner reveals the story. Every fact is from cv.ts or projects.ts.
 */
interface ComboDef {
    pair: [SkillId, SkillId];
    title: Bi;
    body: Bi;
    slug?: ProjectSlug;
}

const comboDefs: ComboDef[] = [
    {
        pair: ["tdd", "ai"],
        title: { sv: "TDD för AI-agenter", en: "TDD for AI agents" },
        body: {
            sv: "Färdiga kommandon som får AI-agenter att skriva testet först. Open source, 100 GitHub-stjärnor på under två dygn.",
            en: "Ready-made commands that make AI agents write the test first. Open source, 100 GitHub stars in under two days.",
        },
        slug: "tdd-command-generator",
    },
    {
        pair: ["tdd", "csharp"],
        title: { sv: "Hedin: buggfritt", en: "Hedin: bug-free" },
        body: {
            sv: "Backend i C# där testdriven utveckling i 90% av arbetet gav buggfria leveranser.",
            en: "A C# backend where test-driven development in 90% of the work meant bug-free deliveries.",
        },
    },
    {
        pair: ["ai", "coaching"],
        title: { sv: "Lära ut AI", en: "Teaching AI" },
        body: {
            sv: "En presentation om testdriven utveckling med AI-agenter, byggd helt med Claude Code och redo att köras.",
            en: "A talk on test-driven development with AI coding agents, built entirely with Claude Code and ready to run.",
        },
        slug: "tdd-command-generator",
    },
    {
        pair: ["microfrontends", "coaching"],
        title: { sv: "Telia: 6 team, en sajt", en: "Telia: 6 teams, one site" },
        body: {
            sv: "Ledde frontend-omställningen för B2B på telia.se, totalt 6 utvecklingsteam. Designade en micro-frontend-arkitektur för Telias blandning av ramverk.",
            en: "Led the frontend transformation for B2B on telia.se, 6 development teams in total. Designed a micro-frontend architecture for Telia's mix of frameworks.",
        },
        slug: "telia-se",
    },
    {
        pair: ["react", "coaching"],
        title: { sv: "Sembo: startsidan", en: "Sembo: the startpage" },
        body: {
            sv: "Ledde omdesignen av Sembo.se:s startsida genom att coacha teamet. Utvecklarna tog mer ägarskap och ställde rätt frågor.",
            en: "Led the Sembo.se startpage redesign by coaching the team. The developers took more ownership and asked the right questions.",
        },
        slug: "sembo-se-startpage",
    },
    {
        pair: ["typescript", "csharp"],
        title: { sv: "HPE: 5 000 användare", en: "HPE: 5,000 users" },
        body: {
            sv: "Byggde 8 interna verktyg. Ett av dem växte till 5 000 aktiva användare och nominerades till ett internt företagspris.",
            en: "Built 8 internal tools. One of them grew to 5,000 active users and was nominated for an internal company award.",
        },
    },
    {
        pair: ["angular", "next"],
        title: { sv: "NetConsult: 7 produkter", en: "NetConsult: 7 products" },
        body: {
            sv: "Som CTO drev jag den tekniska strategin för 7 klientprodukter samtidigt, från underhåll till MVP-lanseringar.",
            en: "As CTO I drove the technical strategy for 7 client products at once, from maintenance to MVP launches.",
        },
    },
    {
        pair: ["react", "vue"],
        title: { sv: "KITS: legacy-räddning", en: "KITS: legacy rescue" },
        body: {
            sv: "Byggde frontends i React, Angular och Vue åt flera kunder, och skrev ensam om ett system som inte skalade till React.",
            en: "Built frontends in React, Angular and Vue for several clients, and single-handedly rewrote a system that didn't scale into React.",
        },
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

/** Fruit tier for tools: cherry < 2 y, strawberry 2–4, grape 4–6, orange 6–8, apple 8+. */
export function tierForYears(years: number): number {
    if (years >= 8) return 4;
    if (years >= 6) return 3;
    if (years >= 4) return 2;
    if (years >= 2) return 1;
    return 0;
}

/** Pillar fruits, one per pillar, above every tool tier. */
const PILLAR_TIER: Partial<Record<SkillId, number>> = { tdd: 6, ai: 5, coaching: 7 };

export interface SkillProfile {
    id: SkillId;
    label: string;
    pillar: boolean;
    tier: number;
    /** Years on assignments with this tool in the stack (tools only), 1 decimal. */
    years: number | null;
    /** Employers (timeline names, most recent first) whose stack lists the tool. */
    employers: string[];
    value: string;
    proof: string | null;
    proofSlug: ProjectSlug | null;
    gets: string | null;
}

export interface SkillCombo {
    pair: [SkillId, SkillId];
    title: string;
    body: string;
    slug: ProjectSlug | null;
}

export function getSkillProfiles(lang: Lang, now: Date = new Date()): SkillProfile[] {
    const jobs = getCvJobs("en");
    return defs.map((d) => {
        const hits = jobs.filter((j) => j.techStack.some((t) => d.aliases.includes(t)));
        const employers = [...new Set(hits.map((j) => j.timelineCompany))];
        const months = unionMonths(hits.map((j) => parseDateRange(j.dateRange, now)));
        const years = d.pillar ? null : Math.round((months / 12) * 10) / 10;
        return {
            id: d.id,
            label: d.label[lang],
            pillar: d.pillar,
            tier: d.pillar ? PILLAR_TIER[d.id]! : tierForYears(years ?? 0),
            years,
            employers,
            value: d.value[lang],
            proof: d.proof?.[lang] ?? null,
            proofSlug: d.proofSlug ?? null,
            gets: d.gets?.[lang] ?? null,
        };
    });
}

export function getSkillCombos(lang: Lang): SkillCombo[] {
    return comboDefs.map((c) => ({
        pair: c.pair,
        title: c.title[lang],
        body: c.body[lang],
        slug: c.slug ?? null,
    }));
}

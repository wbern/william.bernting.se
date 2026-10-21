import type { Lang } from "./ui";
import { trackEntries, type TrackId } from "./contact";

/**
 * Hero marquee: one row per track (teach / legacy / build), each with a few
 * short claims and a one-line plain-language payoff shown on hover/tap.
 *
 * Sources for every caption:
 * - teach-ai: vibecoding-post-linkedin-2026-10-15 (school kids) + talks to dev teams (LinkedIn About, Sep 2026)
 * - coach: cv.ts Telia bullet ("kunskapsdelning till 14 utvecklingsteam")
 * - team: cv.ts NetConsult bullet ("rekryterade 6 utvecklare/UX-proffs inom 6 månader")
 * - legacy: cv.ts traits ("Legacy-dykare")
 * - debug: ui.ts print.traits.debug
 * - rescue: cv.ts KITS bullet (rewrote a custom framework that didn't scale, to React)
 * - ship: cv.ts Sembo bullet ("högsta individuella output i ett 11-personersteam")
 * - fixed: LinkedIn About (Sep 2026), post 2026-04-22, cv.ts intro ("fast pris")
 * - automate: cv.ts HPE bullet (internal tool, 5 000 active users)
 */

export interface TraitCopy {
  label: string;
  caption: string;
}

export interface TraitEntry {
  /** Stable concept id, shared by both locales */
  id: string;
  sv: TraitCopy;
  en: TraitCopy;
}

export type TraitSpeed = "slow" | "mid" | "fast";
export type TraitSize = "lg" | "md" | "sm";

interface TraitRowEntry {
  track: TrackId;
  speed: TraitSpeed;
  size: TraitSize;
  /** Drift right-to-left (default) or left-to-right */
  reverse: boolean;
  items: TraitEntry[];
}

export interface Trait extends TraitCopy {
  id: string;
}

export interface TraitRow {
  track: TrackId;
  color: string;
  speed: TraitSpeed;
  size: TraitSize;
  reverse: boolean;
  items: Trait[];
}

const traitRowEntries: TraitRowEntry[] = [
  {
    track: "teach",
    speed: "slow",
    size: "lg",
    reverse: false,
    items: [
      {
        id: "teach-ai",
        sv: { label: "Lär ut AI", caption: "Från skolbarn till utvecklarteam: alla kan bygga med AI." },
        en: { label: "Teaches AI", caption: "From school kids to dev teams: anyone can build with AI." },
      },
      {
        id: "coach",
        sv: { label: "Coach & mentor", caption: "Delade kunskap med 14 utvecklingsteam på Telia, varje vecka." },
        en: { label: "Coach & mentor", caption: "Shared know-how with 14 dev teams at Telia, every week." },
      },
      {
        id: "team",
        sv: { label: "Teambyggare", caption: "Rekryterade 6 utvecklare och UX:are på 6 månader." },
        en: { label: "Team builder", caption: "Hired 6 developers and UX designers in 6 months." },
      },
    ],
  },
  {
    track: "legacy",
    speed: "mid",
    size: "md",
    reverse: true,
    items: [
      {
        id: "legacy",
        sv: { label: "Legacy-dykare", caption: "Räddar gamla kodbaser när andra vill börja om från noll." },
        en: { label: "Legacy diver", caption: "Rescues old codebases when everyone else wants to start over." },
      },
      {
        id: "debug",
        sv: { label: "Felsöker det knepiga", caption: "Felsökningen som får andra att vilja skriva om allt." },
        en: { label: "Fixes the tricky bugs", caption: "The debugging that makes others want to rewrite everything." },
      },
      {
        id: "rescue",
        sv: { label: "Räddar kodbaser", caption: "Skrev ensam om ett system som inte skalade, till React." },
        en: { label: "Codebase rescue", caption: "Single-handedly rebuilt a system that didn’t scale, in React." },
      },
    ],
  },
  {
    track: "build",
    speed: "fast",
    size: "sm",
    reverse: false,
    items: [
      {
        id: "ship",
        sv: { label: "Levererar ofta", caption: "Högst individuell output i ett team på elva." },
        en: { label: "Ships often", caption: "Highest individual output in a team of eleven." },
      },
      {
        id: "fixed",
        sv: { label: "Fast pris", caption: "Du vet vad det kostar innan vi börjar." },
        en: { label: "Fixed price", caption: "You know the price before we start." },
      },
      {
        id: "automate",
        sv: { label: "Automatiserar det tråkiga", caption: "Ett internt verktyg jag byggde på HPE fick 5 000 användare." },
        en: { label: "Automates the boring stuff", caption: "An internal tool I built at HPE grew to 5,000 users." },
      },
    ],
  },
];

export function getTraitRows(lang: Lang): TraitRow[] {
  return traitRowEntries.map((entry) => {
    const track = trackEntries.find((t) => t.id === entry.track)!;
    return {
      track: entry.track,
      color: track.color,
      speed: entry.speed,
      size: entry.size,
      reverse: entry.reverse,
      items: entry.items.map((item) => ({ id: item.id, ...item[lang] })),
    };
  });
}

export { traitRowEntries };

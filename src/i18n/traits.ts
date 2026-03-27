import type { Lang } from "./ui";

export interface TraitRow {
  items: string[];
  speed: string;
  size: string;
  style: string;
}

interface TraitRowEntry {
  sv: string[];
  en: string[];
  speed: string;
  size: string;
  style: string;
}

const traitRowEntries: TraitRowEntry[] = [
  {
    sv: ["AI-native-byggare", "Teambyggare", "Felsökare", "\u201CLegacy-dykare\u201D"],
    en: ["AI-Native Builder", "Team-builder", "Debugger", "\u201CLegacy Diver\u201D"],
    speed: "slow", size: "lg", style: "accent",
  },
  {
    sv: ["Agentiska arbetsflöden", "Coach & mentor", "Felsökningsexpert", "Kodbas-räddning"],
    en: ["Agentic Workflows", "Coach & Mentor", "Troubleshooter", "Codebase Rescue"],
    speed: "mid", size: "md", style: "dim",
  },
  {
    sv: ["Leverera med AI", "Bygg bra team", "Djupdykare", "Moderniserare"],
    en: ["Ship with AI", "Build Great Teams", "Deep Diver", "Modernizer"],
    speed: "fast", size: "lg", style: "bright",
  },
  {
    sv: ["allt \u00E4r AI", "rekryterat talang", "komplex fels\u00F6kning", "r\u00E4ddat kodbaser"],
    en: ["every project is AI", "recruited talent", "complex debugging", "rescued codebases"],
    speed: "mid2", size: "sm", style: "dim",
  },
  {
    sv: ["AI-samarbete", "Enat avdelningar", "Omskrivnings-viskare", "Legacy-expert"],
    en: ["AI Collaboration", "Unified Departments", "Rewrite Whisperer", "Legacy Expert"],
    speed: "slow2", size: "md", style: "accent",
  },
];

export function getTraitRows(lang: Lang): TraitRow[] {
  return traitRowEntries.map((entry) => ({
    items: entry[lang],
    speed: entry.speed,
    size: entry.size,
    style: entry.style,
  }));
}

export { traitRowEntries };

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
    sv: ["Snabb prototypare", "Teambyggare", "Fels\u00F6kare", "\u201CLegacy-diver\u201D"],
    en: ["Rapid Prototyper", "Team-builder", "Debugger", "\u201CLegacy Diver\u201D"],
    speed: "slow", size: "lg", style: "accent",
  },
  {
    sv: ["Snabba leveranser", "Coach & mentor", "Fels\u00F6kningsexpert", "Kodbas-r\u00E4ddning"],
    en: ["Rapid Delivery", "Coach & Mentor", "Troubleshooter", "Codebase Rescue"],
    speed: "mid", size: "md", style: "dim",
  },
  {
    sv: ["Levererar", "Hemsidebyggare", "Djupdykare", "Evangelist"],
    en: ["Ship Often", "Build Great Teams", "Deep Diver", "Evangelist"],
    speed: "fast", size: "lg", style: "bright",
  },
  {
    sv: ["AI n\u00E4r det beh\u00F6vs", "rekryterat talang", "komplex fels\u00F6kning", "r\u00E4ddat kodbaser"],
    en: ["AI when it matters", "recruited talent", "complex debugging", "rescued codebases"],
    speed: "mid2", size: "sm", style: "dim",
  },
  {
    sv: ["Automatisering", "M\u00E4nniskok\u00E4nnare", "AI-enablad utvecklare", "Legacy-expert"],
    en: ["Automation", "People-person", "AI-Enabled Coder", "Legacy Expert"],
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

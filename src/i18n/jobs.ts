import type { Lang } from "./ui";
import { blockWidth, jobMeta } from "./cv";

export interface Job {
  /** Stable id, shared with the timeline stories (src/i18n/timeline.ts) */
  id: string;
  date: string;
  role: string;
  company: string;
  color: string;
  /** Block width on the 20–100 scale, proportional to months in the role */
  w: number;
  /** Still going — the block has an open right edge */
  ongoing: boolean;
  /** Client work done through KenDev AB (drawn with the freelance rail) */
  freelance: boolean;
}

interface JobEntry {
  id: string;
  sv: { role: string; company: string };
  en: { role: string; company: string };
  date: string;
  color: string;
  w: number;
  ongoing: boolean;
  freelance: boolean;
}

/**
 * The own agency sits on top of the tower. It is timeline-only (not a CV
 * job): freelancing through KenDev AB since May 2023, running his own
 * one-person agency, En Mans Byrå (part of KenDev AB), with his own clients
 * since April 2026 (LinkedIn post
 * 2026-03-30: "Mitt nuvarande uppdrag slutar den 17 april").
 * Months is the age of the agency at time of writing; the block is drawn
 * as "ongoing" so the exact width matters less than the open edge.
 */
const AGENCY: JobEntry = {
  id: "kendev",
  sv: { role: "Egen byrå", company: "En Mans Byrå" },
  en: { role: "Own agency", company: "En Mans Byrå" },
  date: "2026 —",
  color: "#ececf4",
  w: blockWidth(6),
  ongoing: true,
  freelance: true,
};

// Derive timeline job entries from cv.ts jobMeta (shared source of truth)
const jobEntries: JobEntry[] = [
  AGENCY,
  ...jobMeta.map((meta) => ({
    id: meta.id,
    sv: { role: meta.timelineRole.sv, company: meta.timelineCompany },
    en: { role: meta.timelineRole.en, company: meta.timelineCompany },
    date: meta.timelineDate,
    color: meta.color,
    w: meta.w,
    ongoing: false,
    freelance: Boolean(meta.freelance),
  })),
];

/** Jobs newest first (agency, Akka, …, HP). */
export function getJobs(lang: Lang): Job[] {
  return jobEntries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    role: entry[lang].role,
    company: entry[lang].company,
    color: entry.color,
    w: entry.w,
    ongoing: entry.ongoing,
    freelance: entry.freelance,
  }));
}

export { jobEntries };

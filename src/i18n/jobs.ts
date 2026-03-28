import type { Lang } from "./ui";
import { jobMeta } from "./cv";

export interface Job {
  date: string;
  role: string;
  company: string;
  color: string;
  w: number;
}

interface JobEntry {
  sv: { role: string; company: string };
  en: { role: string; company: string };
  date: string;
  color: string;
  w: number;
}

// Derive timeline job entries from cv.ts jobMeta (shared source of truth)
const jobEntries: JobEntry[] = jobMeta.map((meta) => ({
  sv: { role: meta.timelineRole.sv, company: meta.timelineCompany },
  en: { role: meta.timelineRole.en, company: meta.timelineCompany },
  date: meta.timelineDate,
  color: meta.color,
  w: meta.w,
}));

export function getJobs(lang: Lang): Job[] {
  return jobEntries.map((entry) => ({
    date: entry.date,
    role: entry[lang].role,
    company: entry[lang].company,
    color: entry.color,
    w: entry.w,
  }));
}

export { jobEntries };

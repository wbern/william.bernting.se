import type { Lang } from "./ui";

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

const jobEntries: JobEntry[] = [
  { date: "2025 —", sv: { role: "Frontendutvecklare", company: "Akka" }, en: { role: "Frontend Developer", company: "Akka" }, color: "#00d4aa", w: 50 },
  { date: "2025", sv: { role: "Backendutvecklare (C#)", company: "Hedin IT" }, en: { role: "Backend Dev (C#)", company: "Hedin IT" }, color: "#f0a030", w: 35 },
  { date: "2023 – 25", sv: { role: "Utvecklare → Tech Lead", company: "Sembo" }, en: { role: "Dev → Tech Lead", company: "Sembo" }, color: "#9b4dca", w: 80 },
  { date: "2022 – 23", sv: { role: "Utvecklare → CTO", company: "NetConsult" }, en: { role: "Dev → CTO", company: "NetConsult" }, color: "#e84060", w: 55 },
  { date: "2020 – 22", sv: { role: "Senior → Lead", company: "Telia" }, en: { role: "Senior → Lead", company: "Telia" }, color: "#40a0e8", w: 95 },
  { date: "2017 – 20", sv: { role: "Systemutvecklare", company: "KITS AB" }, en: { role: "Systems Developer", company: "KITS AB" }, color: "#50c040", w: 70 },
  { date: "2011 – 16", sv: { role: "Koordinator → Teamledare", company: "HPE" }, en: { role: "Coord → Team Lead", company: "HPE" }, color: "#e8e040", w: 100 },
];

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

import type { Lang } from "./ui";

// ===== Type definitions =====

export interface CvProfile {
  name: string;
  subtitle: string;
  contacts: { icon: "phone" | "email" | "link" | "location" | "web"; text: string; href?: string }[];
  intro: string[];
}

export interface CvJob {
  title: string;
  company: string;
  companyDescription?: string;
  dateRange: string;
  location: string;
  techStack: string[];
  bullets: string[];
  /** Color for timeline tower visualization */
  color: string;
  /** Width percentage for timeline tower (50-100) */
  w: number;
  /** Short date label for timeline (e.g. "2025 —") */
  timelineDate: string;
  /** Short role for timeline (e.g. "Frontend Developer") */
  timelineRole: { sv: string; en: string };
  /** Short company for timeline */
  timelineCompany: string;
}

export interface CvEducation {
  degree: string;
  institution: string;
  dateRange: string;
}

export interface CvLanguage {
  name: string;
  proficiency: string;
  level: number; // 1-5
}

export interface CvBook {
  title: string;
  author: string;
}

export interface CvAcknowledgement {
  title: string;
  description: string;
}

export interface CvTrait {
  name: string;
  description: string;
}

export interface CvCommunity {
  title: string;
  organization: string;
  dateRange: string;
}

export interface CvQuote {
  text: string;
  author: string;
}

// ===== Shared data (language-independent) =====

const skills = [
  "Agentic AI Development",
  "Test-Driven Development",
  "Node.js",
  "DevOps",
  "C#",
  "React",
  "Next.js",
  "TypeScript",
  "Vue",
  "Angular",
  "CI/CD",
  "Project Delivery",
  "TanStack",
  "Astro.js",
];

const books: CvBook[] = [
  { title: "Turn The Ship Around", author: "L. David Marquet" },
  { title: "Think Again", author: "Adam Grant" },
];

const languages: { name: { sv: string; en: string }; proficiency: { sv: string; en: string }; level: number }[] = [
  { name: { sv: "Svenska", en: "Swedish" }, proficiency: { sv: "Modersmål", en: "Native" }, level: 5 },
  { name: { sv: "Engelska", en: "English" }, proficiency: { sv: "Flytande professionell", en: "Full Professional" }, level: 4 },
  { name: { sv: "Danska", en: "Danish" }, proficiency: { sv: "Begränsad", en: "Limited Working" }, level: 2 },
  { name: { sv: "Norska", en: "Norwegian" }, proficiency: { sv: "Begränsad", en: "Limited Working" }, level: 2 },
];

// ===== Bilingual CV data =====

interface CvData {
  profile: CvProfile;
  jobs: Omit<CvJob, "color" | "w" | "timelineDate" | "timelineRole" | "timelineCompany">[];
  education: CvEducation[];
  traits: CvTrait[];
  acknowledgement: CvAcknowledgement;
  community: CvCommunity[];
  quote: CvQuote;
}

const cv: Record<Lang, CvData> = {
  sv: {
    profile: {
      name: "William Bernting",
      subtitle: "Enmansbyrå – Fullstack & AI-förstärkt utveckling",
      contacts: [
        { icon: "phone", text: "(+46) 0706676047", href: "tel:+46706676047" },
        { icon: "email", text: "william@bernting.se", href: "mailto:william@bernting.se" },
        { icon: "link", text: "linkedin.com/in/williambernting", href: "https://www.linkedin.com/in/williambernting" },
        { icon: "location", text: "Göteborg, Sverige" },
        { icon: "web", text: "kendev.se", href: "https://kendev.se" },
      ],
      intro: [
        "Jag räddar legacykodbaser, bygger nya produkter och förstärker befintliga team med <strong>AI-augmenterad utveckling</strong>. Ett internt verktyg jag byggde hos ett Fortune 500-företag växte organiskt till <strong>5 000 aktiva användare</strong> — jag levererar mjukvara som folk faktiskt använder.",
        "Starkast inom <strong>Engineering</strong>, med praktisk erfarenhet inom <strong>Produkt</strong> och <strong>UX</strong>. Jag tar uppdrag fasvis eller löpande — hör av dig så pratar vi om vad som passar.",
      ],
    },
    jobs: [
      {
        title: "Frontendutvecklare",
        company: "Akka",
        dateRange: "08/2025 – Pågående",
        location: "Göteborg, Sverige",
        techStack: ["React", "TanStack"],
        bullets: [],
      },
      {
        title: "Backendutvecklare (C#)",
        company: "Hedin IT (del av Hedin Automotive)",
        companyDescription: "Internationell bilhandlare & importör",
        dateRange: "03/2025 – 08/2025",
        location: "Mölndal, Göteborg",
        techStack: ["C#", "Blazor", "Azure", "TDD", "DevOps"],
        bullets: [
          "<strong>En drömmatchning.</strong> Allt började med en rolig träff med ett utvecklarteam, som blev till något mer... ett frilansuppdrag.",
          "<strong>Mogna metoder</strong> som testdriven utveckling i 90% av arbetet resulterade i buggfria leveranser.",
          "<strong>Enade ett fragmenterat utvecklingsteam</strong> samtidigt som strukturella problem inom avdelningen belystes.",
        ],
      },
      {
        title: "Utvecklare → Tech Lead",
        company: "Sembo Group",
        companyDescription: "En resebyrå på webben",
        dateRange: "05/2023 – 03/2025",
        location: "Göteborg, Sverige (Remote)",
        techStack: ["React", "Next.js", "TypeScript", "Sanity CMS", "Node.js", "DevOps"],
        bullets: [
          "Gav <strong>personlig coachning</strong> till teamets utvecklare, vilket ledde till att de tog mer ägarskap och ställde rätt frågor.",
          "Deltog i <strong>rekrytering och onboarding av 4 nya teammedlemmar</strong>.",
          "Introducerade en <strong>headless CMS-arkitektur</strong> med en <strong>content-first-strategi</strong> som accelererade utvecklingen på ett hållbart sätt.",
          "Högsta individuella output i ett <strong>11-personersteam</strong> — levererade headless CMS, sökfunktioner och kampanjsidor i hög takt.",
        ],
      },
      {
        title: "Utvecklingschef / CTO",
        company: "NetConsult Sweden AB",
        companyDescription: "Webbyrå",
        dateRange: "05/2022 – 05/2023",
        location: "Göteborg, Sverige",
        techStack: ["Angular", "Next.js", "TypeScript", "WordPress", "AWS", "PHP", "DevOps"],
        bullets: [
          "Byggde upp utvecklingsavdelningen: <strong>rekryterade 6 utvecklare/UX-proffs inom 6 månader</strong>, från jobbannons till signerat kontrakt.",
          "Drev <strong>teknisk strategi över 7 klientprodukter</strong> parallellt — från underhåll till MVP-lanseringar.",
          "Levererade resultat genom <strong>10 fullstack-utvecklare</strong> i 2 team med högt samarbete mellan produkt, utveckling och UX.",
        ],
      },
      {
        title: "Lead-utvecklare",
        company: "Telia Sverige",
        companyDescription: "Digital Channels",
        dateRange: "02/2021 – 04/2022",
        location: "Göteborg, Sverige",
        techStack: ["Node.js", "TypeScript", "Angular", "Vue", "React", "Single-SPA", "Next.js", "AWS", "Monorepos"],
        bullets: [
          "Tillhandahöll <strong>teknisk kunskapsdelning till 14 utvecklingsteam</strong>, primärt för www.telia.se, genom veckovis praktisk vägledning och genom att bygga automatiserade verktyg och plattformar.",
          "<strong>Organiserade event</strong> och faciliterade supportsessioner för att stärka utvecklingsteamens förmåga att leverera digitala tjänster.",
          "Underhöll och <strong>utvecklade ett monorepo för 14 utvecklingsteam</strong> i samarbete med ett plattformsteam.",
        ],
      },
      {
        title: "Senior mjukvaruingenjör",
        company: "Telia Sverige",
        companyDescription: "Digital Channels",
        dateRange: "08/2020 – 02/2021",
        location: "Göteborg, Sverige",
        techStack: ["Node.js", "TypeScript", "Angular", "Vue", "React", "Single-SPA", "Next.js", "AWS", "Monorepos"],
        bullets: [
          "Ledde frontend-transformationen för B2B-enheten på telia.se, med <strong>totalt 6 utvecklingsteam</strong>.",
          "Designade en <strong>micro-frontend-arkitektur</strong> anpassad efter multi-ramverksuppsättningen som var i linje med Telias tekniska strategi.",
        ],
      },
      {
        title: "Systemutvecklare",
        company: "KITS AB",
        companyDescription: "IT-konsultbolag",
        dateRange: "02/2017 – 08/2020",
        location: "Göteborg, Sverige",
        techStack: ["Node.js", "TypeScript", "Angular", "Vue", "React"],
        bullets: [
          "Levererade frontend-lösningar i <strong>React, Angular och Vue</strong> åt flera klienter.",
          "Räddade en legacy-kodbas: ensam skrev om hela systemet från ett <strong>egenutvecklat ramverk som inte skalade, till React</strong>.",
        ],
      },
      {
        title: "Teamledare & verktygsutvecklare",
        company: "Hewlett Packard Enterprise",
        companyDescription: "IT-tjänster – Drift",
        dateRange: "11/2015 – 12/2016",
        location: "Göteborg, Sverige",
        techStack: ["C#", "TypeScript", "AutoIt", "PHP"],
        bullets: [
          "Byggde <strong>8 interna verktyg</strong> som ökade produktiviteten — ett av dem växte till <strong>5 000 aktiva användare</strong> och nominerades till ett internt företagspris.",
          "Ledde <strong>10 kundtjänstagenter</strong> på den nordiska marknaden.",
        ],
      },
    ],
    education: [
      { degree: "Gymnasie, EC/Data", institution: "NTI-skolan", dateRange: "2006 – 2009" },
    ],
    traits: [
      { name: "Teambyggare", description: "Alltid involverad i att bygga riktigt bra team." },
      { name: "Felsökare", description: "Älskar komplex felsökning." },
      { name: "\"Legacy-dykare\"", description: "Har en meritlista av att rädda legacykodbaser när andra ville skriva om dem från grunden." },
    ],
    acknowledgement: {
      title: "\"Company Presidential Nomination\"",
      description: "Skapade ett internt arbetsverktyg hos ett amerikanskt Fortune 500-företag som organiskt växte till <strong>5 000 aktiva användare</strong> och avsevärt ökade produktiviteten bland kundtjänstagenter.",
    },
    community: [
      { title: "Teknikcollege Styrgruppsordförande", organization: "NTI Gymnasiet Kronhus", dateRange: "2018 – Pågående" },
    ],
    quote: {
      text: "\u201CDet är i görandet av arbetet som vi upptäcker arbetet vi behöver göra.\u201D",
      author: "Woody Zuill",
    },
  },
  en: {
    profile: {
      name: "William Bernting",
      subtitle: "One-Man Agency – Fullstack & AI-Augmented Development",
      contacts: [
        { icon: "phone", text: "(+46) 0706676047", href: "tel:+46706676047" },
        { icon: "email", text: "william@bernting.se", href: "mailto:william@bernting.se" },
        { icon: "link", text: "linkedin.com/in/williambernting", href: "https://www.linkedin.com/in/williambernting" },
        { icon: "location", text: "Gothenburg, Sweden" },
        { icon: "web", text: "kendev.se", href: "https://kendev.se" },
      ],
      intro: [
        "I rescue legacy codebases, build new products, and augment existing teams with <strong>AI-powered development</strong>. An internal tool I built at a Fortune 500 company grew organically to <strong>5,000 active users</strong> — I ship software people actually use.",
        "Strongest in <strong>Engineering</strong>, with hands-on experience in <strong>Product</strong> and <strong>UX</strong>. I take on projects in phases or on a continuous basis — reach out and let\u2019s talk about what fits.",
      ],
    },
    jobs: [
      {
        title: "Frontend Developer",
        company: "Akka",
        dateRange: "08/2025 – Present",
        location: "Gothenburg, Sweden",
        techStack: ["React", "TanStack"],
        bullets: [],
      },
      {
        title: "Backend Developer (C#)",
        company: "Hedin IT (part of Hedin Automotive)",
        companyDescription: "International car dealership & importer",
        dateRange: "03/2025 – 08/2025",
        location: "M\u00f6lndal, Gothenburg",
        techStack: ["C#", "Blazor", "Azure", "TDD", "DevOps"],
        bullets: [
          "<strong>A dream match.</strong> It all started with a fun get-together with a dev team, which turned into something more... a freelance assignment.",
          "<strong>Mature methodologies</strong> like Test-Driven Development used in 90% of the work resulted in bug-free deliveries.",
          "<strong>Unified a fragmented development team</strong> while also highlighting structural issues within the department.",
        ],
      },
      {
        title: "Software Developer \u2192 Tech Lead",
        company: "Sembo Group",
        companyDescription: "A travel agency on the web",
        dateRange: "05/2023 – 03/2025",
        location: "Gothenburg, Sweden (Remote)",
        techStack: ["React", "Next.js", "TypeScript", "Sanity CMS", "Node.js", "DevOps"],
        bullets: [
          "Provided <strong>personal coaching</strong> to the team\u2019s developers, which led them to take more ownership and ask the right questions.",
          "Participated in <strong>recruitment and onboarding of 4 new team members</strong>.",
          "Introduced a <strong>headless CMS architecture</strong> with a <strong>content-first strategy</strong> that accelerated development in a sustainable way.",
          "Highest individual output in an <strong>11-person team</strong> — shipped headless CMS, search features, and campaign pages at a rapid pace.",
        ],
      },
      {
        title: "Head of Development / Chief Technology Officer",
        company: "NetConsult Sweden AB",
        companyDescription: "Web agency",
        dateRange: "05/2022 – 05/2023",
        location: "Gothenburg, Sweden",
        techStack: ["Angular", "Next.js", "TypeScript", "WordPress", "AWS", "PHP", "DevOps"],
        bullets: [
          "Built the dev department: <strong>recruited 6 developers/UX professionals within 6 months</strong>, from job posting to signed contract.",
          "Drove <strong>technical strategy across 7 client products</strong> in parallel — from maintenance to MVP launches.",
          "Delivered results through <strong>10 full-stack developers</strong> across 2 teams with tight collaboration between product, engineering, and UX.",
        ],
      },
      {
        title: "Lead Developer",
        company: "Telia Sverige",
        companyDescription: "Digital Channels",
        dateRange: "02/2021 – 04/2022",
        location: "Gothenburg, Sweden",
        techStack: ["Node.js", "TypeScript", "Angular", "Vue", "React", "Single-SPA", "Next.js", "AWS", "Monorepos"],
        bullets: [
          "Provided <strong>technical knowledge sharing to 14 development teams</strong>, primarily for www.telia.se, through weekly hands-on guidance and by building automated tools and platforms.",
          "<strong>Organized events</strong> and facilitated support sessions to strengthen development teams\u2019 ability to deliver high-quality digital services.",
          "Maintained and <strong>developed a monorepo for 14 development teams</strong> in collaboration with a platform team.",
        ],
      },
      {
        title: "Senior Software Engineer",
        company: "Telia Sverige",
        companyDescription: "Digital Channels",
        dateRange: "08/2020 – 02/2021",
        location: "Gothenburg, Sweden",
        techStack: ["Node.js", "TypeScript", "Angular", "Vue", "React", "Single-SPA", "Next.js", "AWS", "Monorepos"],
        bullets: [
          "Led the frontend technical transformation for the B2B unit of telia.se, involving a <strong>total of 6 development teams</strong>.",
          "Designed a <strong>micro-frontend architecture</strong> tailored to the multi-framework setup that aligned with Telia\u2019s technical strategy.",
        ],
      },
      {
        title: "Systems Developer",
        company: "KITS AB",
        companyDescription: "IT Consultancy",
        dateRange: "02/2017 – 08/2020",
        location: "Gothenburg, Sweden",
        techStack: ["Node.js", "TypeScript", "Angular", "Vue", "React"],
        bullets: [
          "Delivered frontend solutions in <strong>React, Angular, and Vue</strong> for multiple clients.",
          "Rescued a legacy codebase: single-handedly rewrote the entire system from a <strong>custom framework that didn\u2019t scale, to React</strong>.",
        ],
      },
      {
        title: "Team Lead & Tools Developer",
        company: "Hewlett Packard Enterprise",
        companyDescription: "IT Services - Operations",
        dateRange: "11/2015 – 12/2016",
        location: "Gothenburg, Sweden",
        techStack: ["C#", "TypeScript", "AutoIt", "PHP"],
        bullets: [
          "Built <strong>8 internal tools</strong> that boosted productivity — one grew to <strong>5,000 active users</strong> and earned a company-wide presidential nomination.",
          "Led <strong>10 customer support agents</strong> serving the Nordic markets.",
        ],
      },
    ],
    education: [
      { degree: "Upper Secondary, EC/IT", institution: "NTI-skolan", dateRange: "2006 – 2009" },
    ],
    traits: [
      { name: "Team-builder", description: "Always involved in building truly great teams." },
      { name: "Debugger", description: "Loves complex troubleshooting." },
      { name: "\"Legacy Diver\"", description: "Has a track record of rescuing legacy codebases when others wanted to rewrite them from scratch." },
    ],
    acknowledgement: {
      title: "\"Company Presidential Nomination\"",
      description: "Created an internal work tool at a U.S.-based Fortune 500 company that organically grew to <strong>5,000 active users</strong> and significantly boosted productivity among customer support agents.",
    },
    community: [
      { title: "Teknikcollege Steering Committee Chair", organization: "NTI Gymnasiet Kronhus", dateRange: "2018 – Present" },
    ],
    quote: {
      text: "\u201CIt is in the doing of the work that we discover the work that we must do.\u201D",
      author: "Woody Zuill",
    },
  },
};

// Timeline-specific metadata per job (shared between languages)
// months = actual role duration, w = block width derived from months
const jobMetaRaw: { color: string; months: number; timelineDate: string; timelineRole: { sv: string; en: string }; timelineCompany: string }[] = [
  { color: "#00d4aa", months: 7,  timelineDate: "2025 \u2014",   timelineRole: { sv: "Frontendutvecklare", en: "Frontend Developer" }, timelineCompany: "Akka" },
  { color: "#f0a030", months: 5,  timelineDate: "2025",          timelineRole: { sv: "Backendutvecklare",  en: "Backend Developer" },  timelineCompany: "Hedin IT" },
  { color: "#9b4dca", months: 22, timelineDate: "2023 \u2013 25", timelineRole: { sv: "Tech Lead",          en: "Tech Lead" },          timelineCompany: "Sembo" },
  { color: "#e84060", months: 12, timelineDate: "2022 \u2013 23", timelineRole: { sv: "Utvecklingschef",    en: "Head of Dev" },        timelineCompany: "NetConsult" },
  { color: "#40a0e8", months: 14, timelineDate: "2021 \u2013 22", timelineRole: { sv: "Lead-utvecklare",    en: "Lead Developer" },     timelineCompany: "Telia" },
  { color: "#3080c0", months: 6,  timelineDate: "2020 \u2013 21", timelineRole: { sv: "Senior-utvecklare",  en: "Senior Engineer" },    timelineCompany: "Telia" },
  { color: "#50c040", months: 42, timelineDate: "2017 \u2013 20", timelineRole: { sv: "Systemutvecklare",   en: "Systems Developer" },  timelineCompany: "KITS AB" },
  { color: "#e8e040", months: 13, timelineDate: "2015 \u2013 16", timelineRole: { sv: "Teamledare",         en: "Team Lead" },          timelineCompany: "HPE" },
];

const maxMonths = Math.max(...jobMetaRaw.map((j) => j.months));
const jobMeta = jobMetaRaw.map((j) => ({
  ...j,
  w: Math.round(20 + (j.months / maxMonths) * 80),
}));

// ===== Public API =====

export function getCvProfile(lang: Lang): CvProfile {
  return cv[lang].profile;
}

export function getCvJobs(lang: Lang): CvJob[] {
  const jobs = cv[lang].jobs;
  if (jobs.length !== jobMeta.length) {
    throw new Error(`CV jobs (${jobs.length}) and jobMeta (${jobMeta.length}) count mismatch — update both when adding a role`);
  }
  return jobs.map((job, i) => {
    const meta = jobMeta[i];
    return {
      ...job,
      color: meta.color,
      w: meta.w,
      timelineDate: meta.timelineDate,
      timelineRole: meta.timelineRole,
      timelineCompany: meta.timelineCompany,
    };
  });
}

export function getCvEducation(lang: Lang): CvEducation[] {
  return cv[lang].education;
}

export function getCvLanguages(lang: Lang): CvLanguage[] {
  return languages.map((l) => ({
    name: l.name[lang],
    proficiency: l.proficiency[lang],
    level: l.level,
  }));
}

export function getCvBooks(): CvBook[] {
  return books;
}

export function getCvSkills(): string[] {
  return skills;
}

export function getCvTraits(lang: Lang): CvTrait[] {
  return cv[lang].traits;
}

export function getCvAcknowledgement(lang: Lang): CvAcknowledgement {
  return cv[lang].acknowledgement;
}

export function getCvCommunity(lang: Lang): CvCommunity[] {
  return cv[lang].community;
}

export function getCvQuote(lang: Lang): CvQuote {
  return cv[lang].quote;
}

// Re-export jobMeta for backward-compatible jobs.ts derivation
export { jobMeta };

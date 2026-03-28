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
  "Servant Leadership",
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
      subtitle: "Utvecklare / Föreläsare / Frilansare",
      contacts: [
        { icon: "phone", text: "(+46) 0706676047", href: "tel:+46706676047" },
        { icon: "email", text: "william@bernting.se", href: "mailto:william@bernting.se" },
        { icon: "link", text: "linkedin.com/in/williambernting", href: "https://www.linkedin.com/in/williambernting" },
        { icon: "location", text: "Göteborg, Sverige" },
        { icon: "web", text: "kendev.se", href: "https://kendev.se" },
      ],
      intro: [
        "Social frilansande konsult, bäst lämpad för team med stora tydliga och otydliga utmaningar framför sig. Gräver fram dolda problem genom djupt engagemang i det dagliga arbetet.",
        "Starkast inom <strong>Engineering</strong>, med praktisk erfarenhet inom <strong>Produkt</strong> och <strong>UX</strong> genom hela karriären.",
      ],
    },
    jobs: [
      {
        title: "Frontendutvecklare",
        company: "Akka",
        dateRange: "08/2025 – Pågående",
        location: "Göteborg, Sverige",
        techStack: [],
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
          "Stod för <strong>31% av kodkommits</strong> i <strong>teamets repo med 11 utvecklare</strong>.",
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
          "<strong>Rekryterade 6 skickliga utvecklare och/eller UX-proffs inom 6 månader</strong>, från jobbannons till signerat kontrakt.",
          "Ledde den <strong>tekniska strategin över 7 olika klienters produktlandskap</strong>, från underhållsläge till MVP-startup-mentalitet.",
          "Hade personalansvar för <strong>10 fullstack-utvecklare</strong> i 2 utvecklingsteam.",
          "Hög nivå av samarbete mellan produktägare, utvecklare, UX-designers och andra.",
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
          "Djupdykning i webbramverken <strong>React, Angular och Vue</strong> för flera klienter.",
          "Hos en klient, på egen hand enligt uppdrag skrev om en hel kodbas från ett <strong>egenutvecklat ramverk som inte var byggt för skala, till React</strong>.",
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
          "Utvecklade <strong>8 interna verktyg</strong> för att förbättra produktiviteten för kundtjänst och andra avdelningar.",
          "Tjänstgjorde som <strong>teamledare för 10 kundtjänstagenter</strong> på den nordiska marknaden.",
          "Bidrog aktivt till <strong>processutveckling</strong> och <strong>kunskapsöverföring</strong>.",
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
      subtitle: "Developer / Public Speaker / Freelancer",
      contacts: [
        { icon: "phone", text: "(+46) 0706676047", href: "tel:+46706676047" },
        { icon: "email", text: "william@bernting.se", href: "mailto:william@bernting.se" },
        { icon: "link", text: "linkedin.com/in/williambernting", href: "https://www.linkedin.com/in/williambernting" },
        { icon: "location", text: "Gothenburg, Sweden" },
        { icon: "web", text: "kendev.se", href: "https://kendev.se" },
      ],
      intro: [
        "Socially skilled freelance consultant, best suited for teams with big clear and unclear challenges ahead. Unearths hidden problems through deep engagement in day-to-day work.",
        "Strongest in <strong>Engineering</strong>, with hands-on experience gained in <strong>Product</strong> and <strong>UX</strong> throughout my career.",
      ],
    },
    jobs: [
      {
        title: "Frontend Developer",
        company: "Akka",
        dateRange: "08/2025 – Present",
        location: "Gothenburg, Sweden",
        techStack: [],
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
          "Accounted for <strong>31% of code commits</strong> to the <strong>team\u2019s repo of 11 developers</strong>.",
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
          "<strong>Recruited 6 skilled developers and/or UX professionals within 6 months</strong>, from job posting to signed contract.",
          "Led the <strong>technical strategy across 7 different client product landscapes</strong>, ranging from maintenance mode to MVP startup mindset.",
          "Held personnel responsibility for <strong>10 full-stack developers</strong> across 2 development teams.",
          "High level of collaborative work between product owners, developers, UX designers, and others.",
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
          "Deep dive into the web frameworks <strong>React, Angular, and Vue</strong> for multiple clients.",
          "At one client, single-handedly as per assignment rewrote an entire codebase from a <strong>custom-built framework not built for scale, to React</strong>.",
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
          "Developed <strong>8 internal tools</strong> to improve productivity for customer support and other departments.",
          "Served as <strong>team lead for 10 customer support agents</strong> serving the Nordic markets.",
          "Actively contributed to <strong>process development</strong> and <strong>knowledge transfer</strong>.",
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
const jobMeta: { color: string; w: number; timelineDate: string; timelineRole: { sv: string; en: string }; timelineCompany: string }[] = [
  { color: "#00d4aa", w: 50, timelineDate: "2025 \u2014", timelineRole: { sv: "Frontendutvecklare", en: "Frontend Developer" }, timelineCompany: "Akka" },
  { color: "#f0a030", w: 35, timelineDate: "2025", timelineRole: { sv: "Backendutvecklare (C#)", en: "Backend Dev (C#)" }, timelineCompany: "Hedin IT" },
  { color: "#9b4dca", w: 80, timelineDate: "2023 \u2013 25", timelineRole: { sv: "Utvecklare \u2192 Tech Lead", en: "Dev \u2192 Tech Lead" }, timelineCompany: "Sembo" },
  { color: "#e84060", w: 55, timelineDate: "2022 \u2013 23", timelineRole: { sv: "Utvecklare \u2192 CTO", en: "Dev \u2192 CTO" }, timelineCompany: "NetConsult" },
  { color: "#40a0e8", w: 95, timelineDate: "2020 \u2013 22", timelineRole: { sv: "Senior \u2192 Lead", en: "Senior \u2192 Lead" }, timelineCompany: "Telia" },
  { color: "#50c040", w: 70, timelineDate: "2017 \u2013 20", timelineRole: { sv: "Systemutvecklare", en: "Systems Developer" }, timelineCompany: "KITS AB" },
  { color: "#e8e040", w: 100, timelineDate: "2011 \u2013 16", timelineRole: { sv: "Koordinator \u2192 Teamledare", en: "Coord \u2192 Team Lead" }, timelineCompany: "HPE" },
];

// CV has 8 jobs (Telia split into Lead Developer + Senior Software Engineer)
// but the timeline merges both Telia roles into one entry (7 jobMeta entries).
// This mapping resolves the off-by-one: both Telia CV jobs (4,5) → jobMeta[4].
const cvJobToMetaIndex = [0, 1, 2, 3, 4, 4, 5, 6];

// ===== Public API =====

export function getCvProfile(lang: Lang): CvProfile {
  return cv[lang].profile;
}

export function getCvJobs(lang: Lang): CvJob[] {
  return cv[lang].jobs.map((job, i) => {
    const meta = jobMeta[cvJobToMetaIndex[i]];
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

// ===== Timeline-specific merged jobs =====

export interface TimelineJob {
  date: string;
  role: string;
  company: string;
  color: string;
  techStack: string[];
  bullets: string[];
  companyDescription?: string;
}

/** Returns 7 merged job entries for the timeline slide (Telia roles combined). */
export function getTimelineJobs(lang: Lang): TimelineJob[] {
  const cvJobs = cv[lang].jobs;
  return jobMeta.map((meta, metaIdx) => {
    const cvIndices = cvJobToMetaIndex
      .map((mi, ci) => (mi === metaIdx ? ci : -1))
      .filter((ci) => ci >= 0);

    const bullets: string[] = [];
    const techStack: string[] = [];
    let companyDescription: string | undefined;

    for (const ci of cvIndices) {
      const job = cvJobs[ci];
      bullets.push(...job.bullets);
      for (const t of job.techStack) {
        if (!techStack.includes(t)) techStack.push(t);
      }
      if (job.companyDescription) companyDescription = job.companyDescription;
    }

    return {
      date: meta.timelineDate,
      role: meta.timelineRole[lang],
      company: meta.timelineCompany,
      color: meta.color,
      techStack,
      bullets,
      companyDescription,
    };
  });
}

// Re-export jobMeta for backward-compatible jobs.ts derivation
export { jobMeta };

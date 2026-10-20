import type { Lang } from "./ui";
import { getJobs, type Job } from "./jobs";
import { testimonials, type Testimonial } from "./contact";

/**
 * "So what" stories behind each block of the career tower (slide 4).
 *
 * Written for a non-technical reader: one headline outcome, a plain-language
 * line about the company, and one to three short bullets. Every fact traces
 * to src/i18n/cv.ts, src/i18n/projects.ts or William's LinkedIn export
 * (~/Repos/KenDev-AB/linkedin-spelunking, see /tmp research dossier). Do not
 * add numbers here that are not in one of those sources.
 */

export interface StoryCopy {
  /** Full date range shown on the card, e.g. "okt 2011 – dec 2016" */
  period: string;
  /** Plain-language context: what the company is, what the role was */
  context: string;
  /** The one thing a reader should remember */
  headline: string;
  bullets: string[];
  /** Big number shown next to the headline (optional) */
  stat?: { value: string; unit: string };
  /** Small "turning point" pill next to the block label (optional) */
  chip?: string;
}

interface StoryEntry {
  sv: StoryCopy;
  en: StoryCopy;
  /** Recommendation to show, by name in contact.ts testimonials, per locale */
  quoteBy?: Partial<Record<Lang, string>>;
  /** Deep link into the project roulette (slug in projects.ts) */
  project?: string;
  /** Show the "let's talk" call to action on this card */
  cta?: boolean;
}

const stories: Record<string, StoryEntry> = {
  kendev: {
    sv: {
      period: "apr 2026 – nu",
      context: "Min egen enmansbyrå, med ett nätverk av frilansare i ryggen. Frilansat via KenDev AB sedan 2023.",
      headline: "Nu: lär ut AI, dyker in i legacy, bygger det du vill ha.",
      bullets: [
        "<strong>Legacy:</strong> lagade ett program utan källkod som tvingade en kund att starta om servern var 15:e minut.",
        "<strong>Bygga:</strong> flyttade ett gammalt lottningsprogram för schack till webben — det körde en regionfinal i Schack4an med ~500 barn.",
        "<strong>AI:</strong> lät skolbarn vibe-coda sina egna spel. Alla går att spela på vibecoding.bernting.se.",
      ],
      chip: "Nu",
    },
    en: {
      period: "Apr 2026 – now",
      context: "My own one-person agency, backed by a network of freelancers. Freelancing through KenDev AB since 2023.",
      headline: "Now: teaching AI, diving into legacy, building what you want.",
      bullets: [
        "<strong>Legacy:</strong> fixed software with no source code that forced a client to restart their server every 15 minutes.",
        "<strong>Build:</strong> moved an old chess pairing program to the web — it ran a Schack4an regional final with ~500 kids.",
        "<strong>AI:</strong> had school kids vibe-code their own games. Every one of them is playable at vibecoding.bernting.se.",
      ],
      chip: "Now",
    },
    project: "legacy-chess-tool-rewrite",
    cta: true,
  },
  akka: {
    sv: {
      period: "aug 2025 – apr 2026",
      context: "Akka bygger en plattform där företag kör och skalar AI-agenter.",
      headline: "Första committen var inne dag två.",
      bullets: [
        "Byggde frontend i React och TanStack för en plattform som handlar om AI i stor skala.",
        "Var med när bolaget gick AI-first.",
      ],
    },
    en: {
      period: "Aug 2025 – Apr 2026",
      context: "Akka builds a platform companies use to run and scale AI agents.",
      headline: "First commit landed on day two.",
      bullets: [
        "Built frontend in React and TanStack for a platform all about AI at scale.",
        "Was there when the company went AI-first.",
      ],
    },
  },
  hedin: {
    sv: {
      period: "mar – aug 2025",
      context: "Hedin IT, en del av Hedin Automotive — internationell bilhandlare och importör.",
      headline: "Leveranser utan buggar — och ett team som började jobba som ett.",
      stat: { value: "90 %", unit: "testdrivet" },
      bullets: [
        "Testdriven utveckling i 90 % av arbetet: testerna skrivs först, så felen hittas innan någon annan gör det.",
        "Fick ett splittrat utvecklarteam att jobba tillsammans, och synliggjorde problemen i hur avdelningen var organiserad.",
      ],
    },
    en: {
      period: "Mar – Aug 2025",
      context: "Hedin IT, part of Hedin Automotive — an international car dealer and importer.",
      headline: "Bug-free deliveries — and a team that started working as one.",
      stat: { value: "90%", unit: "test-driven" },
      bullets: [
        "Test-driven development in 90% of the work: the tests come first, so bugs are caught before anyone else finds them.",
        "Got a fragmented dev team working together, and made the structural problems in the department visible.",
      ],
    },
  },
  sembo: {
    sv: {
      period: "maj 2023 – mar 2025",
      context: "Resebyrå på nätet. Min första kund som frilansare — började som utvecklare, blev tech lead.",
      headline: "Högst individuell output i ett team på 11 — och coachade resten.",
      stat: { value: "11", unit: "i teamet" },
      bullets: [
        "Personlig coachning som fick utvecklarna att ta mer ägarskap. Var med och rekryterade och introducerade 4 nya.",
        "Införde ett nytt sätt att hantera sajtens innehåll som gjorde att utvecklingen gick snabbare — på ett hållbart sätt.",
      ],
      chip: "Blev frilans",
    },
    en: {
      period: "May 2023 – Mar 2025",
      context: "Online travel agency. My first client as a freelancer — started as a developer, became tech lead.",
      headline: "Highest individual output in a team of 11 — while coaching the rest.",
      stat: { value: "11", unit: "in the team" },
      bullets: [
        "Personal coaching that got the developers taking more ownership. Helped recruit and onboard 4 new people.",
        "Introduced a new way to manage the site's content that sped up development — sustainably.",
      ],
      chip: "Went freelance",
    },
    quoteBy: { sv: "Jose Crespi Valero", en: "Jose Crespi Valero" },
    project: "sembo-se-startpage",
  },
  netconsult: {
    sv: {
      period: "maj 2022 – maj 2023",
      context: "Webbyrå i Göteborg. Utvecklingschef, sedan CTO.",
      headline: "Byggde upp en utvecklingsavdelning.",
      stat: { value: "6", unit: "anställda på 6 mån" },
      bullets: [
        "Rekryterade 6 utvecklare och UX-proffs på 6 månader — från jobbannons till påskrivet kontrakt.",
        "Ansvarade för tekniken i 7 kundprodukter samtidigt, med 10 utvecklare i 2 team.",
      ],
      chip: "Byggde en avdelning",
    },
    en: {
      period: "May 2022 – May 2023",
      context: "Gothenburg web agency. Head of Development, then CTO.",
      headline: "Built up a dev department.",
      stat: { value: "6", unit: "hires in 6 months" },
      bullets: [
        "Hired 6 developers and UX people in 6 months — from job ad to signed contract.",
        "Ran the tech for 7 client products at once, with 10 developers across 2 teams.",
      ],
      chip: "Built a department",
    },
  },
  "telia-lead": {
    sv: {
      period: "feb 2021 – apr 2022",
      context: "Telia Sverige — alla team bakom telia.se.",
      headline: "Den 14 team vände sig till.",
      stat: { value: "14", unit: "team" },
      bullets: [
        "Veckovis praktisk hjälp, gemensamma verktyg och event för teamen bakom telia.se.",
        "Målet var att göra mig själv överflödig, så att teamen klarade sig själva.",
      ],
    },
    en: {
      period: "Feb 2021 – Apr 2022",
      context: "Telia Sweden — every team behind telia.se.",
      headline: "The engineer 14 teams leaned on.",
      stat: { value: "14", unit: "teams" },
      bullets: [
        "Weekly hands-on help, shared tooling and events for the teams behind telia.se.",
        "The goal was to make myself redundant, so the teams could stand on their own.",
      ],
    },
    quoteBy: { sv: "Joel Ericsson", en: "Nina Fogelberg" },
  },
  "telia-senior": {
    sv: {
      period: "aug 2020 – feb 2021",
      context: "Telia Sverige — företagsdelen av telia.se.",
      headline: "Ny grund för Telias företagssidor, byggd för 6 team samtidigt.",
      stat: { value: "6", unit: "team" },
      bullets: [
        "Ledde frontend-omställningen för företagsdelen av telia.se.",
        "Ritade en arkitektur där varje team kunde leverera sin del utan att vänta på de andra.",
      ],
    },
    en: {
      period: "Aug 2020 – Feb 2021",
      context: "Telia Sweden — the business side of telia.se.",
      headline: "A new foundation for Telia's business pages, built for 6 teams at once.",
      stat: { value: "6", unit: "teams" },
      bullets: [
        "Led the frontend overhaul for the business side of telia.se.",
        "Designed an architecture where each team could ship its part without waiting on the others.",
      ],
    },
    project: "telia-se",
  },
  kits: {
    sv: {
      period: "feb 2017 – aug 2020",
      context: "IT-konsultbolag. Mitt första jobb som utvecklare på heltid.",
      headline: "Skrev om ett helt system — ensam.",
      bullets: [
        "En kund satt fast i ett egenbyggt ramverk som inte orkade växa. Jag byggde om alltihop i modern teknik (React).",
        "Hoppade mellan kunder och lärde mig webbens tre stora ramverk på riktigt: React, Angular och Vue.",
      ],
    },
    en: {
      period: "Feb 2017 – Aug 2020",
      context: "IT consultancy. My first full-time developer job.",
      headline: "Rewrote an entire system — single-handedly.",
      bullets: [
        "A client was stuck on a home-built framework that couldn't grow. I rebuilt the whole thing on modern tech (React).",
        "Moved between clients and properly learned the web's three big frameworks: React, Angular and Vue.",
      ],
    },
  },
  hp: {
    sv: {
      period: "okt 2011 – dec 2016",
      context: "Fortune 500-bolag inom IT-drift. Jag började i supporten.",
      headline: "Byggde ett verktyg som 5 000 kollegor valde att använda.",
      stat: { value: "5 000", unit: "användare" },
      bullets: [
        "Började som dispatcher och blev den kollegorna gick till med tekniken. Till slut ledde jag 10 supportagenter i Norden.",
        "Efter ett jobbigt CRM-byte byggde jag ett tillägg som gjorde vardagen lättare. Ingen tvingades — det spred sig av sig självt, fick ett eget utvecklarteam och nominerades till ett företagspris.",
      ],
      chip: "5 000 användare",
    },
    en: {
      period: "Oct 2011 – Dec 2016",
      context: "Fortune 500 IT services company. I started in support.",
      headline: "Built a tool 5,000 colleagues chose to use.",
      stat: { value: "5,000", unit: "users" },
      bullets: [
        "Started as a dispatcher and became the person colleagues went to with tech problems. Ended up leading 10 support agents across the Nordics.",
        "After a painful CRM switch I built an add-on that made the day easier. Nobody was told to install it — it spread on its own, got its own dev team and a company-wide award nomination.",
      ],
      chip: "5,000 users",
    },
  },
};

export interface TimelineBlock extends Job, StoryCopy {
  quote?: Testimonial;
  project?: string;
  cta: boolean;
}

function findTestimonial(name: string | undefined): Testimonial | undefined {
  if (!name) return undefined;
  const t = testimonials.find((x) => x.name === name);
  if (!t) throw new Error(`timeline: no testimonial by "${name}" in contact.ts`);
  return t;
}

/** Tower blocks newest first, each with its story merged in. */
export function getTimeline(lang: Lang): TimelineBlock[] {
  return getJobs(lang).map((job) => {
    const story = stories[job.id];
    if (!story) throw new Error(`timeline: missing story for job "${job.id}"`);
    return {
      ...job,
      ...story[lang],
      quote: findTestimonial(story.quoteBy?.[lang]),
      project: story.project,
      cta: Boolean(story.cta),
    };
  });
}

/**
 * The short version of the arc, shown before any block is picked.
 * Each step points at the block that proves it.
 */
export const arcSteps: { id: string; sv: string; en: string }[] = [
  { id: "hp", sv: "Började i supporten och byggde verktyg åt kollegorna.", en: "Started in support, building tools for my colleagues." },
  { id: "telia-lead", sv: "Blev konsult, sen lead för 14 team på Telia.", en: "Became a consultant, then lead for 14 teams at Telia." },
  { id: "netconsult", sv: "Byggde upp en utvecklingsavdelning som CTO.", en: "Built up a dev department as CTO." },
  { id: "kendev", sv: "Valde att gå tillbaka till att bygga. Nu åt dig.", en: "Chose to go back to building. Now for you." },
];

export function getArcSteps(lang: Lang): { id: string; text: string }[] {
  return arcSteps.map((s) => ({ id: s.id, text: s[lang] }));
}

export { stories };

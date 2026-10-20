import type { Lang } from "./ui";

/**
 * Data for the final slide ("Vad kan jag göra för dig?"): the three tracks,
 * LinkedIn recommendations and contact details.
 *
 * Sources:
 * - Track wording: cv.ts profile.intro + LinkedIn "About" (Sep 2026 export)
 *   + the 2026-04-22 "enmansbyrå" LinkedIn post.
 * - Testimonials: LinkedIn Recommendations_Received.csv (Sep 2026 export,
 *   all Status = VISIBLE). Quotes are verbatim; "[…]" marks cuts.
 */

export const CONTACT = {
  email: "william@bernting.se",
  phoneHref: "tel:+46706676047",
  phoneDisplay: "+46 706 67 60 47",
  linkedin: "https://www.linkedin.com/in/williambernting",
  kendev: "https://www.kendev.se/",
} as const;

export type TrackId = "teach" | "legacy" | "build";

interface TrackCopy {
  /** Short verb-phrase title, mirrors cv.ts subtitle */
  title: string;
  /** Plain-language "what is it" */
  body: string;
  /** Plain-language "why you'd want it" */
  why: string;
  /** Mono tag: format / pricing */
  tag: string;
  /** Mail subject when this track is picked */
  subject: string;
  /** Primary CTA label when this track is picked */
  cta: string;
}

export interface TrackEntry {
  id: TrackId;
  color: string;
  /** Text colour that stays readable on top of `color` */
  ink: string;
  sv: TrackCopy;
  en: TrackCopy;
}

export const trackEntries: TrackEntry[] = [
  {
    id: "teach",
    color: "#00d4aa",
    ink: "#0a0a0f",
    sv: {
      title: "Lära ut AI",
      body: "Kom igång med AI, oavsett ålder, grupp eller yrke.",
      why: "Halv- eller heldag, anpassat efter var ni faktiskt är. Agentic is for everyone.",
      tag: "Workshop · halv/heldag",
      subject: "Spår: AI-workshop",
      cta: "Mejla om en workshop",
    },
    en: {
      title: "Teach AI",
      body: "Get started with AI, regardless of age, group or profession.",
      why: "Half or full day, tailored to where your team actually is. Agentic is for everyone.",
      tag: "Workshop · half/full day",
      subject: "Track: AI workshop",
      cta: "Email me about a workshop",
    },
  },
  {
    id: "legacy",
    color: "#f0a030",
    ink: "#0a0a0f",
    sv: {
      title: "Dyka in i legacy",
      body: "Gamla system som krånglar, eller tyst drar in pengar varje år.",
      why: "Jag går igenom koden och du får en skriftlig rapport med prioriterade åtgärder. Vill du kan jag leda fixarna också.",
      tag: "Fast pris · genomlysning",
      subject: "Spår: Legacy",
      cta: "Mejla om ditt system",
    },
    en: {
      title: "Dive into legacy",
      body: "Old systems that misbehave, or quietly make you money every year.",
      why: "I go through the code and you get a written report with prioritized fixes. If you want, I'll lead the fixes too.",
      tag: "Fixed price · audit",
      subject: "Track: Legacy",
      cta: "Email me about your system",
    },
  },
  {
    id: "build",
    color: "#9b4dca",
    ink: "#ffffff",
    sv: {
      title: "Bygga det du vill ha",
      body: "Hemsida, app, you name it.",
      why: "En kontaktperson. Blir det större än en person tar jag in rätt folk från mitt nätverk och står för helheten.",
      tag: "Fast pris · en kontakt",
      subject: "Spår: Bygga",
      cta: "Mejla om ditt bygge",
    },
    en: {
      title: "Build what you want",
      body: "Website, app, you name it.",
      why: "One point of contact. If it's bigger than one person, I bring in the right people from my network and own the delivery.",
      tag: "Fixed price · one contact",
      subject: "Track: Build",
      cta: "Email me about your build",
    },
  },
];

export interface Track extends TrackCopy {
  id: TrackId;
  color: string;
  ink: string;
  href: string;
}

export function buildMailto(email: string, subject?: string): string {
  if (!subject) return `mailto:${email}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

export function getTracks(lang: Lang): Track[] {
  return trackEntries.map((entry) => ({
    id: entry.id,
    color: entry.color,
    ink: entry.ink,
    ...entry[lang],
    href: buildMailto(CONTACT.email, entry[lang].subject),
  }));
}

export interface Testimonial {
  name: string;
  /** Relationship to William, per locale */
  relation: Record<Lang, string>;
  /** Language the recommendation was written in */
  lang: Lang;
  /** Verbatim excerpt */
  text: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Joel Ericsson",
    relation: { sv: "kollega på Telia", en: "colleague at Telia" },
    lang: "sv",
    text: "Den tekniska kunskapen han bidrar med gör att team tar sig framåt i en snabbare takt än utan honom.",
  },
  {
    name: "Paweł Rokosz",
    relation: { sv: "kollega på Sembo", en: "colleague at Sembo" },
    lang: "en",
    text: "William thrives in creative chaos and knows how to lead through it with calm and clarity. […] A curious, people-first tech lead who's a pleasure to work with.",
  },
  {
    name: "Jose Crespi Valero",
    relation: { sv: "kollega på Sembo", en: "colleague at Sembo" },
    lang: "en",
    text: "He did much more than write excellent code. He inspired us, helped us work better together, and raised the level of the whole team.",
  },
  {
    name: "Henrik Ståhl",
    relation: { sv: "f.d. kollega", en: "former colleague" },
    lang: "en",
    text: "William is one of the most passionate developers I've ever had the opportunity to work with. And that passion fuels a capacity that is out of this world.",
  },
  {
    name: "Nina Fogelberg",
    relation: { sv: "Telia Finance", en: "Telia Finance" },
    lang: "en",
    text: "William is a highly skilled lead software developer with […] drive to get all his peers onboard the challenges at hand in a very collaborative manner.",
  },
];

/**
 * Testimonials for a locale: Swedish page leads with the Swedish
 * recommendation; the English page skips it (no translation of
 * someone else's words without their OK).
 */
export function getTestimonials(lang: Lang): Testimonial[] {
  if (lang === "en") return testimonials.filter((t) => t.lang === "en");
  return [...testimonials].sort((a, b) =>
    a.lang === b.lang ? 0 : a.lang === "sv" ? -1 : 1,
  );
}

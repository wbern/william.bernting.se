export const defaultLang = "sv" as const;
export const languages = ["sv", "en"] as const;
export type Lang = (typeof languages)[number];

export const ui = {
  sv: {
    "meta.title": "William Bernting",
    "meta.description":
      "Frontendutvecklare som bygger med AI. 10 års erfarenhet av mjukvaruutveckling — från legacyräddning till agentiska arbetsflöden.",

    "hero.greeting": "Hej!",
    "hero.tagline.before": "Jag bygger med ",
    "hero.tagline.strong": "AI",
    "hero.tagline.after": ". Sedan bygger jag mer. Sedan levererar jag.",
    "hero.scroll": "scrolla ner",

    "stats.label": "I siffror",
    "stats.heading.before": "Det är inte en ",
    "stats.heading.highlight": "fas",
    "stats.heading.after": ".",
    "stats.prototypes": "prototyper levererade senaste 12 månaderna",
    "stats.users": "användare på ett enda internt verktyg",
    "stats.teams": "utvecklingsteam stöttade hos ett bolag",
    "stats.experience": "års professionell mjukvaruutveckling",

    "skills.label": "Verktyg i lådan",
    "skills.heading.before": "",
    "skills.heading.highlight": "Stacken",
    "skills.heading.after": ".",

    "quote.text":
      "\u201CDet är i görandet av arbetet som vi upptäcker arbetet vi behöver göra.\u201D",
    "quote.author": "Woody Zuill",

    "traits.label": "Vad som gör mig annorlunda",
    "traits.heading.before": "Inte din genomsnittliga ",
    "traits.heading.highlight": "utvecklare",
    "traits.heading.after": ".",

    "timeline.label": "Resan hittills",
    "timeline.heading.before": "10 år av ",
    "timeline.heading.highlight": "byggande",
    "timeline.heading.after": ".",

    "projects.label": "Vad jag har byggt",
    "projects.heading.before": "Levererat med ",
    "projects.heading.highlight": "AI",
    "projects.heading.after": ", inte bara hype.",
    "projects.spin": "Snurra",
    "projects.open": "Visa",
    "projects.back": "Tillbaka",
    "projects.aria.prev": "Föregående projekt",
    "projects.aria.next": "Nästa projekt",
    "projects.aria.list": "Projekt",
    "projects.aria.back": "Tillbaka till listan",

    "nav.goToSlide": "Gå till sida",

    "print.traits.ai": "Bygger med AI, levererar med AI, tänker i agentiska arbetsflöden.",
    "print.traits.team": "Coachat utvecklare, rekryterat talang, enat avdelningar.",
    "print.traits.debug": "Komplex felsökning som får andra att vilja skriva om allt.",
    "print.traits.legacy": "Räddar legacykodbaser när alla andra vill skriva om.",
  },
  en: {
    "meta.title": "William Bernting",
    "meta.description":
      "Frontend developer who builds things with AI. 10 years of shipping software — from legacy rescue to agentic workflows.",

    "hero.greeting": "Hey!",
    "hero.tagline.before": "I build things with ",
    "hero.tagline.strong": "AI",
    "hero.tagline.after": ". Then I build more things. Then I ship them.",
    "hero.scroll": "scroll down",

    "stats.label": "By the numbers",
    "stats.heading.before": "It\u2019s not a ",
    "stats.heading.highlight": "phase",
    "stats.heading.after": ".",
    "stats.prototypes": "prototypes shipped in the last 12 months",
    "stats.users": "users on a single internal tool",
    "stats.teams": "dev teams supported at one company",
    "stats.experience": "of professional software development",

    "skills.label": "Tools of the trade",
    "skills.heading.before": "The ",
    "skills.heading.highlight": "stack",
    "skills.heading.after": ".",

    "quote.text":
      "\u201CIt is in the doing of the work that we discover the work that we must do.\u201D",
    "quote.author": "Woody Zuill",

    "traits.label": "What makes me different",
    "traits.heading.before": "Not your average ",
    "traits.heading.highlight": "developer",
    "traits.heading.after": ".",

    "timeline.label": "The journey so far",
    "timeline.heading.before": "10 years of ",
    "timeline.heading.highlight": "building",
    "timeline.heading.after": ".",

    "projects.label": "What I\u2019ve been building",
    "projects.heading.before": "Shipped with ",
    "projects.heading.highlight": "AI",
    "projects.heading.after": ", not just hype.",
    "projects.spin": "Spin",
    "projects.open": "Open",
    "projects.back": "Back",
    "projects.aria.prev": "Previous project",
    "projects.aria.next": "Next project",
    "projects.aria.list": "Projects",
    "projects.aria.back": "Back to project list",

    "nav.goToSlide": "Go to slide",

    "print.traits.ai": "Builds with AI, ships with AI, thinks in agentic workflows.",
    "print.traits.team": "Coached developers, recruited talent, unified departments.",
    "print.traits.debug": "Complex troubleshooting that makes others reach for the rewrite button.",
    "print.traits.legacy": "Rescues legacy codebases when everyone else wants to rewrite.",
  },
} as const;

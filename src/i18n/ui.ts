export const defaultLang = "sv" as const;
export const languages = ["sv", "en"] as const;
export type Lang = (typeof languages)[number];

export const ui = {
  sv: {
    "meta.title": "William Bernting",
    "meta.description":
      "Frontendutvecklare med 15 års erfarenhet av mjukvaruutveckling — från legacyräddning till moderna verktyg och snabba leveranser.",

    "hero.greeting": "Hej!",
    "hero.tagline.before": "Jag bygger saker som ",
    "hero.tagline.strong": "fungerar",
    "hero.tagline.after": ". Sedan bygger jag mer. Sedan levererar jag.",
    "hero.scroll": "scrolla ner",

    "stats.label": "I siffror",
    "stats.heading.before": "Några ",
    "stats.heading.highlight": "siffror",
    "stats.heading.after": ".",
    "stats.prototypes": "prototyper skapade senaste 12 månaderna",
    "stats.prototypes.value": "47",
    "stats.users": "användare på ett enda internt verktyg",
    "stats.users.value": "5 000",
    "stats.teams": "utvecklingsteam stöttade hos ett bolag",
    "stats.teams.value": "14",
    "stats.experience": "års professionell mjukvaruutveckling",
    "stats.experience.value": "15 år",
    "stats.coderate": "kodrader skrivna per dag",
    "stats.coderate.value": "1 500",

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
    "timeline.heading.before": "15 år av ",
    "timeline.heading.highlight": "byggande",
    "timeline.heading.after": ".",

    "projects.label": "Vad jag har byggt",
    "projects.heading.before": "Byggt, levererat, ",
    "projects.heading.highlight": "klart",
    "projects.heading.after": ".",
    "projects.spin": "Snurra",
    "projects.open": "Visa",
    "projects.back": "Tillbaka",
    "projects.aria.prev": "Föregående projekt",
    "projects.aria.next": "Nästa projekt",
    "projects.aria.list": "Projekt",
    "projects.aria.back": "Tillbaka till listan",

    "nav.goToSlide": "Gå till sida",

    "print.traits.ai": "Bygger snabbt, levererar ofta, automatiserar det tråkiga.",
    "print.traits.team": "Coachat utvecklare, rekryterat talang, enat avdelningar.",
    "print.traits.debug": "Komplex felsökning som får andra att vilja skriva om allt.",
    "print.traits.legacy": "Räddar legacykodbaser när alla andra vill skriva om.",

    "cv.intro": "Intro",
    "cv.workHistory": "Arbetshistorik",
    "cv.favoriteBooks": "Favoritböcker",
    "cv.acknowledgements": "Tillkännagivanden",
    "cv.traits": "Egenskaper",
    "cv.skills": "Kompetenser",
    "cv.favoriteQuote": "Favoritcitat",
    "cv.languages": "Språk",
    "cv.education": "Utbildning",
    "cv.community": "Samhällsengagemang",
    "cv.backToSite": "\u2190 Tillbaka till webbplatsen",
  },
  en: {
    "meta.title": "William Bernting",
    "meta.description":
      "Frontend developer with 15 years of shipping software — from legacy rescue to modern tooling and rapid delivery.",

    "hero.greeting": "Hey!",
    "hero.tagline.before": "I build things that ",
    "hero.tagline.strong": "work",
    "hero.tagline.after": ". Then I build more things. Then I ship them.",
    "hero.scroll": "scroll down",

    "stats.label": "By the numbers",
    "stats.heading.before": "Some ",
    "stats.heading.highlight": "numbers",
    "stats.heading.after": ".",
    "stats.prototypes": "prototypes created in the last 12 months",
    "stats.prototypes.value": "47",
    "stats.users": "users on a single internal tool",
    "stats.users.value": "5,000",
    "stats.teams": "dev teams supported at one company",
    "stats.teams.value": "14",
    "stats.experience": "of professional software development",
    "stats.experience.value": "15yr",
    "stats.coderate": "lines of code written per day",
    "stats.coderate.value": "1,500",

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
    "timeline.heading.before": "15 years of ",
    "timeline.heading.highlight": "building",
    "timeline.heading.after": ".",

    "projects.label": "What I\u2019ve been building",
    "projects.heading.before": "Built, shipped, ",
    "projects.heading.highlight": "done",
    "projects.heading.after": ".",
    "projects.spin": "Spin",
    "projects.open": "Open",
    "projects.back": "Back",
    "projects.aria.prev": "Previous project",
    "projects.aria.next": "Next project",
    "projects.aria.list": "Projects",
    "projects.aria.back": "Back to project list",

    "nav.goToSlide": "Go to slide",

    "print.traits.ai": "Builds fast, ships often, automates the boring stuff.",
    "print.traits.team": "Coached developers, recruited talent, unified departments.",
    "print.traits.debug": "Complex troubleshooting that makes others reach for the rewrite button.",
    "print.traits.legacy": "Rescues legacy codebases when everyone else wants to rewrite.",

    "cv.intro": "Intro",
    "cv.workHistory": "Work History",
    "cv.favoriteBooks": "Favorite Books",
    "cv.acknowledgements": "Acknowledgements",
    "cv.traits": "Traits",
    "cv.skills": "Skills",
    "cv.favoriteQuote": "Favorite Quote",
    "cv.languages": "Languages",
    "cv.education": "Education",
    "cv.community": "Community",
    "cv.backToSite": "\u2190 Back to website",
  },
} as const;

import type { Lang } from "./ui";
import { trackEntries, testimonials } from "./contact";

/**
 * The projects roulette (slide 2): a short, curated list of case stories.
 *
 * Every card answers three questions a non-technical reader has:
 * what was the problem, what did William do, and what came of it. The tech
 * ("under the hood") is kept, but it never leads.
 *
 * Sources for every claim live in the research dossiers for the 2026-10
 * overhaul (repo READMEs, git logs, cv.ts, LinkedIn posts, GitHub/npm APIs).
 * Do not add numbers here that cannot be traced to a source.
 *
 * `problem` / `did` / `outcome` may contain inline HTML (`<em>` for outcomes).
 */

/** What kind of value a project shows. Colours mirror the contact-slide tracks. */
export type ProjectTrack = "legacy" | "build" | "teach" | "lab";

export interface ProjectFact {
  /** Big number or short figure, e.g. "38 000" or "2/5 → 5/5" */
  value: string;
  /** What the figure means, in plain words */
  label: string;
}

export interface ProjectLink {
  href: string;
  label: string;
}

export interface ProjectCopy {
  title: string;
  /** Who/when, e.g. "Kunduppdrag · 2026" */
  context: string;
  /** One plain-language sentence. Shown under the roller and atop the card. */
  hook: string;
  problem: string;
  did: string;
  outcome: string;
  facts: ProjectFact[];
  /** Tech keywords for the "under the hood" footer */
  nerdy: string[];
  links: ProjectLink[];
}

interface ProjectEntry {
  /** Stable deep-link id (`/#slug`). Never rename: links exist in the wild. */
  slug: string;
  track: ProjectTrack;
  /** First auto-spin on arrival lands on one of these. */
  flagship?: boolean;
  /** Name of a testimonial in contact.ts to quote on the card. */
  quote?: Partial<Record<Lang, string>>;
  sv: ProjectCopy;
  en: ProjectCopy;
}

const gh = (repo: string): ProjectLink => ({
  href: `https://github.com/wbern/${repo}`,
  label: `github.com/wbern/${repo}`,
});

/**
 * Display order is a pitch arc: rescue → AI for a real business → a product
 * people used → big-company work → leadership → open source with traction →
 * experiments.
 */
const projectEntries = [
  {
    slug: "dll-decompilation",
    track: "legacy",
    flagship: true,
    sv: {
      title: "Systemet utan källkod",
      context: "Kunduppdrag · 2026",
      hook: "Servern fick startas om var 15:e minut. Leverantören var borta, källkoden likaså. Nu står den stadigt.",
      problem: "Ett bokningssystem där boende i bostadsrättsföreningar bokar tvättstuga och gästlägenhet kraschade hela tiden. Felet satt i runt 20 år gamla leverantörsfiler som ingen längre hade källkoden till.",
      did: "Under en helg lät jag en AI-agent översätta filerna tillbaka till läsbar kod. Först skrev jag 19 automatiska kontroller mot de skarpa sajterna, och originalet klarade 8. Sedan lagade jag grundfelet, flera webbplatser som trampade varandra på tårna mot samma gamla komponent, och rullade ut med tre olika sätt att backa.",
      outcome: "<em>19 av 19 kontroller gröna, på 5 sajter.</em> Inga fler omstarter var 15:e minut. \"Ingen källkod\" visade sig bara vara en startpunkt.",
      facts: [
        { value: "5", label: "sajter lagade" },
        { value: "8 → 19", label: "av 19 tester gröna" },
        { value: "1", label: "helg" },
      ],
      nerdy: [".NET Framework 2.0", "VB.NET → C# (ILSpy)", "COM interop", "Named mutex", "Playwright", "Tailscale"],
      links: [],
    },
    en: {
      title: "The system nobody had code for",
      context: "Client work · 2026",
      hook: "The server had to be restarted every 15 minutes. The vendor was gone, and so was the source code. Now it just runs.",
      problem: "A booking system where residents of housing associations book laundry rooms and guest flats kept crashing. The fault sat in vendor files around 20 years old that nobody had the source code for any more.",
      did: "Over one weekend I had an AI agent turn the files back into readable code. First I wrote 19 automated checks against the live sites, and the original passed 8. Then I fixed the root cause, several websites stepping on each other's toes against the same old component, and rolled out with three different ways to roll back.",
      outcome: "<em>19 of 19 checks green, across 5 sites.</em> No more restarts every 15 minutes. \"No source code\" turned out to be just a starting point.",
      facts: [
        { value: "5", label: "sites fixed" },
        { value: "8 → 19", label: "of 19 tests passing" },
        { value: "1", label: "weekend" },
      ],
      nerdy: [".NET Framework 2.0", "VB.NET → C# (ILSpy)", "COM interop", "Named mutex", "Playwright", "Tailscale"],
      links: [],
    },
  },
  {
    slug: "knowledge-bot",
    track: "build",
    flagship: true,
    sv: {
      title: "Företagets mejlminne",
      context: "Kundpilot · 2026",
      hook: "38 000 gamla mejl blev en kollega som minns hur vi löste det förra gången.",
      problem: "Ett litet säkerhetsföretag i Göteborg (passersystem, porttelefoner) får hundratals mejl i månaden. Samma frågor kommer tillbaka, men svaren ligger begravda i enskildas inkorgar. Och kundmejl får inte skickas till någon molntjänst.",
      did: "Jag byggde en AI-rådgivare som körs helt på företagets egen server. Den läser varje nytt mejl, letar fram liknande ärenden bland 38 000 gamla och föreslår hur teamet brukar lösa det, med originalmejlen som kvitto. Personalen kan också fråga den direkt i gruppchatten.",
      outcome: "<em>Inga mejl lämnade huset.</em> Träffsäkerheten på testfrågorna gick från 2 av 5 till <em>5 av 5</em> när jag kombinerade vanlig ordsökning med AI-sökning. Allt på en server utan grafikkort och utan licenskostnader.",
      facts: [
        { value: "38 000", label: "mejl i minnet" },
        { value: "2/5 → 5/5", label: "testfrågor rätt" },
        { value: "0", label: "mejl till molnet" },
      ],
      nerdy: ["RAG", "BM25 (SQLite FTS5)", "Vektorsökning (LEANN)", "Reciprocal Rank Fusion", "Ollama", "Proxmox", "Ansible", "Telegram"],
      links: [{ href: "https://www.kendev.se/articles/leann-email-advisor", label: "Hela genomgången på kendev.se" }],
    },
    en: {
      title: "The company's email memory",
      context: "Client pilot · 2026",
      hook: "38,000 old emails became a colleague who remembers how we solved it last time.",
      problem: "A small Gothenburg security company (access control, intercoms) gets hundreds of emails a month. The same questions keep coming back, but the answers are buried in individual inboxes. And customer emails can't be sent to a cloud service.",
      did: "I built an AI advisor that runs entirely on the company's own server. It reads each new email, finds similar cases among 38,000 old ones and suggests how the team usually handles it, with the original emails as receipts. Staff can also ask it directly in their group chat.",
      outcome: "<em>No email left the building.</em> Accuracy on the test questions went from 2 of 5 to <em>5 of 5</em> once I combined plain keyword search with AI search. All on a server with no graphics card and no licence costs.",
      facts: [
        { value: "38,000", label: "emails remembered" },
        { value: "2/5 → 5/5", label: "test questions right" },
        { value: "0", label: "emails sent to the cloud" },
      ],
      nerdy: ["RAG", "BM25 (SQLite FTS5)", "Vector search (LEANN)", "Reciprocal Rank Fusion", "Ollama", "Proxmox", "Ansible", "Telegram"],
      links: [{ href: "https://www.kendev.se/articles/leann-email-advisor", label: "Full write-up on kendev.se" }],
    },
  },
  {
    slug: "legacy-chess-tool-rewrite",
    track: "legacy",
    flagship: true,
    sv: {
      title: "Lotta: schack i webbläsaren",
      context: "Eget projekt, open source · 2026",
      hook: "Ett nedlagt lottningsprogram för schack, flyttat till webben. Första skarpa testet: en regionsfinal med ca 500 barn.",
      problem: "Jag skulle lotta en schackturnering, men programmet gick inte längre att ladda ner. Det hade stått still sedan 2018 och krävde Java på rätt dator, men klubbarna gillar det för att det är enkelt. Det verkliga värdet sitter i lottningsreglerna, och de är förvånansvärt kluriga.",
      did: "Innan jag rörde något spelade jag in över 200 facit från det gamla programmet: hur turneringar ska lottas och räknas. Med det skyddsnätet på plats flyttade jag hela programmet in i webbläsaren och lät facit avgöra när det var klart.",
      outcome: "Gratis på <em>lotta.bernting.se</em>: ingen installation, ingen inloggning, funkar offline. Domare och publik följer lottningen live i mobilen. Det körde en regionsfinal i Schack4an med <em>ca 500 barn</em>. Och vet ni vad? Det funkade.",
      facts: [
        { value: "~500", label: "barn i en regionsfinal" },
        { value: "200+", label: "facit-tester" },
        { value: "0", label: "servrar" },
      ],
      nerdy: ["Java Swing → React 19", "SQLite i webbläsaren (sql.js)", "IndexedDB", "WebRTC P2P", "Golden master-tester", "PWA"],
      links: [
        { href: "https://lotta.bernting.se", label: "lotta.bernting.se" },
        gh("lotta"),
      ],
    },
    en: {
      title: "Lotta: chess in the browser",
      context: "Own project, open source · 2026",
      hook: "A discontinued chess pairing program, moved to the web. Its first real test: a regional final with about 500 kids.",
      problem: "I needed to pair a chess tournament, but the program could no longer be downloaded. It had been frozen since 2018 and needed Java on the right PC, yet clubs like it because it's simple. Its real value is the pairing rules, and those are surprisingly tricky.",
      did: "Before touching anything I recorded over 200 answer keys from the old program: how tournaments should be paired and scored. With that safety net in place I moved the whole program into the browser and let the answer keys decide when it was done.",
      outcome: "Free at <em>lotta.bernting.se</em>: no install, no signup, works offline. Referees and spectators follow the pairings live on their phones. It ran a Schack4an regional final with <em>about 500 kids</em>. And you know what? It worked.",
      facts: [
        { value: "~500", label: "kids at a regional final" },
        { value: "200+", label: "answer-key tests" },
        { value: "0", label: "servers" },
      ],
      nerdy: ["Java Swing → React 19", "SQLite in the browser (sql.js)", "IndexedDB", "WebRTC P2P", "Golden master tests", "PWA"],
      links: [
        { href: "https://lotta.bernting.se", label: "lotta.bernting.se" },
        gh("lotta"),
      ],
    },
  },
  {
    slug: "telia-se",
    track: "legacy",
    flagship: true,
    quote: { sv: "Joel Ericsson", en: "Nina Fogelberg" },
    sv: {
      title: "Telia.se",
      context: "Anställd på Telia · 2020–2022",
      hook: "Byggde om framsidan på Telia.se medan butiken var öppen.",
      problem: "Telia.se kunde inte stänga för renovering. Den gamla mallmotorn hade utseende och affärslogik hopflätade, och att skriva om allt på en gång hade stoppat 14 utvecklingsteam.",
      did: "Jag ledde frontend-omställningen för företagsdelen med sex team och designade en arkitektur där gammalt och nytt kunde leva sida vid sida, så att varje team kunde leverera sin del själv. Som lead developer höll jag sedan ihop den gemensamma kodbasen för 14 team och coachade dem varje vecka.",
      outcome: "<em>Sajten bytte motor bit för bit</em>, utan big bang. Största lärdomen: tekniken var den lätta delen. Att få 14 team att dra åt samma håll var det riktiga jobbet.",
      facts: [
        { value: "14", label: "utvecklingsteam" },
        { value: "6", label: "team i B2B-omställningen" },
        { value: "1", label: "gemensam kodbas" },
      ],
      nerdy: ["Freemarker → micro-frontends", "Monorepo", "TypeScript", "Node.js"],
      links: [],
    },
    en: {
      title: "Telia.se",
      context: "At Telia · 2020–2022",
      hook: "Rebuilt the front of Telia.se while the shop stayed open.",
      problem: "Telia.se couldn't close for renovation. The old templating engine had look and business logic tangled together, and rewriting everything at once would have stopped 14 development teams.",
      did: "I led the frontend transformation of the business (B2B) side across six teams and designed an architecture where old and new could live side by side, so each team could ship its own part. As lead developer I then kept the shared codebase for 14 teams healthy and coached them every week.",
      outcome: "<em>The site swapped engines piece by piece</em>, no big bang. The biggest lesson: the tech was the easy part. Getting 14 teams to pull in the same direction was the real job.",
      facts: [
        { value: "14", label: "development teams" },
        { value: "6", label: "teams in the B2B move" },
        { value: "1", label: "shared codebase" },
      ],
      nerdy: ["Freemarker → micro-frontends", "Monorepo", "TypeScript", "Node.js"],
      links: [],
    },
  },
  {
    slug: "sembo-se-startpage",
    track: "build",
    quote: { sv: "Paweł Rokosz", en: "Paweł Rokosz" },
    sv: {
      title: "Sembo.se",
      context: "Tech lead på Sembo · 2023–2025",
      hook: "Resebyråns skyltfönster: skriv en kampanj en gång, så dyker den upp överallt där den ska.",
      problem: "Startsidan är det första en resenär ser, men den hade börjat som ett experiment. Kampanjer, inspiration och sök skulle samsas på samma yta, och innehållet behövde gå att ändra utan att bygga om sidan.",
      did: "Jag införde ett headless CMS med innehållet först: en kampanj skrivs en gång och blir automatiskt både kort på startsidan och egen kampanjsida. Jag fick UX, skribenter och utvecklare att skissa tillsammans, var med och rekryterade fyra nya kollegor och kodade själv, runt 31 % av teamets commits.",
      outcome: "Startsidan blev navet för <em>kampanjer, inspiration och snabb sökning</em>, och jag hade högst output i ett team på 11.",
      facts: [
        { value: "11", label: "personer i teamet" },
        { value: "4", label: "nya kollegor rekryterade" },
        { value: "31 %", label: "av teamets commits" },
      ],
      nerdy: ["Next.js", "React", "TypeScript", "Sanity CMS", "A/B-tester"],
      links: [],
    },
    en: {
      title: "Sembo.se",
      context: "Tech lead at Sembo · 2023–2025",
      hook: "The travel agency's shop window: write a campaign once and it shows up everywhere it should.",
      problem: "The start page is the first thing a traveller sees, but it had started life as an experiment. Campaigns, inspiration and search had to share the same space, and content needed to change without rebuilding the page.",
      did: "I brought in a headless CMS, content first: a campaign is written once and automatically becomes both a start-page card and its own campaign page. I got UX, writers and developers sketching together, helped recruit four new colleagues and kept coding myself, about 31% of the team's commits.",
      outcome: "The start page became the hub for <em>campaigns, inspiration and quick search</em>, and I had the highest output on a team of 11.",
      facts: [
        { value: "11", label: "people on the team" },
        { value: "4", label: "new colleagues recruited" },
        { value: "31%", label: "of the team's commits" },
      ],
      nerdy: ["Next.js", "React", "TypeScript", "Sanity CMS", "A/B tests"],
      links: [],
    },
  },
  {
    slug: "tdd-command-generator",
    track: "teach",
    sv: {
      title: "Lär AI:n att testa först",
      context: "Open source + föredrag · 2025–2026",
      hook: "AI skriver kod snabbt men slarvigt. Jag lärde den att testa först, och 100 utvecklare stjärnmärkte det på under två dygn.",
      problem: "AI-kodagenter skriver kod självsäkert, men ofta utan att bevisa att den fungerar. Gamla funktioner går sönder när nya byggs, och man får förklara samma arbetssätt varje gång.",
      did: "Jag paketerade mitt sätt att hålla dem ärliga, testdriven utveckling, i färdiga kommandon: skriv /red så skriver agenten först ett test som fallerar, /green så får den det att gå igenom. Det installeras med ett kommando. Sedan har jag pratat om det, bland annat hos Walley och Knowit.",
      outcome: "<em>167 stjärnor och 21 forkar på GitHub</em>, runt 3 900 nedladdningar och en presentation som alltid ligger uppe: \"How to do your job and stop writing code\".",
      facts: [
        { value: "167", label: "stjärnor på GitHub" },
        { value: "< 2 dygn", label: "till de första 100" },
        { value: "~3 900", label: "nedladdningar" },
      ],
      nerdy: ["Claude Code-kommandon", "npm", "Vitest, 100 % täckningskrav", "semantic-release", "Slidev"],
      links: [
        gh("agent-instructions"),
        { href: "https://pages.bernting.se/slidev-tdd-with-ai/", label: "Presentationen" },
      ],
    },
    en: {
      title: "Teaching AI to test first",
      context: "Open source + talks · 2025–2026",
      hook: "AI writes code fast but sloppily. I taught it to test first, and 100 developers starred it in under two days.",
      problem: "AI coding agents write code confidently, but often without proving it works. Old features break when new ones are built, and you end up explaining the same way of working every time.",
      did: "I packaged my way of keeping them honest, test-driven development, into ready-made commands: type /red and the agent first writes a failing test, /green and it makes it pass. It installs with one command. Since then I've talked about it at places like Walley and Knowit.",
      outcome: "<em>167 stars and 21 forks on GitHub</em>, about 3,900 downloads and a talk that is always online: \"How to do your job and stop writing code\".",
      facts: [
        { value: "167", label: "GitHub stars" },
        { value: "< 2 days", label: "to the first 100" },
        { value: "~3,900", label: "downloads" },
      ],
      nerdy: ["Claude Code commands", "npm", "Vitest, 100% coverage gate", "semantic-release", "Slidev"],
      links: [
        gh("agent-instructions"),
        { href: "https://pages.bernting.se/slidev-tdd-with-ai/", label: "The talk (slides)" },
      ],
    },
  },
  {
    slug: "pi-pai",
    track: "lab",
    sv: {
      title: "Pi-PAI",
      context: "Open source-experiment · 2026",
      hook: "Ett gäng AI-utvecklare i fickan, på en dator stor som en kortlek.",
      problem: "Jag bar runt på laptopen överallt, bara för att kunna sätta igång enkla AI-uppgifter.",
      did: "Jag gjorde en gammal Raspberry Pi till en verkstad som alltid är igång. Jag ger uppdraget från mobilen, med rösten eller i text, och går därifrån. En agent är arbetsledare och startar fler när det finns jobb, var och en inlåst i sin egen sandlåda. Hela uppsättningen byggs upp med ett skript.",
      outcome: "Första provkörningen: <em>1 000 uppslag på 35 minuter</em> medan jag gjorde annat, och en notis i mobilen när det var klart. Steg-för-steg-guiden ligger på kendev.se.",
      facts: [
        { value: "1 000", label: "uppslag i första testet" },
        { value: "35 min", label: "utan mig vid datorn" },
        { value: "1", label: "Raspberry Pi" },
      ],
      nerdy: ["Raspberry Pi 4", "Ansible", "Docker-sandlåda", "Claude Code", "MCP", "tmux"],
      links: [
        { href: "https://www.kendev.se/articles/raspberry-pi-claude-server", label: "Guiden på kendev.se" },
        gh("pi-pai"),
      ],
    },
    en: {
      title: "Pi-PAI",
      context: "Open source experiment · 2026",
      hook: "A small crew of AI developers in my pocket, on a computer the size of a deck of cards.",
      problem: "I was carrying my laptop everywhere, just to kick off simple AI tasks.",
      did: "I turned an old Raspberry Pi into an always-on workshop. I hand it a task from my phone, by voice or text, and walk away. One agent acts as foreman and starts more when there's work, each locked in its own sandbox. The whole setup is rebuilt with one script.",
      outcome: "First test run: <em>1,000 lookups in 35 minutes</em> while I did something else, and a phone notification when it was done. The step-by-step guide is on kendev.se.",
      facts: [
        { value: "1,000", label: "lookups in the first test" },
        { value: "35 min", label: "without me at the desk" },
        { value: "1", label: "Raspberry Pi" },
      ],
      nerdy: ["Raspberry Pi 4", "Ansible", "Docker sandbox", "Claude Code", "MCP", "tmux"],
      links: [
        { href: "https://www.kendev.se/articles/raspberry-pi-claude-server", label: "The guide on kendev.se" },
        gh("pi-pai"),
      ],
    },
  },
  {
    slug: "adr-lint",
    track: "teach",
    sv: {
      title: "ADRian",
      context: "Open source · 2026",
      hook: "Skriv ner teamets regler en gång. En AI-granskare kollar sedan varje ändring mot dem.",
      problem: "Alla team har regler av typen \"så gör vi inte här\". Oftast sitter de i någons huvud och följs bara om just den personen råkar granska koden.",
      did: "ADRian gör varje nedskriven regel till en egen AI-granskare. Varje ändring kontrolleras mot alla regler som berör den, innan den ens sparas, med rad och förslag på fix. Det började i ett kundteam, och nu har jag byggt om det som open source.",
      outcome: "<em>Mindre tjat i kodgranskningen</em>, och regler som lever i stället för att samla damm. Samma knep styrde en artikel jag skrev: 15 regler, 22 utkast, varje utkast granskat mot varje regel.",
      facts: [
        { value: "8", label: "releaser" },
        { value: "15", label: "regler i artikeltestet" },
        { value: "22", label: "utkast granskade" },
      ],
      nerdy: ["Architecture Decision Records", "Go", "Claude Code CLI", "Git hooks", "Homebrew"],
      links: [gh("adrian")],
    },
    en: {
      title: "ADRian",
      context: "Open source · 2026",
      hook: "Write your team's rules down once. An AI reviewer then checks every change against them.",
      problem: "Every team has rules like \"we don't do it that way here\". Usually they live in someone's head and are only enforced if that person happens to review your code.",
      did: "ADRian turns each written rule into its own AI reviewer. Every change is checked against every rule that applies, before it is even committed, with the line and a suggested fix. It started in a client's team, and I've since rebuilt it as open source.",
      outcome: "<em>Less nagging in code review</em>, and rules that stay alive instead of gathering dust. The same trick steered an article I wrote: 15 rules, 22 drafts, every draft checked against every rule.",
      facts: [
        { value: "8", label: "releases" },
        { value: "15", label: "rules in the article test" },
        { value: "22", label: "drafts reviewed" },
      ],
      nerdy: ["Architecture Decision Records", "Go", "Claude Code CLI", "Git hooks", "Homebrew"],
      links: [gh("adrian")],
    },
  },
  {
    slug: "community-assistant",
    track: "lab",
    sv: {
      title: "Styrelsens AI-assistent",
      context: "Prototyp · 2025",
      hook: "Gör jobbet ingen i styrelsen vill göra: mejlkorgen.",
      problem: "Ideella styrelser i bostadsföreningar drunknar i samma mejl: parkering, nycklar, soprummet. Mejl hamnar mellan stolarna och ingen vet vem som svarade vad.",
      did: "En prototyp som läser föreningens inkorg, taggar och sammanfattar varje mejl och samlar allt i ett delat kalkylark, med påminnelser när något blir liggande. Styrelsen skriver bara \"jag har ringt rörmokaren\" i chatten. Den kan skriva ett utkast till svar, men det är alltid en människa som trycker på skicka.",
      outcome: "Det svåra var att testa en AI som aldrig svarar likadant två gånger. Lösningen blev <em>tre testnivåer</em>: låtsas-AI för fart, en pytteliten AI-modell som generalrepetition och den riktiga modellen sist.",
      facts: [
        { value: "5 min", label: "mellan inkorgskollarna" },
        { value: "3", label: "testnivåer" },
        { value: "80 %", label: "testtäckning som krav" },
      ],
      nerdy: ["Akka SDK", "Event sourcing", "Gmail API", "Google Sheets API", "SmolLM2-135M (testnivå)", "JaCoCo"],
      links: [gh("community-assistant")],
    },
    en: {
      title: "The board's AI assistant",
      context: "Prototype · 2025",
      hook: "Doing the job nobody on the board wants to do: the inbox.",
      problem: "Volunteer boards in housing associations drown in the same emails: parking, keys, the bin room. Mails slip between board members and nobody knows who answered what.",
      did: "A prototype that reads the association's inbox, tags and summarises every email and gathers it all in one shared spreadsheet, with reminders when something sits too long. Board members just say \"I called the plumber\" in chat. It can draft a reply, but a human always presses send.",
      outcome: "The hard part was testing an AI that never answers the same way twice. The answer was <em>three test levels</em>: a fake AI for speed, a tiny AI model as a dress rehearsal and the real model last.",
      facts: [
        { value: "5 min", label: "between inbox checks" },
        { value: "3", label: "test levels" },
        { value: "80%", label: "test coverage required" },
      ],
      nerdy: ["Akka SDK", "Event sourcing", "Gmail API", "Google Sheets API", "SmolLM2-135M (test tier)", "JaCoCo"],
      links: [gh("community-assistant")],
    },
  },
  {
    slug: "linkedin-conversation-analysis",
    track: "lab",
    sv: {
      title: "Vem svarar på LinkedIn?",
      context: "Egen dataanalys · 2025",
      hook: "Säg \"hej\" och hälften tystnar. Dela något användbart och nästan ingen gör det.",
      problem: "Som enmansbyrå ville jag veta vilka av mina LinkedIn-samtal som faktiskt leder någonstans.",
      did: "Jag exporterade mina egna meddelanden och lät AI sortera två månaders samtal, 107 stycken, i 13 typer, från jobberbjudanden till födelsedagshälsningar. Resultatet blev en dashboard med 7 vyer.",
      outcome: "Lärdomen var rak. När jag bara skrev \"hej!\" dog <em>13 av 26</em> samtal direkt. När jag delade något användbart, som mina AI-kommandon, blev <em>1 av 25</em> obesvarat.",
      facts: [
        { value: "107", label: "samtal analyserade" },
        { value: "13/26", label: "tystnade efter \"hej!\"" },
        { value: "1/25", label: "tystnade när jag delade något" },
      ],
      nerdy: ["Node.js", "LLM-klassificering", "D3", "Observable Plot"],
      links: [],
    },
    en: {
      title: "Who actually replies?",
      context: "Own data analysis · 2025",
      hook: "Say \"hi\" and half go quiet. Share something useful and almost nobody does.",
      problem: "As a one-man consultancy I wanted to know which of my LinkedIn conversations actually lead somewhere.",
      did: "I exported my own messages and had AI sort two months of conversations, 107 of them, into 13 types, from job offers to birthday wishes. The result was a dashboard with 7 views.",
      outcome: "The lesson was blunt. When I just wrote \"hi!\", <em>13 of 26</em> conversations died right there. When I shared something useful, like my AI commands, <em>1 of 25</em> went unanswered.",
      facts: [
        { value: "107", label: "conversations analysed" },
        { value: "13/26", label: "went quiet after \"hi!\"" },
        { value: "1/25", label: "went quiet when I shared" },
      ],
      nerdy: ["Node.js", "LLM classification", "D3", "Observable Plot"],
      links: [],
    },
  },
  {
    slug: "architectural-blueprint-to-3d",
    track: "lab",
    sv: {
      title: "Från ritning till 3D",
      context: "Eget experiment · 2026",
      hook: "Stängt filformat: återvändsgränd. Öppet filformat: jag klev in i vårt framtida badrum.",
      problem: "Vi renoverar badrummet, och jag ville stå i det innan någon lyft en hammare. Första försöket var arkitektens AutoCAD-ritning, ett stängt format där mina AI-agenter inte kom någonstans.",
      did: "Sedan skickade arkitekten även en IFC-fil, en öppen standard. Agenterna skrev en konverterare från grunden, och ritningen blev ett 3D-rum där vi byter färger, växlar mellan dag- och kvällsljus och kan kliva in med VR-headset.",
      outcome: "Lärdomen tar jag med mig till kunder: <em>AI är bara så kapabel som formaten du låter den läsa.</em>",
      facts: [
        { value: "0", label: "beroenden i konverteraren" },
        { value: "1:1", label: "skala i VR" },
      ],
      nerdy: ["IFC", "Python", "Babylon.js", "WebXR"],
      links: [],
    },
    en: {
      title: "From blueprint to 3D",
      context: "Own experiment · 2026",
      hook: "Closed file format: dead end. Open file format: I walked into our future bathroom.",
      problem: "We're renovating our bathroom, and I wanted to stand in it before anyone picked up a hammer. The first attempt was the architect's AutoCAD drawing, a closed format where my AI agents got nowhere.",
      did: "Then the architect also sent an IFC file, an open standard. The agents wrote a converter from scratch, and the drawing became a 3D room where we swap colours, switch between day and evening light and can walk in with a VR headset.",
      outcome: "The lesson I bring to clients: <em>AI is only as capable as the formats you let it read.</em>",
      facts: [
        { value: "0", label: "dependencies in the converter" },
        { value: "1:1", label: "scale in VR" },
      ],
      nerdy: ["IFC", "Python", "Babylon.js", "WebXR"],
      links: [],
    },
  },
] as const satisfies readonly ProjectEntry[];

/** Literal union of every valid project slug. Drives compile-time validation of slug-keyed maps. */
export type ProjectSlug = (typeof projectEntries)[number]["slug"];

/**
 * Slugs that used to exist and now live inside another card. Old deep links
 * (`/#tdd-with-ai-presentation`) keep working by resolving to the new card.
 */
export const SLUG_ALIASES: Record<string, ProjectSlug> = {
  "tdd-with-ai-presentation": "tdd-command-generator",
};

interface TrackCopy {
  label: string;
  /** Closing line on every card in this track */
  cta: string;
}

export interface TrackStyle {
  /** Chip / accent colour */
  color: string;
}

const trackColor = (id: "teach" | "legacy" | "build") =>
  trackEntries.find((t) => t.id === id)!.color;

/** Track labels, colours and per-track CTA. Colours come from the contact slide. */
export const PROJECT_TRACKS: Record<ProjectTrack, TrackStyle & Record<Lang, TrackCopy>> = {
  legacy: {
    color: trackColor("legacy"),
    sv: { label: "Legacyräddning", cta: "Har ni ett system som krånglar, eller tyst drar in pengar?" },
    en: { label: "Legacy rescue", cta: "Got a system that misbehaves, or quietly makes you money?" },
  },
  build: {
    color: trackColor("build"),
    sv: { label: "Bygge", cta: "Vill ni ha något liknande byggt?" },
    en: { label: "Build", cta: "Want something like this built?" },
  },
  teach: {
    color: trackColor("teach"),
    sv: { label: "Lära ut", cta: "Vill ditt team jobba så här? Jag håller workshops." },
    en: { label: "Teaching", cta: "Want your team working like this? I run workshops." },
  },
  lab: {
    color: "#e07ab0",
    sv: { label: "Experiment", cta: "Nyfiken på vad det här kan betyda för er?" },
    en: { label: "Experiment", cta: "Curious what this could mean for you?" },
  },
};

export const TRACK_ORDER: ProjectTrack[] = ["legacy", "build", "teach", "lab"];

export interface ProjectQuote {
  text: string;
  name: string;
  relation: string;
}

/** A fully resolved project for one locale, ready to render. */
export interface Project extends ProjectCopy {
  slug: ProjectSlug;
  track: ProjectTrack;
  flagship: boolean;
  /** Track label, e.g. "Legacyräddning" */
  tag: string;
  quote: ProjectQuote | null;
}

function resolveQuote(name: string | undefined, lang: Lang): ProjectQuote | null {
  if (!name) return null;
  const t = testimonials.find((q) => q.name === name);
  if (!t) return null;
  return { text: t.text, name: t.name, relation: t.relation[lang] };
}

export function getProjects(lang: Lang): Project[] {
  return projectEntries.map((entry) => {
    const e = entry as ProjectEntry;
    return {
      ...(e[lang] as ProjectCopy),
      slug: entry.slug,
      track: e.track,
      flagship: e.flagship ?? false,
      tag: PROJECT_TRACKS[e.track][lang].label,
      quote: resolveQuote(e.quote?.[lang], lang),
    };
  });
}

/** Generate a URL slug from a title. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** All project slugs, in display order. */
export function getProjectSlugs(): ProjectSlug[] {
  return projectEntries.map((entry) => entry.slug);
}

/** Resolve a URL hash (without `#`) to a current slug, following aliases. */
export function resolveProjectSlug(hash: string): ProjectSlug | null {
  const slugs = getProjectSlugs() as string[];
  if (slugs.includes(hash)) return hash as ProjectSlug;
  return SLUG_ALIASES[hash] ?? null;
}

export { projectEntries };

import type { Lang } from "./ui";

export interface Project {
  tag: string;
  title: string;
  description: string;
}

interface ProjectEntry {
  slug: string;
  sv: Project;
  en: Project;
}

/**
 * Project entries with explicit slugs.
 *
 * `as const satisfies` preserves slug string literals so they form the
 * `ProjectSlug` union type below. Any consumer keyed by slug (e.g. the
 * illustrations map) is then validated against this single source of truth
 * at compile time — TypeScript will flag unknown slugs and missing entries.
 *
 * Slug invariant: each entry's slug must equal `slugify(en.title)`. This is
 * checked by `projects.test.ts` so URLs stay derivable from titles.
 */
const projectEntries = [
  {
    slug: "community-assistant",
    sv: { tag: "AI-agent", title: "Community Assistant", description: "AI-assistent för bostadsrättsföreningar och styrelser som hanterar återkommande e-postfrågor. Plockar upp inkommande mejl, matchar mot historiska ärenden och skriver ett utkast till svar baserat på hur styrelsen svarat förut. En styrelsemedlem godkänner eller justerar innan utskick.<br><br>Byggd på <em>Akka SDK</em> med event sourcing, integrerad med <em>Gmail</em> och <em>Google Sheets</em>. En <em>SmolLM2-135M</em> nano-LLM hanterar klassificering och utkastning — lätt nog att inte kräva en stor modell.<br><br><em>3-stegs teststrategi</em>: dummy-LLM:er för snabbhet och determinism, nano-modellen som realistiskt mellanlager, och produktionsmodellen för slutlig kvalitetskontroll.<br><br><a href=\"https://github.com/wbern/community-assistant\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/community-assistant</a>" },
    en: { tag: "AI Agent", title: "Community Assistant", description: "AI assistant for community boards handling recurring email questions. Picks up incoming mail, matches against historical tickets, and drafts a reply based on how the board answered before. A board member approves or amends before sending.<br><br>Built on the <em>Akka SDK</em> with event sourcing, integrated with <em>Gmail</em> and <em>Google Sheets</em>. A <em>SmolLM2-135M</em> nano LLM handles classification and drafting — light enough to run without a large model.<br><br><em>3-tier testing strategy</em>: dummy LLMs for speed and determinism, the nano model as a realistic middle tier, and the production model for final confidence checks.<br><br><a href=\"https://github.com/wbern/community-assistant\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/community-assistant</a>" },
  },
  {
    slug: "pi-pai",
    sv: { tag: "Infrastruktur", title: "Pi-PAI", description: "Fjärrstyrd agentorkestrering på en <em>Raspberry Pi 4</em>, åtkomlig från mobilen via appen <em>Happy</em> (inklusive röststyrning). En <em>MCP-server</em> fungerar som kontrollplan: en Claude Code-instans startar och stoppar andra Claude Code-sessioner utifrån arbetsbelastning.<br><br>Varje agent har <em>GitHub</em>-åtkomst och kan självständigt köra tester, skapa pull requests och fortsätta arbeta medan operatören är borta från datorn. Hela uppsättningen provisioneras med <em>Ansible</em> — reproducerbar infrastruktur som går att deploya på kraftigare hårdvara, fler maskiner eller hos en kund.<br><br><a href=\"https://github.com/wbern/pi-pai\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/pi-pai</a>" },
    en: { tag: "Infrastructure", title: "Pi-PAI", description: "Remote agent orchestration on a <em>Raspberry Pi 4</em>, accessed from a phone via the <em>Happy</em> app (with voice control). An <em>MCP server</em> acts as the control plane: one Claude Code instance starts and stops other Claude Code sessions based on workload.<br><br>Each agent has <em>GitHub</em> access and independently runs tests, opens pull requests, and continues work while the operator is away from the computer. Fully provisioned with <em>Ansible</em> — reproducible infrastructure that redeploys to bigger hardware, more machines, or a client site.<br><br><a href=\"https://github.com/wbern/pi-pai\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/pi-pai</a>" },
  },
  {
    slug: "dll-decompilation",
    sv: { tag: "Legacyräddning", title: "DLL-dekompilering", description: "Återställde funktionalitet i underhållslösa leverantörs-<em>DLL:er</em> utan tillgång till källkod. Kunden startade om sin servermjukvara var 15:e minut på grund av ett <em>race condition</em> i binärerna.<br><br><em>3-fasprocess</em>: dekompilerade DLL:erna (resultat ~80% korrekt, resten trasigt på grund av binärernas ålder); byggde en testsvit mot den befintliga setupen för att låsa in nuvarande beteende; fixade den dekompilerade koden tills varje test passerade; löste sedan själva samtidighetsproblemet.<br><br>Deployad via <em>Tailscale</em> till <em>5 kundsajter</em> med 3 rollback-strategier. Låste upp en betydande intäktsström för kunden." },
    en: { tag: "Legacy Rescue", title: "DLL Decompilation", description: "Recovered functionality from unmaintained vendor <em>DLLs</em> with no source code available. The client was restarting their server software every 15 minutes due to a <em>race condition</em> in the binaries.<br><br><em>3-phase process</em>: decompiled the DLLs (output ~80% correct, the rest broken by binary age); built a test suite against the existing setup to lock in current behavior; fixed the decompiled code until every test passed; then resolved the concurrency issue itself.<br><br>Deployed over <em>Tailscale</em> to <em>5 customer sites</em> with 3 rollback strategies. Unlocked a significant revenue stream for the client." },
  },
  {
    slug: "legacy-chess-tool-rewrite",
    sv: { tag: "Modernisering", title: "Legacy-schackverktyg: omskrivning", description: "Modernisering av ett desktopverktyg för lottning av schackturneringar från 2018 till en <em>ren webbapplikation</em>. Verktyget används fortfarande av många klubbar för sin enkelhet, och lottningsalgoritmerna är dess kärnvärde — parningar i schack är förvånansvärt komplicerade.<br><br>Den ursprungliga Java-frontenden kopplades isär från databasoperationerna och lottningslogiken exponerades via ett REST-lager. Byggde därefter <em>snapshot-tester av alla lottningspermutationer</em> — över 200 snapshots av hur databasen förändras under en turnering. Med det skyddsnätet på plats portades hela backenden till webbläsaren med <em>sql.js</em>; varje snapshot-test passerade vid första körningen.<br><br>Applikationen körs nu <em>helt offline i webbläsaren</em> — ingen backend behövs. <a href=\"https://lotta.bernting.se/?tab=pairings\" target=\"_blank\" rel=\"noopener noreferrer\">lotta.bernting.se</a><br><br><a href=\"https://github.com/wbern/lotta\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/lotta</a>" },
    en: { tag: "Modernization", title: "Legacy Chess Tool Rewrite", description: "Modernization of a 2018-era desktop chess tournament pairing tool into a <em>browser-only application</em>. Still used by many clubs for its simplicity, the seeding algorithms are the software's core value — pairings in chess are surprisingly complex.<br><br>The original Java frontend was decoupled from its database operations and the pairing logic exposed through a REST layer. Built <em>snapshot tests of every pairing permutation</em> — over 200 snapshots of how the database evolves during a tournament. With that safety net in place, the entire backend was ported into the browser with <em>sql.js</em>; every snapshot test passed on the first run.<br><br>The application now runs <em>fully offline in the browser</em> — no backend required. <a href=\"https://lotta.bernting.se/?tab=pairings\" target=\"_blank\" rel=\"noopener noreferrer\">lotta.bernting.se</a><br><br><a href=\"https://github.com/wbern/lotta\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/lotta</a>" },
  },
  {
    slug: "adr-lint",
    sv: { tag: "Open Source", title: "adr-lint", description: "Definierar tekniska regelverk för ett team som <em>Architectural Decision Records</em>, och startar sedan en kortlivad LLM-agent per ADR vars uppgift är att bedöma om kodändringar lever upp till varje regel. Teamets <em>process</em> är viktigare än själva verktyget — adr-lint automatiserar bara utvärderingen.<br><br>Samma princip tillämpad på en publicerad artikel om AI och tillit: <em>15 ADR:er</em> definierade ramarna innan en mening var skriven, och en agent per ADR granskade var och en av <em>22 utkast</em> oberoende. Open source.<br><br><a href=\"https://github.com/wbern/adr-lint\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/adr-lint</a>" },
    en: { tag: "Open Source", title: "adr-lint", description: "Defines technical rules for a team as <em>Architectural Decision Records</em>, then spawns a short-lived LLM agent per ADR to judge whether code changes meet each rule. The team's <em>process</em> matters more than the tool itself — adr-lint just automates the evaluation step.<br><br>Same principle applied to a published article on AI and trust: <em>15 ADRs</em> defined the boundaries before a sentence was written, and one agent per ADR independently reviewed each of <em>22 drafts</em>. Open source.<br><br><a href=\"https://github.com/wbern/adr-lint\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/adr-lint</a>" },
  },
  {
    slug: "this-cv",
    sv: { tag: "Meta", title: "Detta CV", description: "Du tittar på den. Sajten är byggd med <em>Astro</em>, <em>TypeScript</em> och <em>testdriven utveckling</em> — discipliner som motverkar regressioner vid iteration.<br><br>Målet: en engagerande upplevelse snarare än ännu en generisk utvecklarsajt. Starkt påverkad av UX-personer som jag samarbetat med genom åren.<br><br><a href=\"https://github.com/wbern/william.bernting.se\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/william.bernting.se</a>" },
    en: { tag: "Meta", title: "This CV", description: "You're looking at it. The site is built with <em>Astro</em>, <em>TypeScript</em>, and <em>test-driven development</em> — disciplines applied to prevent regressions during iteration.<br><br>The goal: an engaging experience rather than another generic developer site. Strong influence from UX collaborators over the years.<br><br><a href=\"https://github.com/wbern/william.bernting.se\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/william.bernting.se</a>" },
  },
  {
    slug: "tdd-command-generator",
    sv: { tag: "Open Source", title: "TDD-kommandogenerator", description: "Slash-kommandoverktyg för AI-kodningsagenter som upprätthåller <em>testdriven utveckling</em>. Återanvändbara promptmallar kapslar in TDD-metodiken så att den inte behöver upprepas varje session — kompenserar för att kodningsagenter inte är tränade på praktiken.<br><br>Inkluderar en generator för att anpassa installationsplats. Repot har 100% testtäckning. Fick <em>över 100 GitHub-stjärnor över en natt</em> vid release. Open source.<br><br><a href=\"https://github.com/wbern/agent-instructions\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/agent-instructions</a>" },
    en: { tag: "Open Source", title: "TDD Command Generator", description: "Slash-command toolkit for AI coding agents that enforces <em>test-driven development</em>. Reusable prompt templates encode the TDD methodology so it doesn't have to be repeated every session — compensating for the fact that coding agents aren't trained on the practice.<br><br>Includes a generator for customizing install location. Repo has 100% test coverage. Received <em>over 100 GitHub stars overnight</em> on release. Open source.<br><br><a href=\"https://github.com/wbern/agent-instructions\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/agent-instructions</a>" },
  },
  {
    slug: "obscene",
    sv: { tag: "Open Source", title: "obscene", description: "Statisk analys som lyfter <em>beteendemönster i en kodbas</em> och pekar ut tydliga refaktoriseringsmöjligheter. Byggd för att ta bort den sociala friktionen kring kodkvalitet — verktyget visar mönstren neutralt så att teamet kan besluta tillsammans vad som ska städas.<br><br>Körs i CI eller lokalt. Open source.<br><br><a href=\"https://github.com/wbern/obscene\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/obscene</a>" },
    en: { tag: "Open Source", title: "obscene", description: "Static analysis that surfaces <em>behavior patterns in a codebase</em> and highlights clear refactor opportunities. Built to remove the social friction around code quality — the tool shows the patterns neutrally so the team can decide together what to clean up.<br><br>Runs in CI or locally. Open source.<br><br><a href=\"https://github.com/wbern/obscene\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/obscene</a>" },
  },
  {
    slug: "cc-ping",
    sv: { tag: "Open Source", title: "cc-ping", description: "Verktyg för att hantera <em>Claude Codes</em> vecko- och sessionsgränser. Pingar ett eller flera konton schemalagt så att gränserna återställs så tidigt som möjligt, och kan konfigureras för att tajma en sessionsreset till mitten av arbetsdagens peak.<br><br>Liten, fokuserad, open source — ett av flera verktyg byggda för att göra vardagsarbetet med AI-agenter förutsägbart.<br><br><a href=\"https://github.com/wbern/cc-ping\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/cc-ping</a>" },
    en: { tag: "Open Source", title: "cc-ping", description: "Utility for managing <em>Claude Code</em> weekly and session limits. Pings one or more accounts on a schedule so the limits reset as early as possible, and can be configured to time a session reset around the middle of the workday peak.<br><br>Small, focused, open source — one of several tools built to make day-to-day work with AI agents predictable.<br><br><a href=\"https://github.com/wbern/cc-ping\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/cc-ping</a>" },
  },
  {
    slug: "me-and-my-crew",
    sv: { tag: "Open Source", title: "Me and My Crew", description: "Publik referensuppsättning för <em>Gas Town</em>-stil terminalbaserad agentorkestrering. Kör flera AI-agenter sida vid sida i terminalen — synliga snarare än dolda i bakgrunden — med tydlig struktur för vilken agent som äger vilken roll.<br><br>Ingen produkt; ett dokumenterat \"så här satte jag upp det, om du vill replikera.\" <a href=\"https://github.com/wbern/gastown-me-and-my-crew\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/gastown-me-and-my-crew</a>" },
    en: { tag: "Open Source", title: "Me and My Crew", description: "Public reference setup for <em>Gas Town</em>-style terminal-based agent orchestration. Runs multiple AI agents side by side in the terminal — visible rather than hidden in the background — with clear structure for which agent owns which role.<br><br>Not a product; a documented \"this is how I set it up, if you want to replicate.\" <a href=\"https://github.com/wbern/gastown-me-and-my-crew\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/gastown-me-and-my-crew</a>" },
  },
  {
    slug: "tmux-explode",
    sv: { tag: "Open Source", title: "tmux-explode", description: "Litet kommando som visar <em>alla aktiva tmux-sessioner i en enda ruta</em> — en kontrolltornsvy för att övervaka många AI-agenter som körs parallellt. Open source.<br><br><a href=\"https://github.com/wbern/tmux-explode\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/tmux-explode</a>" },
    en: { tag: "Open Source", title: "tmux-explode", description: "Small command that displays <em>all active tmux sessions in a single pane</em> — a control-tower view for monitoring many AI agents running in parallel. Open source.<br><br><a href=\"https://github.com/wbern/tmux-explode\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/tmux-explode</a>" },
  },
  {
    slug: "chess-reel",
    sv: { tag: "Personligt projekt", title: "Chess Reel", description: "Webbaserat schackbräde som spelar <em>öppningsreels</em> — ursprungligen byggt för att studera Hyper-Accelerated Dragon-varianten av Sicilianskt som svart.<br><br>Byggt med <em>testdriven utveckling</em> och en <em>diamantformad testsvit</em> — många något tyngre tester i mellanlagret — som visade sig särskilt välanpassad för agentisk kodning. Hanterar begränsningen att LLM:er inte kan spela schack genom att luta sig mot schackprotokoll och grundläggande principer.<br><br>En testbädd för att hantera stora mängder AI-skriven kod från grunden." },
    en: { tag: "Personal Project", title: "Chess Reel", description: "Web chess board that plays <em>opening reels</em> — originally built to study the Hyper-Accelerated Dragon variation of the Sicilian as black.<br><br>Built with <em>test-driven development</em> using a <em>diamond-shaped test suite</em> — many slightly heavier tests in the middle layer — which proved especially well suited to agentic coding. Handles the limitation that LLMs can't play chess by leaning on chess protocols and foundational principles.<br><br>A testbed for managing large amounts of AI-written code from scratch." },
  },
  {
    slug: "tdd-with-ai-presentation",
    sv: { tag: "Undervisning", title: "TDD med AI — Presentation", description: "Presentation om <em>testdriven utveckling med AI-kodningsagenter</em>. Byggd helt från terminalen med Claude Code, slides skapade med <em>Slidev</em>, hostade på den här sajten — alltid tillgängliga och redo att köras.<br><br><a href=\"https://github.com/wbern/slidev-tdd-with-ai\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/slidev-tdd-with-ai</a>" },
    en: { tag: "Teaching", title: "TDD with AI — Presentation", description: "Presentation on <em>test-driven development with AI coding agents</em>. Built entirely from the terminal with Claude Code, slides made with <em>Slidev</em>, hosted on this site — always accessible and ready to run.<br><br><a href=\"https://github.com/wbern/slidev-tdd-with-ai\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/slidev-tdd-with-ai</a>" },
  },
  {
    slug: "linkedin-conversation-analysis",
    sv: { tag: "Dataanalys", title: "LinkedIn-konversationsanalys", description: "Interaktiv dashboard byggd från en personlig export av <em>LinkedIn-konversationer</em>. Ungefär hälften av kalla kontakter kände sig tvungna att förklara sin förfrågan när de hälsades på — en tydlig effekt av att bryta normen.<br><br>Konversationerna kategoriserades i <em>13 kategorier</em> och visualiseras genom <em>7 vyer</em> som lyfter mönster i vem som är värd att lägga tid på. Byggd för att informera en kontaktstrategi från primärdata snarare än magkänsla." },
    en: { tag: "Data Analysis", title: "LinkedIn Conversation Analysis", description: "Interactive dashboard built from a personal export of <em>LinkedIn conversations</em>. Around half of cold contacts felt compelled to explain their request once greeted — a clear effect of breaking the silent-norm.<br><br>Conversations were categorized into <em>13 categories</em> and visualized through <em>7 views</em> surfacing patterns in who is worth spending time on. Built to inform an outreach strategy from primary data rather than intuition." },
  },
  {
    slug: "architectural-blueprint-to-3d",
    sv: { tag: "3D-visualisering", title: "Arkitektritning till 3D", description: "Pipeline som omvandlar <em>AutoCAD-ritningar till 3D-visualiseringar</em> med LLM-agenter i varje steg. Varje transformationssteg utförs av en agent, utan manuell detaljstyrning av det visuella resultatet.<br><br>3D förblir ett utmanande område för agentisk kodning — mycket av ekosystemet är fortfarande inlåst bakom <em>proprietära assets och mjukvara</em>. Projektet visar gränserna för vad agenter kan och inte kan göra när ekosystemet inte är öppet." },
    en: { tag: "3D Visualization", title: "Architectural Blueprint to 3D", description: "Pipeline that converts <em>AutoCAD blueprints into 3D renderings</em> using LLM agents at each step. Each transformation stage is executed by an agent, with no manual micromanagement of the visual output.<br><br>3D remains a challenging space for agentic coding — much of the ecosystem is still locked behind <em>proprietary assets and software</em>. The project surfaces the practical boundaries of what agents can and can't do when the ecosystem isn't open." },
  },
  {
    slug: "pixi-platformer",
    sv: { tag: "Spel", title: "Pixi Platformer", description: "Platformer i Doodle Jump-stil byggd från grunden med webbteknologi — ingen spelmotor. Egen <em>Entity Component System</em>-arkitektur i React: varje spelobjekt sätts ihop av lösa komponenter (position, hastighet, kollision, soliditet).<br><br>Fysiken använder <em>icke-linjär gravitation</em> med olika accelerationskurvor för uppåt- och nedåtrörelse. Stöder <em>tangentbord och touch</em>, renderad med <em>Pixi.js 7</em> via WebGL, testad med <em>Vitest</em>.<br><br><a href=\"https://github.com/wbern/platformer\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/platformer</a>" },
    en: { tag: "Game", title: "Pixi Platformer", description: "Doodle Jump-style platformer built from scratch with web technology — no game engine. Custom <em>Entity Component System</em> architecture in React: each game object composed of loose components (position, velocity, collision, solidity).<br><br>Physics use <em>non-linear gravity</em> with different acceleration curves for upward and downward movement. Supports <em>keyboard and touch</em>, rendered with <em>Pixi.js 7</em> via WebGL, tested with <em>Vitest</em>.<br><br><a href=\"https://github.com/wbern/platformer\" target=\"_blank\" rel=\"noopener noreferrer\">github.com/wbern/platformer</a>" },
  },
  {
    slug: "knowledge-bot",
    sv: { tag: "AI / RAG", title: "Knowledge Bot", description: "<em>RAG-baserad mejlrådgivare</em> för en fastighetsförvaltningskund med <em>38 000 historiska supportmejl</em>. Kombinerar <em>hybridsökning</em> — BM25 nyckelordssökning via SQLite FTS5 och vektorsökning via <em>LEANN</em>, ett grafbaserat retrieval-system som komprimerar lagringen med 97%. Resultaten slås ihop med <em>Reciprocal Rank Fusion</em> och matas till en lokal LLM via <em>Ollama</em>.<br><br>Träffsäkerheten gick från 40% till <em>100%</em> efter att metadataprefix och hybridstrategin lagts till. Körs helt privat på en <em>Proxmox-VM</em> provisionerad med Ansible — ingen data lämnar kundens servrar. <em>Telegram-bot</em> och en mejlbevakare ger personalen rådgivning i realtid, med källhänvisningar till de historiska mejl som låg till grund för svaret." },
    en: { tag: "AI / RAG", title: "Knowledge Bot", description: "<em>RAG-based email advisor</em> for a property-management client with <em>38,000 historical support emails</em>. Combines <em>hybrid search</em> — BM25 keyword search via SQLite FTS5 and vector search via <em>LEANN</em>, a graph-based retrieval system that compresses storage by 97%. Results are merged with <em>Reciprocal Rank Fusion</em> and fed to a local LLM via <em>Ollama</em>.<br><br>Retrieval accuracy went from 40% to <em>100%</em> after adding metadata prefixes and the hybrid strategy. Runs entirely private on a <em>Proxmox VM</em> provisioned with Ansible — no data leaves the client's servers. A <em>Telegram bot</em> and an email watcher deliver real-time advice with source citations to the historical mails that informed each answer." },
  },
  {
    slug: "telia-se",
    sv: { tag: "Legacymigrering", title: "Telia.se", description: "Inkrementell migrering av Telia.se från ett legacysystem byggt i <em>Freemarker</em> — en mallmotor djupt sammanflätad med affärslogiken — till en modern frontend, utan big bang-omskrivning.<br><br>Arbetet omfattade att bygga bryggor mellan gammalt och nytt, införa mönster som kunde samexistera med den befintliga kodbasen, och successivt fasa ut Freemarker-mallar utan att störa produktionstrafiken. Uppdraget i en mening: <em>migrera utan att stanna</em>." },
    en: { tag: "Legacy Migration", title: "Telia.se", description: "Incremental migration of Telia.se from a <em>Freemarker</em>-based legacy templating system — deeply intertwined with the business logic — to a modern frontend, without a big-bang rewrite.<br><br>Work involved building bridges between old and new, introducing patterns that coexisted with the existing codebase, and progressively phasing out Freemarker templates without disrupting production traffic. The brief in one phrase: <em>migrate without stopping</em>." },
  },
  {
    slug: "kendev-se",
    sv: { tag: "Företag", title: "kendev.se", description: "Min konsultfirmas webbplats. <em>IT-integration, coachning och migration.</em><br><br><a href=\"https://www.kendev.se\" target=\"_blank\" rel=\"noopener noreferrer\">www.kendev.se</a>" },
    en: { tag: "Business", title: "kendev.se", description: "My consultancy's website. <em>IT integration, coaching, and migration.</em><br><br><a href=\"https://www.kendev.se\" target=\"_blank\" rel=\"noopener noreferrer\">www.kendev.se</a>" },
  },
  {
    slug: "sembo-se-startpage",
    sv: { tag: "Ledarskap", title: "Sembo.se Startsida", description: "Ledde omdesignen av Sembo.se:s startsida från ett experimentellt landningsläge till en <em>förstklassig användarupplevelse</em> — omarkitektur, prestanda och en sammanhållen design som matchade resten av plattformen.<br><br>Levererades genom <em>coachning av teamet</em> och tydliga tekniska standarder. Startsidan blev en central yta för <em>kampanjer, inspirationsinnehåll och snabb resebokning</em> — och ett bevis för vad ett litet, fokuserat team kan leverera." },
    en: { tag: "Leadership", title: "Sembo.se Startpage", description: "Led the redesign of the Sembo.se startpage from an experimental landing into a <em>first-class user experience</em> — rearchitecture, performance, and a cohesive design matching the rest of the platform.<br><br>Delivered through <em>team coaching</em> and clear technical standards. The startpage became a key surface for <em>campaigns, inspirational content, and quick travel booking</em> — and a proof point for what a small, focused team can ship." },
  },
] as const satisfies readonly ProjectEntry[];

/** Literal union of every valid project slug. Drives compile-time validation of slug-keyed maps. */
export type ProjectSlug = (typeof projectEntries)[number]["slug"];

export function getProjects(lang: Lang): Project[] {
  return projectEntries.map((entry) => entry[lang]);
}

/** Generate a URL slug from an English project title. */
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

export { projectEntries };

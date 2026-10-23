import type { ProjectSlug } from "../i18n/projects";
import type { Lang } from "../i18n/ui";

/**
 * The visual on each project card.
 *
 * Every card gets one: a real screenshot where one exists (era-correct, via
 * the Wayback Machine for employer sites), otherwise a small chart or diagram
 * drawn from the project's own verified numbers. Keyed by `ProjectSlug` and
 * exhaustive, so adding or renaming a project breaks the build until it has a
 * visual (or an explicit `null`).
 *
 * SVG charts carry their own text, so the map is built per language.
 */
export type Illustration =
  | { kind: "svg"; markup: string }
  | { kind: "photo"; src: string; alt: string; caption?: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const RED = "#e0605a";
const GREEN = "#3ecf8e";

/* ── DLL: 19 end-to-end checks against the live sites, before and after ── */
function dllTests(lang: Lang): string {
  const L = lang === "sv"
    ? { before: "Originalfilerna", after: "Efter lagningen", title: "19 automatiska kontroller mot de skarpa sajterna" }
    : { before: "Original files", after: "After the fix", title: "19 automated checks against the live sites" };
  // Illustrative pattern: 8 of 19 passed with the original DLLs (repo test log).
  const pass = new Set([0, 1, 3, 6, 7, 10, 14, 15]);
  const cell = 22, gap = 5.4, x0 = 24;
  const row = (y: number, after: boolean) =>
    Array.from({ length: 19 }, (_, i) => {
      const x = x0 + i * (cell + gap);
      const ok = pass.has(i);
      if (!after) return `<rect x="${x.toFixed(1)}" y="${y}" width="${cell}" height="${cell}" rx="4" fill="${ok ? GREEN : RED}" opacity="${ok ? 0.85 : 0.7}"/>`;
      // Failing cells flip to green one by one when the card opens
      return ok
        ? `<rect x="${x.toFixed(1)}" y="${y}" width="${cell}" height="${cell}" rx="4" fill="${GREEN}" opacity="0.85"/>`
        : `<rect class="fx-flip" style="animation-delay:${(0.5 + i * 0.07).toFixed(2)}s" x="${x.toFixed(1)}" y="${y}" width="${cell}" height="${cell}" rx="4"/>`;
    }).join("");
  return `<div class="diorama diorama--chart">
    <svg viewBox="0 0 568 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(`${L.title}: ${L.before} 8/19, ${L.after} 19/19`)}">
      <text x="24" y="28" class="fx-label">${esc(L.before)}</text>
      <text x="544" y="28" class="fx-num" fill="${RED}" text-anchor="end">8/19</text>
      ${row(38, false)}
      <text x="24" y="98" class="fx-label">${esc(L.after)}</text>
      <text x="544" y="98" class="fx-num" fill="${GREEN}" text-anchor="end">19/19</text>
      ${row(108, true)}
    </svg>
  </div>`;
}

/* ── Knowledge Bot: mail pile → search → answer with receipts, all on-prem ── */
function knowledgeFlow(lang: Lang): string {
  const L = lang === "sv"
    ? { pile: "38 000 mejl", search: "ord + AI-sök", answer: "\"Så löste vi det sist\"", src: "källa", lock: "Allt på kundens egen server" }
    : { pile: "38,000 emails", search: "keyword + AI search", answer: "\"Here's how we did it\"", src: "source", lock: "All on the client's own server" };
  const env = (x: number, y: number, o: number) =>
    `<g opacity="${o}"><rect x="${x}" y="${y}" width="58" height="38" rx="5" fill="var(--bg-card)" stroke="var(--text-dim)" stroke-width="1.6"/><polyline points="${x},${y} ${x + 29},${y + 20} ${x + 58},${y}" fill="none" stroke="var(--text-dim)" stroke-width="1.6"/></g>`;
  return `<div class="diorama diorama--chart">
    <svg viewBox="0 0 568 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(`${L.pile} → ${L.search} → ${L.answer}. ${L.lock}.`)}">
      <rect x="10" y="8" width="548" height="132" rx="12" fill="none" stroke="var(--purple-dim)" stroke-dasharray="5 5"/>
      ${env(52, 34, 0.35)}${env(46, 44, 0.6)}${env(40, 54, 1)}
      <text x="69" y="122" class="fx-label" text-anchor="middle">${esc(L.pile)}</text>
      <line x1="120" y1="72" x2="210" y2="72" stroke="var(--text-muted)" stroke-width="1.6" stroke-dasharray="4 4" class="fx-flow"/>
      <circle cx="252" cy="66" r="24" fill="none" stroke="var(--purple)" stroke-width="3"/>
      <line x1="269" y1="83" x2="288" y2="102" stroke="var(--purple)" stroke-width="4" stroke-linecap="round"/>
      <text x="256" y="122" class="fx-label" text-anchor="middle">${esc(L.search)}</text>
      <line x1="300" y1="72" x2="350" y2="72" stroke="var(--text-muted)" stroke-width="1.6" stroke-dasharray="4 4" class="fx-flow"/>
      <path d="M362 30 h172 a10 10 0 0 1 10 10 v54 a10 10 0 0 1 -10 10 h-140 l-16 14 v-14 h-16 a10 10 0 0 1 -10 -10 v-54 a10 10 0 0 1 10 -10z" fill="var(--bg-card)" stroke="var(--purple)" stroke-width="2"/>
      <text x="374" y="54" class="fx-quote">${esc(L.answer)}</text>
      <rect x="374" y="66" width="56" height="18" rx="9" fill="none" stroke="var(--text-dim)"/><text x="402" y="79" class="fx-chip" text-anchor="middle">${esc(L.src)} 1</text>
      <rect x="436" y="66" width="56" height="18" rx="9" fill="none" stroke="var(--text-dim)"/><text x="464" y="79" class="fx-chip" text-anchor="middle">${esc(L.src)} 2</text>
      <g transform="translate(200 146)">
        <rect x="0" y="6" width="14" height="11" rx="2" fill="${GREEN}"/>
        <path d="M3 6 V3 a4 4 0 0 1 8 0 V6" fill="none" stroke="${GREEN}" stroke-width="2"/>
        <text x="22" y="16" class="fx-label" fill="${GREEN}">${esc(L.lock)}</text>
      </g>
    </svg>
  </div>`;
}

/* ── TDD commands: cumulative GitHub stars (stargazer timestamps, Oct 2025 – Jul 2026) ── */
const STAR_PATH = "M30.0,208.9 L62.5,207.8 L64.7,206.8 L70.8,205.7 L71.8,204.6 L82.2,203.5 L91.3,202.5 L109.9,201.4 L110.0,196.0 L110.1,190.6 L110.2,180.9 L110.3,170.1 L110.4,160.4 L110.6,150.7 L110.9,141.0 L111.2,131.3 L111.4,121.6 L111.9,110.8 L112.5,103.3 L113.2,95.7 L114.1,89.3 L115.7,86.0 L118.4,82.8 L122.2,80.7 L128.2,79.6 L131.8,76.3 L137.4,73.1 L143.1,69.9 L148.4,67.7 L167.0,65.6 L172.5,62.3 L181.8,60.2 L209.3,59.1 L218.1,58.0 L234.2,54.8 L259.5,53.7 L278.8,52.6 L292.6,49.4 L300.5,46.2 L309.9,45.1 L352.8,44.0 L361.4,41.9 L390.1,40.8 L416.0,39.7 L431.2,38.6 L465.0,37.5 L489.7,35.4 L510.7,34.3 L536.0,33.2 L563.7,32.2 L571.6,31.1 L610.0,30.0";
function starChart(lang: Lang): string {
  const L = lang === "sv"
    ? { spike: "+105 stjärnor på 48 h", from: "okt 2025", to: "jul 2026", aria: "GitHub-stjärnor över tid: från cirka 8 till 167, med ett hopp på 105 stjärnor på två dygn i december 2025" }
    : { spike: "+105 stars in 48 h", from: "Oct 2025", to: "Jul 2026", aria: "GitHub stars over time: from about 8 to 167, with a jump of 105 stars in two days in December 2025" };
  const teal = "#00d4aa";
  return `<div class="diorama diorama--chart">
    <svg viewBox="0 0 640 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(L.aria)}">
      <defs><linearGradient id="star-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${teal}" stop-opacity="0.28"/><stop offset="1" stop-color="${teal}" stop-opacity="0"/></linearGradient></defs>
      <line x1="30" y1="210" x2="610" y2="210" stroke="var(--border)"/>
      <path d="${STAR_PATH} L610,210 L30,210 Z" fill="url(#star-fill)"/>
      <path class="fx-draw" pathLength="1" d="${STAR_PATH}" fill="none" stroke="${teal}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="610" cy="30" r="5" fill="${teal}"/>
      <text x="598" y="58" class="fx-big" text-anchor="end" fill="${teal}">167 ★</text>
      <text x="124" y="136" class="fx-label">${esc(L.spike)}</text>
      <text x="30" y="230" class="fx-axis">${esc(L.from)}</text>
      <text x="610" y="230" class="fx-axis" text-anchor="end">${esc(L.to)}</text>
    </svg>
  </div>`;
}

/* ── ADRian: a written rule catches a change before it lands (the README demo) ── */
function adrRule(lang: Lang): string {
  const L = lang === "sv"
    ? { rule: "ADR · Teamregel", ruleText: ["Inga djurläten", "i namn."], caught: "Stoppad före commit", fix: "förslag: request_handler" }
    : { rule: "ADR · Team rule", ruleText: ["No animal sounds", "in names."], caught: "Caught before commit", fix: "suggest: request_handler" };
  const teal = "#00d4aa";
  return `<div class="diorama diorama--chart">
    <svg viewBox="0 0 568 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(`${L.rule}: ${L.ruleText.join(" ")} moo_moo_handler: ${L.caught}`)}">
      <rect x="28" y="24" width="150" height="112" rx="10" fill="var(--bg-card)" stroke="${teal}" stroke-width="2"/>
      <text x="44" y="50" class="fx-chip" fill="${teal}">${esc(L.rule.toUpperCase())}</text>
      <text x="44" y="80" class="fx-rule">${esc(L.ruleText[0])}</text>
      <text x="44" y="102" class="fx-rule">${esc(L.ruleText[1])}</text>
      <line x1="190" y1="80" x2="238" y2="80" stroke="var(--text-muted)" stroke-width="1.6" stroke-dasharray="4 4" class="fx-flow"/>
      <polygon points="238,74 248,80 238,86" fill="var(--text-muted)"/>
      <rect x="258" y="24" width="282" height="112" rx="10" fill="var(--bg-card)" stroke="var(--border)"/>
      <text x="274" y="52" class="fx-code" fill="var(--text-muted)">func</text>
      <text x="314" y="52" class="fx-code" fill="var(--text)">moo_moo_handler()</text>
      <path d="M314 58 q4 4 8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0" fill="none" stroke="${RED}" stroke-width="1.6"/>
      <rect x="274" y="74" width="170" height="24" rx="12" fill="${RED}" opacity="0.16"/>
      <text x="288" y="91" class="fx-chip" fill="${RED}">✕ ${esc(L.caught)}</text>
      <text x="274" y="122" class="fx-code" fill="${GREEN}" opacity="0.9">${esc(L.fix)}</text>
    </svg>
  </div>`;
}

/* ── LinkedIn: who went quiet (107 conversations, categorizations-aggregate.json) ── */
function linkedinBars(lang: Lang): string {
  const L = lang === "sv"
    ? { hi: "Jag skrev bara \"hej!\"", share: "Jag delade något användbart", quiet: "tystnade", replied: "svarade", of: "av" }
    : { hi: "I just wrote \"hi!\"", share: "I shared something useful", quiet: "went quiet", replied: "replied", of: "of" };
  const unit = 16, x0 = 24;
  const bar = (y: number, quiet: number, total: number) =>
    Array.from({ length: total }, (_, i) =>
      `<rect x="${x0 + i * unit}" y="${y}" width="${unit - 3}" height="22" rx="3" fill="${i < quiet ? RED : "#0a66c2"}" opacity="${i < quiet ? 0.75 : 0.9}"/>`,
    ).join("");
  return `<div class="diorama diorama--chart">
    <svg viewBox="0 0 568 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(`${L.hi}: 13 ${L.of} 26 ${L.quiet}. ${L.share}: 1 ${L.of} 25 ${L.quiet}.`)}">
      <text x="${x0}" y="26" class="fx-label">${esc(L.hi)}</text>
      <text x="544" y="26" class="fx-num" fill="${RED}" text-anchor="end">13/26</text>
      ${bar(36, 13, 26)}
      <text x="${x0}" y="90" class="fx-label">${esc(L.share)}</text>
      <text x="544" y="90" class="fx-num" fill="${GREEN}" text-anchor="end">1/25</text>
      ${bar(100, 1, 25)}
      <rect x="${x0}" y="146" width="12" height="12" rx="2" fill="${RED}" opacity="0.75"/><text x="${x0 + 18}" y="157" class="fx-axis">${esc(L.quiet)}</text>
      <rect x="${x0 + 120}" y="146" width="12" height="12" rx="2" fill="#0a66c2"/><text x="${x0 + 138}" y="157" class="fx-axis">${esc(L.replied)}</text>
    </svg>
  </div>`;
}

const COMMUNITY_DIORAMA = `<div class="diorama">
            <svg viewBox="0 0 568 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g class="diorama-el diorama-el--back">
                    <rect x="120" y="18" width="56" height="22" rx="4" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.35"/>
                    <line x1="128" y1="29" x2="168" y2="29" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.35"/>
                    <rect x="392" y="18" width="56" height="22" rx="4" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.35"/>
                    <line x1="400" y1="29" x2="440" y2="29" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.35"/>
                </g>
                <g class="diorama-el diorama-el--left">
                    <rect x="100" y="56" width="48" height="34" rx="5" stroke="var(--text-dim)" stroke-width="2" fill="none"/>
                    <polyline points="100,56 124,76 148,56" stroke="var(--text-dim)" stroke-width="2" fill="none"/>
                </g>
                <g class="diorama-el diorama-el--center">
                    <rect x="234" y="28" width="100" height="84" rx="18" stroke="var(--purple)" stroke-width="2.5" fill="none"/>
                    <circle cx="262" cy="62" r="5" fill="var(--purple)"/>
                    <circle cx="306" cy="62" r="5" fill="var(--purple)"/>
                    <line x1="270" y1="84" x2="298" y2="84" stroke="var(--purple)" stroke-width="2.5" stroke-linecap="round"/>
                </g>
                <g class="diorama-el diorama-el--right">
                    <polyline points="430,50 418,74 434,74 420,100" stroke="var(--purple-dim)" stroke-width="2.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
                </g>
            </svg>
        </div>`;

const PI_DIORAMA = `<div class="diorama">
            <svg viewBox="0 0 568 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g class="diorama-el diorama-el--back">
                    <line x1="170" y1="70" x2="240" y2="70" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.3" stroke-dasharray="4 3"/>
                    <line x1="328" y1="70" x2="398" y2="70" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.3" stroke-dasharray="4 3"/>
                    <circle cx="204" cy="70" r="3" fill="var(--text-muted)" opacity="0.3"/>
                    <circle cx="364" cy="70" r="3" fill="var(--text-muted)" opacity="0.3"/>
                </g>
                <g class="diorama-el diorama-el--left">
                    <rect x="90" y="42" width="56" height="56" rx="4" stroke="var(--text-dim)" stroke-width="2" fill="none"/>
                    <circle cx="100" cy="52" r="2.5" fill="var(--text-dim)"/>
                    <circle cx="136" cy="52" r="2.5" fill="var(--text-dim)"/>
                    <circle cx="100" cy="88" r="2.5" fill="var(--text-dim)"/>
                    <circle cx="136" cy="88" r="2.5" fill="var(--text-dim)"/>
                    <rect x="106" y="60" width="24" height="16" rx="2" stroke="var(--text-dim)" stroke-width="1.5" fill="none"/>
                    <line x1="90" y1="82" x2="82" y2="82" stroke="var(--text-dim)" stroke-width="1.5"/>
                    <line x1="90" y1="76" x2="82" y2="76" stroke="var(--text-dim)" stroke-width="1.5"/>
                    <line x1="90" y1="70" x2="82" y2="70" stroke="var(--text-dim)" stroke-width="1.5"/>
                </g>
                <g class="diorama-el diorama-el--center">
                    <rect x="234" y="28" width="100" height="84" rx="8" stroke="var(--purple)" stroke-width="2.5" fill="none"/>
                    <line x1="234" y1="48" x2="334" y2="48" stroke="var(--purple)" stroke-width="1.5" opacity="0.5"/>
                    <circle cx="248" cy="38" r="3" fill="var(--purple)" opacity="0.6"/>
                    <circle cx="258" cy="38" r="3" fill="var(--purple)" opacity="0.4"/>
                    <circle cx="268" cy="38" r="3" fill="var(--purple)" opacity="0.25"/>
                    <text x="248" y="72" font-family="var(--mono)" font-size="16" fill="var(--purple)">$_</text>
                </g>
                <g class="diorama-el diorama-el--right">
                    <rect x="418" y="62" width="32" height="28" rx="4" stroke="var(--purple-dim)" stroke-width="2" fill="none"/>
                    <path d="M424,62 V54 a10,10 0 0 1 20,0 V62" stroke="var(--purple-dim)" stroke-width="2" fill="none"/>
                    <circle cx="434" cy="76" r="3" fill="var(--purple-dim)"/>
                </g>
            </svg>
        </div>`;

export function getProjectIllustrations(lang: Lang): Record<ProjectSlug, Illustration | null> {
  const sv = lang === "sv";
  return {
    "slay-crm": {
      kind: "photo",
      src: "/projects/slay-crm.jpg",
      alt: sv ? "Slay CRM:s startsida med produktöversikt och väntelista" : "Slay CRM's homepage with a product overview and waitlist",
      caption: sv ? "slaycrm.eu, oktober 2026" : "slaycrm.eu, October 2026",
    },
    "vibe-coding": {
      kind: "photo",
      src: "/projects/vibe-coding.jpg",
      alt: sv ? "Vibe Codings startsida med bilder från workshopparna" : "Vibe Coding's homepage with photos from the workshops",
      caption: sv ? "vibecoding.bernting.se, oktober 2026" : "vibecoding.bernting.se, October 2026",
    },
    "dll-decompilation": { kind: "svg", markup: dllTests(lang) },
    "knowledge-bot": { kind: "svg", markup: knowledgeFlow(lang) },
    "legacy-chess-tool-rewrite": {
      kind: "photo",
      src: "/projects/lotta-live-sync.jpg",
      alt: sv
        ? "Lotta på en dator och två mobiler: arrangören, domaren och publiken ser samma rond i realtid"
        : "Lotta on a laptop and two phones: organiser, referee and spectators see the same round live",
      caption: sv
        ? "Arrangörens dator, domarens och publikens mobiler i synk. Utan server. (Ur demovideon.)"
        : "Organiser's laptop, referee's and spectators' phones in sync. No server. (From the demo video.)",
    },
    "telia-se": {
      kind: "photo",
      src: "/projects/telia-foretag-2022.jpg",
      alt: sv ? "Telia.se/foretag i februari 2022" : "Telia.se/foretag in February 2022",
      caption: sv ? "telia.se/foretag, februari 2022 (Wayback Machine)" : "telia.se/foretag, February 2022 (Wayback Machine)",
    },
    "sembo-se-startpage": {
      kind: "photo",
      src: "/projects/sembo-2025.jpg",
      alt: sv ? "Sembo.se:s startsida i februari 2025 med sök och kampanjer" : "Sembo.se start page in February 2025 with search and campaigns",
      caption: sv ? "sembo.se, februari 2025 (Wayback Machine)" : "sembo.se, February 2025 (Wayback Machine)",
    },
    "tdd-command-generator": { kind: "svg", markup: starChart(lang) },
    "pi-pai": { kind: "svg", markup: PI_DIORAMA },
    "adr-lint": { kind: "svg", markup: adrRule(lang) },
    "community-assistant": { kind: "svg", markup: COMMUNITY_DIORAMA },
    "linkedin-conversation-analysis": { kind: "svg", markup: linkedinBars(lang) },
    "architectural-blueprint-to-3d": {
      kind: "photo",
      src: "/projects/bathroom-3d.jpg",
      alt: sv ? "3D-modell av ett badrum, genererad från arkitektens IFC-fil" : "3D model of a bathroom, generated from the architect's IFC file",
      caption: sv ? "Vårt badrum i 3D, direkt från arkitektens IFC-fil" : "Our bathroom in 3D, straight from the architect's IFC file",
    },
  };
}

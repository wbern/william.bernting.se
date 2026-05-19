import type { ProjectSlug } from "../i18n/projects";

/**
 * A diorama banner attached to a project.
 *
 * `null` means "this project has no banner" — an explicit decision rather
 * than an oversight. Keep this exhaustive: `Record<ProjectSlug, ...>` forces
 * every project to be accounted for, so renaming or adding a project breaks
 * the build until the illustration map is updated.
 */
export type Illustration =
  | { kind: "svg"; markup: string }
  | { kind: "photo"; src: string; alt: string };

export const PROJECT_ILLUSTRATIONS: Record<ProjectSlug, Illustration | null> = {
  "community-assistant": {
    kind: "svg",
    markup: `<div class="diorama">
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
        </div>`,
  },
  "pi-pai": {
    kind: "svg",
    markup: `<div class="diorama">
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
        </div>`,
  },
  "dll-decompilation": {
    kind: "svg",
    markup: `<div class="diorama">
            <svg viewBox="0 0 568 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g class="diorama-el diorama-el--back">
                    <line x1="160" y1="70" x2="224" y2="70" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.35"/>
                    <line x1="344" y1="70" x2="408" y2="70" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.35"/>
                    <polygon points="220,66 228,70 220,74" fill="var(--text-muted)" opacity="0.35"/>
                    <polygon points="404,66 412,70 404,74" fill="var(--text-muted)" opacity="0.35"/>
                </g>
                <g class="diorama-el diorama-el--left">
                    <rect x="88" y="40" width="64" height="60" rx="4" stroke="var(--text-dim)" stroke-width="2"/>
                    <rect x="88" y="40" width="64" height="60" rx="4" fill="var(--text-muted)" opacity="0.08"/>
                    <text x="104" y="66" font-family="var(--mono)" font-size="11" fill="var(--text-dim)" opacity="0.7">.dll</text>
                    <line x1="96" y1="78" x2="144" y2="78" stroke="var(--text-dim)" stroke-width="1" opacity="0.4"/>
                    <line x1="96" y1="86" x2="132" y2="86" stroke="var(--text-dim)" stroke-width="1" opacity="0.3"/>
                    <rect x="126" y="44" width="14" height="11" rx="2" stroke="var(--text-dim)" stroke-width="1.5"/>
                    <path d="M130,44 V40 A4,4 0 0 1 138,40 V44" stroke="var(--text-dim)" stroke-width="1.5" fill="none"/>
                </g>
                <g class="diorama-el diorama-el--center">
                    <rect x="244" y="28" width="80" height="84" rx="8" stroke="var(--purple)" stroke-width="2.5"/>
                    <text x="260" y="58" font-family="var(--mono)" font-size="14" fill="var(--purple)" opacity="0.8">{</text>
                    <line x1="274" y1="52" x2="304" y2="52" stroke="var(--purple)" stroke-width="1.5" opacity="0.5"/>
                    <line x1="274" y1="62" x2="298" y2="62" stroke="var(--purple)" stroke-width="1.5" opacity="0.4"/>
                    <circle cx="284" cy="82" r="8" stroke="var(--purple)" stroke-width="2" fill="none"/>
                    <line x1="290" y1="88" x2="300" y2="98" stroke="var(--purple)" stroke-width="2" stroke-linecap="round"/>
                    <text x="298" y="58" font-family="var(--mono)" font-size="14" fill="var(--purple)" opacity="0.8">}</text>
                </g>
                <g class="diorama-el diorama-el--right">
                    <rect x="416" y="40" width="64" height="60" rx="4" stroke="var(--purple-dim)" stroke-width="2"/>
                    <text x="432" y="66" font-family="var(--mono)" font-size="11" fill="var(--purple-dim)" opacity="0.7">.dll</text>
                    <line x1="424" y1="78" x2="472" y2="78" stroke="var(--purple-dim)" stroke-width="1" opacity="0.4"/>
                    <line x1="424" y1="86" x2="460" y2="86" stroke="var(--purple-dim)" stroke-width="1" opacity="0.3"/>
                    <polyline points="452,44 458,52 470,38" stroke="#50c878" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
            </svg>
        </div>`,
  },
  "legacy-chess-tool-rewrite": {
    kind: "photo",
    src: "/chess-tool.jpg",
    alt: "Legacy chess seeding tool — tournament settings dialog",
  },
  "adr-lint": {
    kind: "svg",
    markup: `<div class="diorama">
            <svg viewBox="0 0 568 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g class="diorama-el diorama-el--back">
                    <line x1="200" y1="120" x2="368" y2="120" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.2"/>
                    <line x1="200" y1="120" x2="200" y2="24" stroke="var(--text-muted)" stroke-width="1" opacity="0.15" stroke-dasharray="3 4"/>
                    <line x1="368" y1="120" x2="368" y2="24" stroke="var(--text-muted)" stroke-width="1" opacity="0.15" stroke-dasharray="3 4"/>
                </g>
                <g class="diorama-el diorama-el--left">
                    <rect x="210" y="94" width="148" height="24" rx="4" stroke="var(--purple)" stroke-width="2.5"/>
                    <rect x="210" y="94" width="148" height="24" rx="4" fill="var(--purple-glow)"/>
                    <text x="250" y="110" font-family="var(--mono)" font-size="11" fill="var(--purple)">Tests</text>
                </g>
                <g class="diorama-el diorama-el--center">
                    <rect x="218" y="66" width="132" height="24" rx="4" stroke="var(--purple)" stroke-width="2" opacity="0.7"/>
                    <rect x="218" y="66" width="132" height="24" rx="4" fill="var(--purple-glow)" opacity="0.6"/>
                    <text x="236" y="82" font-family="var(--mono)" font-size="11" fill="var(--purple)" opacity="0.8">Verification</text>
                </g>
                <g class="diorama-el diorama-el--right">
                    <rect x="228" y="38" width="112" height="24" rx="4" stroke="var(--purple-dim)" stroke-width="2" stroke-dasharray="5 3" opacity="0.6"/>
                    <text x="264" y="54" font-family="var(--mono)" font-size="11" fill="var(--purple-dim)" opacity="0.7">AI</text>
                    <path d="M346,44 Q352,40 358,44 Q364,48 370,44" stroke="var(--text-muted)" stroke-width="1" fill="none" opacity="0.4"/>
                    <path d="M346,54 Q352,50 358,54 Q364,58 370,54" stroke="var(--text-muted)" stroke-width="1" fill="none" opacity="0.3"/>
                </g>
                <g class="diorama-el diorama-el--back">
                    <text x="410" y="60" font-family="Georgia, serif" font-size="48" fill="var(--purple)" opacity="0.12">“</text>
                    <line x1="420" y1="72" x2="490" y2="72" stroke="var(--text-muted)" stroke-width="1" opacity="0.25"/>
                    <line x1="420" y1="82" x2="480" y2="82" stroke="var(--text-muted)" stroke-width="1" opacity="0.2"/>
                    <line x1="420" y1="92" x2="470" y2="92" stroke="var(--text-muted)" stroke-width="1" opacity="0.15"/>
                </g>
            </svg>
        </div>`,
  },
  "this-cv": {
    kind: "svg",
    markup: `<div class="diorama">
            <svg viewBox="0 0 568 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g class="diorama-el diorama-el--back">
                    <rect x="160" y="16" width="248" height="108" rx="8" stroke="var(--text-muted)" stroke-width="1" opacity="0.15"/>
                </g>
                <g class="diorama-el diorama-el--center">
                    <rect x="204" y="24" width="160" height="92" rx="8" stroke="var(--purple)" stroke-width="2.5"/>
                    <line x1="204" y1="40" x2="364" y2="40" stroke="var(--purple)" stroke-width="1.5" opacity="0.5"/>
                    <circle cx="216" cy="32" r="2.5" fill="var(--purple)" opacity="0.5"/>
                    <circle cx="226" cy="32" r="2.5" fill="var(--purple)" opacity="0.35"/>
                    <rect x="216" y="48" width="40" height="6" rx="2" fill="var(--purple)" opacity="0.3"/>
                    <line x1="216" y1="62" x2="352" y2="62" stroke="var(--text-muted)" stroke-width="1" opacity="0.3"/>
                    <rect x="270" y="70" width="80" height="38" rx="4" stroke="var(--purple-dim)" stroke-width="1.5" opacity="0.5"/>
                    <line x1="270" y1="78" x2="350" y2="78" stroke="var(--purple-dim)" stroke-width="1" opacity="0.3"/>
                    <rect x="278" y="82" width="20" height="3" rx="1" fill="var(--purple-dim)" opacity="0.3"/>
                    <line x1="278" y1="90" x2="342" y2="90" stroke="var(--text-muted)" stroke-width="0.5" opacity="0.3"/>
                    <rect x="308" y="94" width="34" height="12" rx="2" stroke="var(--text-muted)" stroke-width="0.5" opacity="0.25"/>
                </g>
                <g class="diorama-el diorama-el--left">
                    <polygon points="126,70 138,58 138,66 150,66 150,74 138,74 138,82" fill="var(--text-dim)" opacity="0.4"/>
                </g>
                <g class="diorama-el diorama-el--right">
                    <circle cx="440" cy="70" r="16" stroke="var(--purple-dim)" stroke-width="2" fill="none"/>
                    <text x="433" y="75" font-family="var(--mono)" font-size="12" fill="var(--purple-dim)">AI</text>
                </g>
            </svg>
        </div>`,
  },
  "tdd-command-generator": {
    kind: "svg",
    markup: `<div class="diorama">
            <svg viewBox="0 0 568 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g class="diorama-el diorama-el--back">
                    <path d="M190,70 Q240,20 290,70" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.25" fill="none"/>
                    <path d="M290,70 Q340,120 390,70" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.25" fill="none"/>
                    <path d="M390,70 Q290,140 190,70" stroke="var(--text-muted)" stroke-width="1" opacity="0.15" fill="none" stroke-dasharray="4 3"/>
                    <polygon points="192,64 186,70 194,74" fill="var(--text-muted)" opacity="0.25"/>
                </g>
                <g class="diorama-el diorama-el--left">
                    <circle cx="190" cy="70" r="22" stroke="#c84d4d" stroke-width="2.5" fill="none"/>
                    <circle cx="190" cy="70" r="22" fill="#c84d4d" opacity="0.1"/>
                    <text x="174" y="66" font-family="var(--mono)" font-size="9" fill="#c84d4d">/red</text>
                    <text x="176" y="80" font-family="var(--mono)" font-size="7" fill="var(--text-muted)" opacity="0.6">FAIL</text>
                </g>
                <g class="diorama-el diorama-el--center">
                    <circle cx="290" cy="70" r="22" stroke="#50c878" stroke-width="2.5" fill="none"/>
                    <circle cx="290" cy="70" r="22" fill="#50c878" opacity="0.1"/>
                    <text x="268" y="66" font-family="var(--mono)" font-size="9" fill="#50c878">/green</text>
                    <text x="272" y="80" font-family="var(--mono)" font-size="7" fill="var(--text-muted)" opacity="0.6">PASS</text>
                </g>
                <g class="diorama-el diorama-el--right">
                    <circle cx="390" cy="70" r="22" stroke="var(--purple)" stroke-width="2.5" fill="none"/>
                    <circle cx="390" cy="70" r="22" fill="var(--purple)" opacity="0.1"/>
                    <text x="364" y="66" font-family="var(--mono)" font-size="8" fill="var(--purple)">/refactor</text>
                    <text x="370" y="80" font-family="var(--mono)" font-size="7" fill="var(--text-muted)" opacity="0.6">CLEAN</text>
                </g>
                <g class="diorama-el diorama-el--back">
                    <text x="248" y="24" font-family="var(--mono)" font-size="10" fill="var(--text-muted)" opacity="0.4">$ npx @wbern/agent-instructions</text>
                </g>
            </svg>
        </div>`,
  },
  obscene: null,
  "cc-ping": null,
  "me-and-my-crew": null,
  "tmux-explode": null,
  "chess-reel": {
    kind: "photo",
    src: "/chess-reel.jpg",
    alt: "Chess Reel — a meme-oriented chess board",
  },
  "tdd-with-ai-presentation": {
    kind: "photo",
    src: "/tdd-presentation.jpg",
    alt: "TDD with AI — How to do your job and stop writing code",
  },
  "linkedin-conversation-analysis": null,
  "architectural-blueprint-to-3d": {
    kind: "photo",
    src: "/3d-visualization.jpg",
    alt: "Architectural Blueprint to 3D — rendered building from CAD data",
  },
  "pixi-platformer": {
    kind: "photo",
    src: "/pixi-platformer.jpg",
    alt: "Pixi Platformer — a Doodle Jump-style game built with web technology",
  },
  "knowledge-bot": null,
  "telia-se": {
    kind: "photo",
    src: "/telia-se.png",
    alt: "Telia.se — legacy migration to modern frontend",
  },
  "kendev-se": {
    kind: "photo",
    src: "/kendev.png",
    alt: "kendev.se — IT consultancy",
  },
  "sembo-se-startpage": {
    kind: "photo",
    src: "/sembo-startpage.jpg",
    alt: "Sembo.se — travel booking startpage",
  },
};

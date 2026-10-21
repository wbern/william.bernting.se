/**
 * Pure game logic for the "Stacken" merge game (slide 5), Suika style:
 * drop small fruit, two touching fruit of the same tier merge into the next
 * tier, and the tier ladder is William's skill progression. No DOM here, so
 * every rule is unit-tested in skill-ladder.test.ts.
 */

/** One fruit look per tier, smallest first. No two tiers share a look. */
export const FRUITS = [
    "cherry", "strawberry", "grape", "lemon", "orange", "apple",
    "pear", "peach", "pineapple", "melon", "watermelon",
] as const;
export type Fruit = (typeof FRUITS)[number];

export const TIER_COUNT = FRUITS.length;
export const TOP_TIER = TIER_COUNT - 1;

/** Glow, particle and progress-strip colour per tier. */
export const TIER_COLORS: readonly string[] = [
    "#e0213f", "#ff4d6d", "#9b59d0", "#f2d930", "#ff9922", "#e53935",
    "#bcd04a", "#ff9a76", "#f2c230", "#a8d870", "#3aa655",
];

/**
 * Radius per tier as a fraction of the bowl's inner width. Two fruit of
 * tier t hold a bit more area than one of t + 1 (like Suika), so merging
 * frees room, and the top fruit spans almost half the bowl.
 */
const RADIUS_FRACTION = [0.04, 0.052, 0.064, 0.077, 0.091, 0.107, 0.125, 0.144, 0.166, 0.19, 0.22];

export function radiusForTier(tier: number, bowlWidth: number): number {
    return RADIUS_FRACTION[clampTier(tier)] * bowlWidth;
}

function clampTier(tier: number): number {
    return Math.max(0, Math.min(TOP_TIER, Math.floor(tier)));
}

/**
 * The tier two touching fruit merge into, or null when they don't merge.
 * Only equal tiers merge, and the top tier is the end of the ladder.
 */
export function mergeResult(a: number, b: number): number | null {
    if (a !== b || a < 0 || a >= TOP_TIER) return null;
    return a + 1;
}

/** Points for making `tier` by a merge: triangular numbers, as in Suika (1, 3, 6, 10 ...). */
export function scoreForMerge(tier: number): number {
    const t = clampTier(tier);
    return (t * (t + 1)) / 2;
}

/** Only the small tiers are ever dropped. Weights favour the smallest. */
export const DROP_WEIGHTS: readonly number[] = [8, 6, 4, 2, 1];

/** Small, seedable PRNG (mulberry32): the same seed gives the same drop sequence. */
export function createRng(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** A weighted pick from DROP_WEIGHTS for a uniform number in [0, 1). */
export function pickDropTier(u: number, weights: readonly number[] = DROP_WEIGHTS): number {
    const total = weights.reduce((s, w) => s + w, 0);
    let x = Math.max(0, Math.min(0.999999, u)) * total;
    for (let i = 0; i < weights.length; i++) {
        x -= weights[i];
        if (x < 0) return i;
    }
    return weights.length - 1;
}

/**
 * Which tiers can be dropped, given the biggest fruit in the bowl. It starts
 * at the five smallest (cherry to orange) and slides up one step per tier
 * past apple, capped at peach. Pure Suika (always cherry to orange) needs
 * hundreds of drops to reach the top; a CV visitor should get there in a
 * few minutes.
 */
export function dropWindow(biggest: number): { lo: number; hi: number } {
    const hi = Math.max(DROP_WEIGHTS.length - 1, Math.min(7, biggest - 2));
    return { lo: hi - (DROP_WEIGHTS.length - 1), hi };
}

/**
 * The drop queue. The first drops are scripted so a newcomer gets a merge
 * almost at once, after that it's a weighted, seeded random sequence
 * inside the current drop window.
 */
export const OPENING_DROPS: readonly number[] = [0, 0, 1, 0, 2, 1];

export function createDropSequence(seed = 7): (biggest: number) => number {
    const rng = createRng(seed);
    let i = 0;
    return (biggest) => {
        if (i < OPENING_DROPS.length) return OPENING_DROPS[i++];
        return dropWindow(biggest).lo + pickDropTier(rng());
    };
}

/**
 * The opening pile: a mix of the low and middle tiers, so the slide looks
 * like a game in progress before anyone plays. Fruit of the same tier are
 * dropped far apart (and the component removes any twin that still lands
 * touching another), so nothing
 * merges by itself. `x` is a fraction of the bowl width, in drop order.
 */
export const SEED_PILE: ReadonlyArray<{ tier: number; x: number }> = [
    { tier: 5, x: 0.12 },
    { tier: 4, x: 0.86 },
    { tier: 4, x: 0.42 },
    { tier: 3, x: 0.62 },
    { tier: 3, x: 0.2 },
    { tier: 2, x: 0.3 },
    { tier: 2, x: 0.95 },
    { tier: 2, x: 0.62 },
    { tier: 1, x: 0.7 },
    { tier: 1, x: 0.05 },
    { tier: 0, x: 0.42 },
    { tier: 0, x: 0.66 },
    { tier: 0, x: 0.18 },
];

export function seedTiers(): number[] {
    return [...new Set(SEED_PILE.map((s) => s.tier))].sort((a, b) => a - b);
}

/** A fruit only counts against the danger line once it has had time to fall and settle. */
export const DANGER_GRACE_MS = 1200;
/** How long a fruit may poke above the line before the game ends. */
export const DANGER_LIMIT_MS = 2000;

export interface DangerFruit { y: number; r: number; bornAt: number }

/** True when a settled fruit's top edge is above the danger line (smaller y is higher). */
export function isOverLine(f: DangerFruit, lineY: number, now: number): boolean {
    return now - f.bornAt >= DANGER_GRACE_MS && f.y - f.r < lineY;
}

/**
 * One tick of the game-over check. `overSince` is when the bowl first went
 * over the line (null when it isn't). Dipping back under resets the clock.
 */
export function dangerStep(
    overSince: number | null,
    fruits: readonly DangerFruit[],
    lineY: number,
    now: number,
): { overSince: number | null; gameOver: boolean } {
    const over = fruits.some((f) => isOverLine(f, lineY, now));
    if (!over) return { overSince: null, gameOver: false };
    const since = overSince ?? now;
    return { overSince: since, gameOver: now - since >= DANGER_LIMIT_MS };
}

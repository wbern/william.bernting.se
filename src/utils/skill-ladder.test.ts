import { describe, it, expect } from "vitest";
import {
    FRUITS,
    TIER_COUNT,
    TOP_TIER,
    TIER_COLORS,
    radiusForTier,
    mergeResult,
    scoreForMerge,
    DROP_WEIGHTS,
    pickDropTier,
    dropWindow,
    createRng,
    createDropSequence,
    OPENING_DROPS,
    SEED_PILE,
    seedTiers,
    isOverLine,
    dangerStep,
    DANGER_GRACE_MS,
    DANGER_LIMIT_MS,
} from "./skill-ladder";

describe("skill ladder: tiers", () => {
    it("has eleven distinct fruit, one colour each", () => {
        expect(TIER_COUNT).toBe(11);
        expect(new Set(FRUITS).size).toBe(TIER_COUNT);
        expect(TIER_COLORS).toHaveLength(TIER_COUNT);
        expect(FRUITS[0]).toBe("cherry");
        expect(FRUITS[TOP_TIER]).toBe("watermelon");
    });

    it("grows strictly with the tier, and the top fruit fits the bowl", () => {
        for (let t = 1; t < TIER_COUNT; t++) {
            expect(radiusForTier(t, 600)).toBeGreaterThan(radiusForTier(t - 1, 600));
        }
        expect(radiusForTier(TOP_TIER, 600) * 2).toBeLessThan(600 / 2);
    });

    it("merging two fruit frees room: the new one has less area than both", () => {
        for (let t = 0; t < TOP_TIER; t++) {
            const r = radiusForTier(t, 1), next = radiusForTier(t + 1, 1);
            expect(next * next).toBeLessThan(2 * r * r);
        }
    });

    it("scales with the bowl and clamps out-of-range tiers", () => {
        expect(radiusForTier(3, 1000)).toBeCloseTo(radiusForTier(3, 500) * 2);
        expect(radiusForTier(-1, 600)).toBe(radiusForTier(0, 600));
        expect(radiusForTier(99, 600)).toBe(radiusForTier(TOP_TIER, 600));
    });
});

describe("skill ladder: merge rule", () => {
    it("two of the same tier become the next tier", () => {
        expect(mergeResult(0, 0)).toBe(1);
        expect(mergeResult(4, 4)).toBe(5);
        expect(mergeResult(TOP_TIER - 1, TOP_TIER - 1)).toBe(TOP_TIER);
    });

    it("different tiers never merge", () => {
        expect(mergeResult(0, 1)).toBeNull();
        expect(mergeResult(5, 3)).toBeNull();
    });

    it("the top of the ladder is the end: two watermelons stay put", () => {
        expect(mergeResult(TOP_TIER, TOP_TIER)).toBeNull();
        expect(mergeResult(-1, -1)).toBeNull();
    });

    it("scores triangular numbers for the tier made", () => {
        expect([1, 2, 3, 4, 10].map(scoreForMerge)).toEqual([1, 3, 6, 10, 55]);
    });
});

describe("skill ladder: drops", () => {
    it("picks drop tiers by weight, smallest most often", () => {
        expect(pickDropTier(0)).toBe(0);
        expect(pickDropTier(0.999)).toBe(DROP_WEIGHTS.length - 1);
        const counts = Array(DROP_WEIGHTS.length).fill(0);
        const rng = createRng(1);
        for (let i = 0; i < 5000; i++) counts[pickDropTier(rng())]++;
        for (let t = 1; t < counts.length; t++) expect(counts[t]).toBeLessThan(counts[t - 1]);
    });

    it("drops only the five smallest tiers at the start", () => {
        expect(dropWindow(0)).toEqual({ lo: 0, hi: 4 });
        expect(dropWindow(6)).toEqual({ lo: 0, hi: 4 });
    });

    it("slides the drop window up as the bowl climbs, never past peach", () => {
        expect(dropWindow(7)).toEqual({ lo: 1, hi: 5 });
        expect(dropWindow(9)).toEqual({ lo: 3, hi: 7 });
        expect(dropWindow(TOP_TIER)).toEqual({ lo: 3, hi: 7 });
    });

    it("opens with a scripted run, then a seeded random one inside the window", () => {
        const a = createDropSequence(42), b = createDropSequence(42);
        const seqA = Array.from({ length: 60 }, () => a(5));
        const seqB = Array.from({ length: 60 }, () => b(5));
        expect(seqA).toEqual(seqB);
        expect(seqA.slice(0, OPENING_DROPS.length)).toEqual([...OPENING_DROPS]);
        for (const t of seqA) expect(t).toBeGreaterThanOrEqual(0);
        for (const t of seqA) expect(t).toBeLessThanOrEqual(4);
        const late = createDropSequence(3);
        OPENING_DROPS.forEach(() => late(9));
        for (let i = 0; i < 50; i++) {
            const t = late(9);
            expect(t).toBeGreaterThanOrEqual(3);
            expect(t).toBeLessThanOrEqual(7);
        }
    });
});

describe("skill ladder: opening pile", () => {
    it("is a mix of low and middle tiers, nothing near the top", () => {
        expect(seedTiers()).toEqual([0, 1, 2, 3, 4, 5]);
        for (const s of SEED_PILE) {
            expect(s.x).toBeGreaterThanOrEqual(0);
            expect(s.x).toBeLessThanOrEqual(1);
        }
    });

    it("drops twins far apart, so they don't merge while settling", () => {
        for (const t of seedTiers()) {
            const xs = SEED_PILE.filter((s) => s.tier === t).map((s) => s.x);
            if (xs.length > 1) expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(0.2);
        }
    });
});

describe("skill ladder: game over", () => {
    const line = 100;

    it("a fruit counts against the line only once it has settled", () => {
        expect(isOverLine({ y: 90, r: 20, bornAt: 0 }, line, DANGER_GRACE_MS - 1)).toBe(false);
        expect(isOverLine({ y: 90, r: 20, bornAt: 0 }, line, DANGER_GRACE_MS)).toBe(true);
        expect(isOverLine({ y: 130, r: 20, bornAt: 0 }, line, 99_999)).toBe(false);
    });

    it("ends the game after the bowl stays over the line long enough", () => {
        const fruit = [{ y: 90, r: 20, bornAt: 0 }];
        let s = dangerStep(null, fruit, line, 5000);
        expect(s).toEqual({ overSince: 5000, gameOver: false });
        s = dangerStep(s.overSince, fruit, line, 5000 + DANGER_LIMIT_MS - 1);
        expect(s.gameOver).toBe(false);
        s = dangerStep(s.overSince, fruit, line, 5000 + DANGER_LIMIT_MS);
        expect(s.gameOver).toBe(true);
    });

    it("resets the clock when the pile drops back under the line", () => {
        const s = dangerStep(5000, [{ y: 200, r: 20, bornAt: 0 }], line, 9000);
        expect(s).toEqual({ overSince: null, gameOver: false });
    });
});

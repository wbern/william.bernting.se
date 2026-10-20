import { describe, it, expect } from "vitest";
import { mod, pickLanding, nextInTrack } from "./roller";

describe("mod", () => {
  it("wraps negatives", () => {
    expect(mod(-1, 5)).toBe(4);
    expect(mod(7, 5)).toBe(2);
  });
});

describe("pickLanding", () => {
  it("keeps the natural slot when it is allowed", () => {
    expect(pickLanding(23, 0, 11)).toBe(23);
  });

  it("never lands on the start slot", () => {
    const landed = pickLanding(22, 0, 11); // 22 mod 11 === 0
    expect(mod(landed, 11)).not.toBe(0);
    expect(Math.abs(landed - 22)).toBe(1);
  });

  it("snaps to the nearest target", () => {
    const targets = new Set([0, 1, 2, 3]);
    expect(mod(pickLanding(16, 9, 11, targets), 11)).toBe(3); // 16 → 5, nearest target is 3 (−2) vs 0 (+6)
    expect(pickLanding(16, 9, 11, targets)).toBe(14);
    expect(pickLanding(20, 9, 11, targets)).toBe(22); // 20 → 9, 22 → 0
  });

  it("skips a target that equals the start slot", () => {
    const targets = new Set([2]);
    const landed = pickLanding(13, 5, 11, targets); // 13 → 2
    expect(mod(landed, 11)).toBe(2);
    const blocked = pickLanding(13, 2, 11, new Set([2, 4]));
    expect(mod(blocked, 11)).toBe(4);
  });
});

describe("nextInTrack", () => {
  const tracks = ["legacy", "build", "legacy", "teach", "lab"];
  it("finds the next item in a track, wrapping", () => {
    expect(nextInTrack(0, tracks, "legacy")).toBe(2);
    expect(nextInTrack(2, tracks, "legacy")).toBe(0);
    expect(nextInTrack(4, tracks, "build")).toBe(1);
  });
  it("returns the item itself when it is the only one in its track", () => {
    expect(nextInTrack(3, tracks, "teach")).toBe(3);
  });
  it("returns -1 for an unknown track", () => {
    expect(nextInTrack(0, tracks, "nope")).toBe(-1);
  });
});

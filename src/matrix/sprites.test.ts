import { describe, it, expect } from "vitest";
import {
  quantize,
  quantizeBrightness,
  quantizeColorProgress,
  buildCharSet,
  rainRow,
  headRow,
  BRIGHTNESS_LEVELS,
  COLOR_PROGRESS_LEVELS,
  TOTAL_VARIANT_ROWS,
} from "./sprites";

describe("quantize", () => {
  it("snaps to the nearest level", () => {
    expect(quantize(0.1, BRIGHTNESS_LEVELS)).toBe(0); // 0.15
    expect(quantize(0.9, BRIGHTNESS_LEVELS)).toBe(4); // 1.0
    expect(quantize(0.5, BRIGHTNESS_LEVELS)).toBe(2); // 0.55
  });

  it("snaps exact matches", () => {
    expect(quantize(1.0, BRIGHTNESS_LEVELS)).toBe(4);
    expect(quantize(0.15, BRIGHTNESS_LEVELS)).toBe(0);
  });

  it("works for color progress levels", () => {
    expect(quantize(0, COLOR_PROGRESS_LEVELS)).toBe(0);
    expect(quantize(0.3, COLOR_PROGRESS_LEVELS)).toBe(1); // 0.5
    expect(quantize(0.8, COLOR_PROGRESS_LEVELS)).toBe(2); // 1.0
  });
});

describe("quantizeBrightness / quantizeColorProgress (LUT)", () => {
  it("maps low brightness to low index and high to high index", () => {
    expect(quantizeBrightness(0.1)).toBe(0);
    expect(quantizeBrightness(0.5)).toBeGreaterThanOrEqual(1);
    expect(quantizeBrightness(1.0)).toBe(BRIGHTNESS_LEVELS.length - 1);
  });

  it("maps color progress endpoints correctly", () => {
    expect(quantizeColorProgress(0)).toBe(0);
    expect(quantizeColorProgress(1.0)).toBe(COLOR_PROGRESS_LEVELS.length - 1);
  });

  it("produces valid indices for all inputs in [0,1]", () => {
    for (let i = 0; i <= 100; i++) {
      const v = i / 100;
      expect(quantizeBrightness(v)).toBeGreaterThanOrEqual(0);
      expect(quantizeBrightness(v)).toBeLessThan(BRIGHTNESS_LEVELS.length);
      expect(quantizeColorProgress(v)).toBeGreaterThanOrEqual(0);
      expect(quantizeColorProgress(v)).toBeLessThan(COLOR_PROGRESS_LEVELS.length);
    }
  });
});

describe("buildCharSet", () => {
  it("includes Katakana and Latin characters", () => {
    const chars = buildCharSet([]);
    expect(chars.length).toBeGreaterThanOrEqual(86 + 36); // katakana + latin+digits
    expect(chars).toContain("A");
    expect(chars).toContain("0");
  });

  it("adds extra characters from trait words without duplicates", () => {
    const chars = buildCharSet(["Hello"]);
    expect(chars).toContain("H");
    expect(chars).toContain("e");
    expect(chars).toContain("l");
    expect(chars).toContain("o");
    // H is already in LATIN, should not be duplicated
    expect(chars.filter((c) => c === "H")).toHaveLength(1);
  });

  it("includes Swedish characters from traits", () => {
    const chars = buildCharSet(["Felsökare"]);
    expect(chars).toContain("ö");
  });
});

describe("rainRow / headRow", () => {
  it("maps brightness and colorProgress indices to unique rows", () => {
    const rows = new Set<number>();
    for (let b = 0; b < BRIGHTNESS_LEVELS.length; b++) {
      for (let cp = 0; cp < COLOR_PROGRESS_LEVELS.length; cp++) {
        rows.add(rainRow(b, cp));
      }
    }
    // All rain rows should be unique
    expect(rows.size).toBe(BRIGHTNESS_LEVELS.length * COLOR_PROGRESS_LEVELS.length);
  });

  it("head rows don't overlap rain rows", () => {
    const rainRows = new Set<number>();
    for (let b = 0; b < BRIGHTNESS_LEVELS.length; b++) {
      for (let cp = 0; cp < COLOR_PROGRESS_LEVELS.length; cp++) {
        rainRows.add(rainRow(b, cp));
      }
    }
    for (let b = 0; b < BRIGHTNESS_LEVELS.length; b++) {
      expect(rainRows.has(headRow(b))).toBe(false);
    }
  });

  it("total variant rows matches constant", () => {
    expect(TOTAL_VARIANT_ROWS).toBe(
      BRIGHTNESS_LEVELS.length * COLOR_PROGRESS_LEVELS.length +
        BRIGHTNESS_LEVELS.length,
    );
  });
});

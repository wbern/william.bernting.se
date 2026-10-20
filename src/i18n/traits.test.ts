import { describe, it, expect } from "vitest";
import { getTraitRows, traitRowEntries } from "./traits";
import { trackEntries } from "./contact";

describe("traits", () => {
  it("has one row per contact track, in the same order", () => {
    expect(traitRowEntries.map((r) => r.track)).toEqual(trackEntries.map((t) => t.id));
  });

  it("returns the same rows for each locale", () => {
    const sv = getTraitRows("sv");
    const en = getTraitRows("en");
    expect(sv).toHaveLength(traitRowEntries.length);
    expect(en).toHaveLength(traitRowEntries.length);
    for (let i = 0; i < sv.length; i++) {
      expect(sv[i].track).toBe(en[i].track);
      expect(sv[i].speed).toBe(en[i].speed);
      expect(sv[i].size).toBe(en[i].size);
      expect(sv[i].reverse).toBe(en[i].reverse);
      expect(sv[i].color).toBe(en[i].color);
      // same concept in the same slot in both languages
      expect(sv[i].items.map((t) => t.id)).toEqual(en[i].items.map((t) => t.id));
    }
  });

  it("row colour comes from the matching contact track", () => {
    for (const row of getTraitRows("sv")) {
      expect(row.color).toBe(trackEntries.find((t) => t.id === row.track)!.color);
    }
  });

  it("trait ids are unique", () => {
    const ids = traitRowEntries.flatMap((r) => r.items.map((t) => t.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every trait has a short label and a one-sentence caption in both locales", () => {
    for (const entry of traitRowEntries) {
      expect(entry.items.length).toBeGreaterThanOrEqual(3);
      for (const item of entry.items) {
        for (const lang of ["sv", "en"] as const) {
          const { label, caption } = item[lang];
          expect(label.length).toBeGreaterThan(0);
          expect(label.length).toBeLessThanOrEqual(28);
          expect(caption).toMatch(/[.!?]$/);
          expect(caption.length).toBeLessThanOrEqual(80);
        }
      }
    }
  });
});

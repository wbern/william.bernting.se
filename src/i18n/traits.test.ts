import { describe, it, expect } from "vitest";
import { getTraitRows, traitRowEntries } from "./traits";

describe("traits", () => {
  it("has 5 trait rows", () => {
    expect(traitRowEntries).toHaveLength(5);
  });

  it("returns 5 rows for each locale", () => {
    expect(getTraitRows("sv")).toHaveLength(5);
    expect(getTraitRows("en")).toHaveLength(5);
  });

  it("each entry has both sv and en arrays of same length", () => {
    for (const entry of traitRowEntries) {
      expect(entry.sv.length).toBe(entry.en.length);
      expect(entry.sv.length).toBeGreaterThan(0);
    }
  });

  it("preserves style properties", () => {
    const sv = getTraitRows("sv");
    const en = getTraitRows("en");
    for (let i = 0; i < sv.length; i++) {
      expect(sv[i].speed).toBe(en[i].speed);
      expect(sv[i].size).toBe(en[i].size);
      expect(sv[i].style).toBe(en[i].style);
    }
  });
});

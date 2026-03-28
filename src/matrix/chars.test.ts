import { describe, it, expect } from "vitest";
import { randomChar, isKatakana } from "./chars";

describe("randomChar", () => {
  it("returns a single character", () => {
    const ch = randomChar();
    expect(ch).toHaveLength(1);
  });

  it("produces a mix of katakana and latin over many calls", () => {
    let katakanaCount = 0;
    let latinCount = 0;
    for (let i = 0; i < 200; i++) {
      const ch = randomChar();
      if (isKatakana(ch)) katakanaCount++;
      else latinCount++;
    }
    expect(katakanaCount).toBeGreaterThan(0);
    expect(latinCount).toBeGreaterThan(0);
  });
});

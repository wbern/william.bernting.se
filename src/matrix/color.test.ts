import { describe, it, expect } from "vitest";
import { lerpRainColor } from "./color";

describe("lerpRainColor", () => {
  it("returns green at progress 0", () => {
    const color = lerpRainColor(0, 1);
    expect(color).toBe("hsl(120, 100%, 50%)");
  });

  it("returns purple at progress 1", () => {
    const color = lerpRainColor(1, 1);
    expect(color).toBe("hsl(280, 100%, 60%)");
  });

  it("interpolates hue and lightness at midpoint", () => {
    const color = lerpRainColor(0.5, 1);
    expect(color).toBe("hsl(200, 100%, 55%)");
  });

  it("applies brightness to the alpha channel", () => {
    const dim = lerpRainColor(0, 0.3);
    expect(dim).toBe("hsla(120, 100%, 50%, 0.3)");
  });

  it("uses full opacity for brightness 1", () => {
    const full = lerpRainColor(0, 1);
    // No alpha needed at full brightness
    expect(full).not.toContain("hsla");
  });
});

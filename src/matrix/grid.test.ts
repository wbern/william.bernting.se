import { describe, it, expect } from "vitest";
import { createGrid } from "./grid";

describe("createGrid", () => {
  it("calculates columns and rows from canvas dimensions and font size", () => {
    const grid = createGrid(800, 600, 16);

    expect(grid.cols).toBe(50); // 800 / 16
    expect(grid.rows).toBe(37); // floor(600 / 16)
    expect(grid.fontSize).toBe(16);
  });
});

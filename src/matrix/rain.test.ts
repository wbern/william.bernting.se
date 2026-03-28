import { describe, it, expect } from "vitest";
import { createColumns, tickColumn } from "./rain";

describe("createColumns", () => {
  it("creates one column per grid column with cells matching grid rows", () => {
    const columns = createColumns(4, 3);

    expect(columns).toHaveLength(4);
    for (const col of columns) {
      expect(col.cells).toHaveLength(3);
    }
  });

  it("initializes each column with varying speed and trail length", () => {
    const columns = createColumns(20, 10);

    const speeds = columns.map((c) => c.speed);
    const trails = columns.map((c) => c.trailLength);

    for (const s of speeds) {
      expect(s).toBeGreaterThanOrEqual(1);
      expect(s).toBeLessThanOrEqual(3);
    }
    for (const t of trails) {
      expect(t).toBeGreaterThanOrEqual(4);
      expect(t).toBeLessThanOrEqual(15);
    }
    // With 20 columns, speeds should not all be identical
    expect(new Set(speeds).size).toBeGreaterThan(1);
  });
});

describe("tickColumn", () => {
  it("advances the head position and lights up the head cell", () => {
    const columns = createColumns(1, 10);
    const col = columns[0];
    col.headY = 0;
    col.speed = 2;
    col.trailLength = 3;

    tickColumn(col, 500);

    expect(col.headY).toBe(1);
    expect(col.cells[1].brightness).toBe(1);
    expect(col.cells[1].char).not.toBe("");
  });

  it("decays brightness once cells fall outside the trail window", () => {
    const columns = createColumns(1, 20);
    const col = columns[0];
    col.headY = 0;
    col.speed = 10; // fast — 5 rows per 500ms tick
    col.trailLength = 3;

    // Tick once: head moves to row 5, lights up rows 1-5
    tickColumn(col, 500);
    expect(col.cells[5].brightness).toBe(1);
    // Row 1 is outside trail (distance=4 > trailLength=3), should start fading
    expect(col.cells[1].brightness).toBeLessThan(1);

    // Tick again: head moves to row 10
    tickColumn(col, 500);
    // Row 1 should have faded further
    expect(col.cells[1].brightness).toBeLessThan(0.5);
    // Row 10 (new head) should be bright
    expect(col.cells[10].brightness).toBe(1);
  });

  it("resets column when head passes bottom plus trail length", () => {
    const columns = createColumns(1, 5);
    const col = columns[0];
    col.headY = 8;
    col.speed = 3;
    col.trailLength = 2;

    // headRow=8, trailLength=2, rows=5 => 8-2=6 > 5, should reset
    tickColumn(col, 500);

    // After reset, headY should be at or above the top (negative or zero)
    expect(col.headY).toBeLessThanOrEqual(0);
  });
});

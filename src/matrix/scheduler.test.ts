import { describe, it, expect } from "vitest";
import { createScheduler } from "./scheduler";

describe("createScheduler", () => {
  it("schedules words from the trait list at intervals that fit the grid", () => {
    const traits = ["Ship with AI", "Debugger", "Deep Diver"];
    const scheduler = createScheduler(traits, 40, 20);

    const event = scheduler.next(0);

    expect(event).not.toBeNull();
    expect(traits).toContain(event!.word);
    expect(event!.colStart + event!.word.length).toBeLessThanOrEqual(40);
    expect(event!.row).toBeGreaterThanOrEqual(4);
    expect(event!.row).toBeLessThanOrEqual(16); // middle third of 20 rows
  });

  it("does not schedule a word that exceeds grid width", () => {
    const traits = ["This Is A Very Long Trait That Will Not Fit"];
    const scheduler = createScheduler(traits, 10, 20);

    const event = scheduler.next(0);

    expect(event).toBeNull();
  });

  it("cycles through all traits before repeating", () => {
    const traits = ["A", "B", "C"];
    const scheduler = createScheduler(traits, 20, 10);

    const seen = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const event = scheduler.next(i * 4000);
      if (event) seen.add(event.word);
    }

    expect(seen.size).toBe(3);
  });
});

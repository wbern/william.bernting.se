import { describe, it, expect } from "vitest";
import {
  createWordEvent,
  tickWordEvent,
  type WordState,
} from "./words";
import { createColumns } from "./rain";

describe("createWordEvent", () => {
  it("creates a word event with pending state at the specified position", () => {
    const event = createWordEvent("HELLO", 5, 10, 3000);

    expect(event.word).toBe("HELLO");
    expect(event.chars).toEqual(["H", "E", "L", "L", "O"]);
    expect(event.row).toBe(5);
    expect(event.colStart).toBe(10);
    expect(event.triggerTime).toBe(3000);
    expect(event.state).toBe("pending" satisfies WordState);
  });
});

describe("tickWordEvent", () => {
  it("transitions from pending to materializing at trigger time", () => {
    const columns = createColumns(20, 10);
    const event = createWordEvent("HI", 5, 2, 1000);

    tickWordEvent(event, 999, columns);
    expect(event.state).toBe("pending");

    tickWordEvent(event, 1000, columns);
    expect(event.state).toBe("materializing");
  });

  it("locks cells during materialization and shows final chars when locked", () => {
    const columns = createColumns(20, 10);
    const event = createWordEvent("AB", 3, 5, 0);

    // Trigger materialization
    tickWordEvent(event, 0, columns);
    expect(event.state).toBe("materializing");
    // First cell should be locked
    expect(columns[5].cells[3].locked).toBe(true);
    expect(columns[5].cells[3].brightness).toBe(1);

    // Advance enough for all chars to settle (2 chars * 80ms stagger + 160ms scramble)
    tickWordEvent(event, 400, columns);
    expect(event.state).toBe("locked");
    expect(columns[5].cells[3].char).toBe("A");
    expect(columns[6].cells[3].char).toBe("B");
  });

  it("transitions color to purple during lock phase", () => {
    const columns = createColumns(20, 10);
    const event = createWordEvent("X", 3, 5, 0);

    // Get to locked state
    tickWordEvent(event, 0, columns);
    tickWordEvent(event, 300, columns);
    expect(event.state).toBe("locked");

    // Advance halfway through color transition (500ms total)
    tickWordEvent(event, 550, columns);
    expect(event.colorProgress).toBeGreaterThan(0.4);
    expect(event.colorProgress).toBeLessThan(0.6);
    expect(columns[5].cells[3].colorProgress).toBe(event.colorProgress);
  });

  it("dissolves and reaches done state after lock duration", () => {
    const columns = createColumns(20, 10);
    const event = createWordEvent("A", 3, 5, 0);

    // Fast forward through all phases
    tickWordEvent(event, 0, columns);
    tickWordEvent(event, 300, columns); // locked
    expect(event.state).toBe("locked");

    tickWordEvent(event, 1900, columns); // past lock duration (1500ms)
    expect(event.state).toBe("dissolving");

    // Advance well past dissolve
    tickWordEvent(event, 3000, columns);
    expect(event.state).toBe("done");
    expect(columns[5].cells[3].locked).toBe(false);
  });
});

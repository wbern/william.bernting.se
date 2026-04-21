import { describe, it, expect } from "vitest";
import {
  slideRowLeft,
  move,
  isGameOver,
  spawnTile,
  getStatForTile,
} from "./merge-game";

describe("slideRowLeft", () => {
  it("compacts empty cells to the right", () => {
    expect(slideRowLeft([0, 3, 0, 6])).toEqual([3, 6, 0, 0]);
  });

  it("merges a pair of equal adjacent tiles into their double", () => {
    expect(slideRowLeft([3, 3, 0, 0])).toEqual([6, 0, 0, 0]);
  });

  it("merges only the leftmost pair when three equal tiles line up", () => {
    expect(slideRowLeft([3, 3, 3, 0])).toEqual([6, 3, 0, 0]);
  });

  it("does not chain a freshly-merged tile into another merge", () => {
    expect(slideRowLeft([3, 3, 6, 0])).toEqual([6, 6, 0, 0]);
  });
});

describe("move", () => {
  it("flags moved=true when any tile shifts", () => {
    const board = [
      [0, 3, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(move(board, "left").moved).toBe(true);
  });

  it("flags moved=false when the board does not change", () => {
    const board = [
      [6, 3, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(move(board, "left").moved).toBe(false);
  });

  it("reports the sum of merged tile values as gained score", () => {
    const board = [
      [3, 3, 6, 6],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(move(board, "left").gained).toBe(18);
  });

  it("slides every column down when direction is down", () => {
    const board = [
      [12, 0, 6, 0],
      [0, 0, 0, 0],
      [3, 0, 6, 0],
      [3, 0, 0, 0],
    ];
    expect(move(board, "down").board).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [12, 0, 0, 0],
      [6, 0, 12, 0],
    ]);
  });

  it("slides every column up when direction is up", () => {
    const board = [
      [0, 0, 0, 0],
      [3, 0, 6, 0],
      [3, 0, 0, 0],
      [0, 0, 6, 12],
    ];
    expect(move(board, "up").board).toEqual([
      [6, 0, 12, 12],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
  });

  it("slides every row right when direction is right", () => {
    const board = [
      [3, 0, 3, 0],
      [0, 0, 0, 0],
      [0, 6, 0, 6],
      [12, 0, 0, 0],
    ];
    expect(move(board, "right").board).toEqual([
      [0, 0, 0, 6],
      [0, 0, 0, 0],
      [0, 0, 0, 12],
      [0, 0, 0, 12],
    ]);
  });

  it("slides every row left when direction is left", () => {
    const board = [
      [0, 3, 0, 3],
      [0, 0, 0, 0],
      [6, 0, 6, 0],
      [0, 0, 0, 12],
    ];
    expect(move(board, "left").board).toEqual([
      [6, 0, 0, 0],
      [0, 0, 0, 0],
      [12, 0, 0, 0],
      [12, 0, 0, 0],
    ]);
  });
});

describe("getStatForTile", () => {
  it("maps tile 48 to the prototypes stat", () => {
    expect(getStatForTile(48)).toBe("prototypes");
  });

  it("returns undefined for tile values that do not represent a stat", () => {
    expect(getStatForTile(6)).toBeUndefined();
  });
});

describe("spawnTile", () => {
  it("places a tile of value 3 in an empty cell chosen by the random source", () => {
    const board = [
      [3, 0, 3, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    // 14 empty cells; rng returns 0 → pick the first (row 0, col 1)
    const result = spawnTile(board, () => 0);
    expect(result[0][1]).toBe(3);
  });
});

describe("isGameOver", () => {
  it("is true when the board is full and no neighbors match", () => {
    const board = [
      [3, 6, 12, 24],
      [6, 12, 24, 48],
      [12, 24, 48, 96],
      [24, 48, 96, 192],
    ];
    expect(isGameOver(board)).toBe(true);
  });

  it("is false when a vertical pair could still merge", () => {
    const board = [
      [3, 6, 12, 24],
      [3, 12, 24, 48],
      [12, 24, 48, 96],
      [24, 48, 96, 192],
    ];
    expect(isGameOver(board)).toBe(false);
  });

  it("is false when a horizontal pair could still merge", () => {
    const board = [
      [3, 3, 12, 24],
      [6, 12, 24, 48],
      [12, 24, 48, 96],
      [24, 48, 96, 192],
    ];
    expect(isGameOver(board)).toBe(false);
  });

  it("is false while any cell is empty", () => {
    const board = [
      [3, 6, 12, 24],
      [6, 12, 24, 48],
      [12, 24, 48, 96],
      [24, 48, 96, 0],
    ];
    expect(isGameOver(board)).toBe(false);
  });
});

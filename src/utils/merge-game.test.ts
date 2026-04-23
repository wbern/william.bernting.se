import { describe, it, expect } from "vitest";
import {
  mergeTilesAt,
  isGameOver,
  spawnTile,
  getStatForTile,
  hasValidMerge,
} from "./merge-game";

describe("mergeTilesAt", () => {
  it("doubles the destination tile and empties the source when two adjacent equal tiles merge", () => {
    const board = [
      [3, 3, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = mergeTilesAt(board, { row: 0, col: 0 }, { row: 0, col: 1 });
    expect(result.merged).toBe(true);
    expect(result.board[0][0]).toBe(0);
    expect(result.board[0][1]).toBe(6);
    expect(result.gained).toBe(6);
  });

  it("refuses to merge two adjacent tiles with different values", () => {
    const board = [
      [3, 6, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = mergeTilesAt(board, { row: 0, col: 0 }, { row: 0, col: 1 });
    expect(result.merged).toBe(false);
    expect(result.board).toEqual(board);
  });

  it("merges two equal tiles even when they are not adjacent", () => {
    const board = [
      [3, 0, 0, 3],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = mergeTilesAt(board, { row: 0, col: 0 }, { row: 0, col: 3 });
    expect(result.merged).toBe(true);
    expect(result.board[0][0]).toBe(0);
    expect(result.board[0][3]).toBe(6);
    expect(result.gained).toBe(6);
  });

  it("refuses to merge a tile onto itself", () => {
    const board = [
      [3, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = mergeTilesAt(board, { row: 0, col: 0 }, { row: 0, col: 0 });
    expect(result.merged).toBe(false);
  });
});

describe("getStatForTile", () => {
  it("maps tile 48 to the prototypes stat", () => {
    expect(getStatForTile(48)).toBe("prototypes");
  });

  it("maps tile 6 to the recruited stat", () => {
    expect(getStatForTile(6)).toBe("recruited");
  });

  it("maps tile 96 to the tdd stat", () => {
    expect(getStatForTile(96)).toBe("tdd");
  });

  it("returns undefined for tile values that do not represent a stat", () => {
    expect(getStatForTile(3072)).toBeUndefined();
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

describe("hasValidMerge", () => {
  it("is true when two adjacent tiles share a value", () => {
    const board = [
      [3, 0, 0, 0],
      [3, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(hasValidMerge(board)).toBe(true);
  });

  it("is true when two equal tiles exist anywhere on the board, even non-adjacent", () => {
    const board = [
      [3, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 3],
    ];
    expect(hasValidMerge(board)).toBe(true);
  });

  it("is false when every tile has a unique value", () => {
    const board = [
      [3, 6, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 12, 0],
      [0, 0, 0, 24],
    ];
    expect(hasValidMerge(board)).toBe(false);
  });
});

describe("isGameOver", () => {
  it("is false whenever any two tiles share a value, even non-adjacent", () => {
    const board = [
      [3, 6, 12, 24],
      [6, 12, 24, 48],
      [12, 24, 48, 96],
      [24, 48, 96, 192],
    ];
    expect(isGameOver(board)).toBe(false);
  });

  it("is true when the board is full with no duplicate values", () => {
    const board = [
      [3, 6, 12, 24],
      [48, 96, 192, 384],
      [768, 1536, 3072, 6144],
      [12288, 24576, 49152, 98304],
    ];
    expect(isGameOver(board)).toBe(true);
  });

  it("is true when empty cells exist but no adjacent tiles match", () => {
    const board = [
      [3, 6, 12, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(isGameOver(board)).toBe(true);
  });
});

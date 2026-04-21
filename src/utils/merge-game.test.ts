import { describe, it, expect } from "vitest";
import {
  mergeTilesAt,
  isGameOver,
  spawnTile,
  getStatForTile,
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

  it("refuses to merge tiles that are not orthogonally adjacent", () => {
    const board = [
      [3, 0, 3, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = mergeTilesAt(board, { row: 0, col: 0 }, { row: 0, col: 2 });
    expect(result.merged).toBe(false);
    expect(result.board).toEqual(board);
    expect(result.gained).toBe(0);
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

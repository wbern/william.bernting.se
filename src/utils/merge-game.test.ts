import { describe, it, expect } from "vitest";
import {
  mergeTilesAt,
  isGameOver,
  spawnTile,
  spawnNext,
  spawnRandomMilestone,
  seedBoard,
  getStatForTile,
  hasValidMerge,
  nextSpawnPlan,
} from "./merge-game";
import type { Board } from "./merge-game";

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

  it("explodes two 12288 tiles into a fresh starter instead of producing a no-stat 24576", () => {
    const board = [
      [12288, 12288, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = mergeTilesAt(board, { row: 0, col: 0 }, { row: 0, col: 1 });
    expect(result.merged).toBe(true);
    expect(result.exploded).toBe(true);
    expect(result.board[0][0]).toBe(0);
    expect(result.board[0][1]).toBe(3);
    expect(result.gained).toBe(24576);
  });
});

describe("getStatForTile", () => {
  it("maps tile 48 to the prototypes stat", () => {
    expect(getStatForTile(48)).toBe("prototypes");
  });

  it("maps tile 6 to the recruited stat", () => {
    expect(getStatForTile(6)).toBe("recruited");
  });

  it("maps tile 96 to the speaking stat", () => {
    expect(getStatForTile(96)).toBe("speaking");
  });

  it("maps tile 3072 to the linkedin stat", () => {
    expect(getStatForTile(3072)).toBe("linkedin");
  });

  it("maps tile 12288 to the messages stat", () => {
    expect(getStatForTile(12288)).toBe("messages");
  });

  it("returns undefined for tile values that do not represent a stat", () => {
    expect(getStatForTile(4)).toBeUndefined();
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

describe("spawnRandomMilestone", () => {
  it("places a milestone-valued tile (not 3) in an empty cell", () => {
    const board: Board = [
      [3, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = spawnRandomMilestone(board, () => 0);
    // Find the newly added tile
    let added: number | null = null;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (result[r][c] !== 0 && result[r][c] !== board[r][c]) {
          added = result[r][c];
        }
      }
    }
    expect(added).not.toBeNull();
    expect(added).not.toBe(3);
    // Must be one of the milestone values
    expect([6, 12, 24, 48, 96, 192, 384, 768, 1536, 6144]).toContain(added);
  });

  it("produces varied values across multiple calls", () => {
    const board: Board = [
      [3, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    // Stepped pseudo-random: should pick different indices
    const values = new Set<number>();
    for (let i = 0; i < 20; i++) {
      let n = 0;
      const rng = () => (n++ * 0.137 + i * 0.31) % 1;
      const result = spawnRandomMilestone(board, rng);
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (result[r][c] !== board[r][c] && result[r][c] !== 0) {
            values.add(result[r][c]);
          }
        }
      }
    }
    // With 10 possible milestones and 20 trials, we should see at least 3 different values
    expect(values.size).toBeGreaterThanOrEqual(3);
  });
});

describe("nextSpawnPlan", () => {
  it("spawns 2 tiles per merge while the board is sparse", () => {
    const sparse: Board = [
      [3, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const plan = nextSpawnPlan(sparse, "active");
    expect(plan.count).toBe(2);
    expect(plan.mode).toBe("active");
  });

  it("switches to withhold mode and stops spawning once the board is crowded", () => {
    const crowded: Board = [
      [3, 6, 12, 24],
      [48, 96, 192, 384],
      [3, 6, 12, 24],
      [0, 0, 0, 0],
    ];
    const plan = nextSpawnPlan(crowded, "active");
    expect(plan.count).toBe(0);
    expect(plan.mode).toBe("withhold");
  });

  it("stays in withhold while the board is still crowded", () => {
    const stillCrowded: Board = [
      [3, 6, 12, 24],
      [48, 96, 192, 384],
      [3, 6, 12, 0],
      [0, 0, 0, 0],
    ];
    const plan = nextSpawnPlan(stillCrowded, "withhold");
    expect(plan.count).toBe(0);
    expect(plan.mode).toBe("withhold");
  });

  it("resumes spawning 2 once the board has cleared to the low threshold", () => {
    const cleared: Board = [
      [3, 6, 12, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const plan = nextSpawnPlan(cleared, "withhold");
    expect(plan.count).toBe(2);
    expect(plan.mode).toBe("active");
  });
});

describe("spawnNext", () => {
  it("spawns a tile matching an existing tile value in an adjacent empty cell", () => {
    const board = [
      [0, 0, 0, 0],
      [0, 6, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = spawnNext(board, () => 0);
    const neighbors: Array<[number, number]> = [[0, 1], [1, 0], [1, 2], [2, 1]];
    const hits = neighbors.filter(([r, c]) => result[r][c] === 6);
    expect(hits).toHaveLength(1);
  });

  it("creates an immediate merge opportunity whenever any empty cell is adjacent to an existing tile", () => {
    // On a non-empty board with empties adjacent to existing tiles,
    // the new tile must always pair with one of its neighbors.
    const boards: Board[] = [
      [[3, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[6, 0, 12, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 24], [0, 0, 0, 0], [0, 0, 0, 0], [48, 0, 0, 0]],
    ];
    for (const board of boards) {
      for (let seed = 0; seed < 10; seed++) {
        const rng = () => (seed * 0.137) % 1;
        const result = spawnNext(board, rng);
        expect(hasValidMerge(result), `seed=${seed} board=${JSON.stringify(board)}`).toBe(true);
      }
    }
  });

  it("spawns a 3 on an empty board (fallback, no existing tile to match)", () => {
    const board: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = spawnNext(board, () => 0);
    expect(result[0][0]).toBe(3);
  });

  it("surfaces every milestone stat within 60 merges when the player greedily merges lowest pairs", () => {
    // Deterministic rng so the test is repeatable
    let s = 1;
    const rng = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    let board = seedBoard(6, rng);
    const seen = new Set<string>();
    for (let step = 0; step < 60; step++) {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const stat = getStatForTile(board[r][c]);
          if (stat) seen.add(stat);
        }
      }
      // Find any mergeable pair (lowest value first) and merge it
      const byValue = new Map<number, Array<[number, number]>>();
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const v = board[r][c];
          if (v === 0) continue;
          const list = byValue.get(v) ?? [];
          list.push([r, c]);
          byValue.set(v, list);
        }
      }
      const sorted = [...byValue.entries()].sort(([a], [b]) => a - b);
      let merged = false;
      for (const [, positions] of sorted) {
        if (positions.length < 2) continue;
        const [fromPos, toPos] = positions;
        const result = mergeTilesAt(
          board,
          { row: fromPos[0], col: fromPos[1] },
          { row: toPos[0], col: toPos[1] },
        );
        if (result.merged) {
          board = spawnNext(result.board, rng);
          merged = true;
          break;
        }
      }
      if (!merged) break;
    }
    const allStats = ["recruited", "teams", "experience", "prototypes", "speaking", "managed", "bugfix", "clients", "coderate", "linkedin", "users"];
    const missing = allStats.filter((s) => !seen.has(s));
    expect(missing, `missing stats after 60 merges: ${missing.join(", ")}`).toEqual([]);
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

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
  ensureMergeAvailable,
  findHintPair,
  MAX_STAT_TILE,
  STAT_LADDER,
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

  it("explodes two top tiles into a fresh starter instead of producing a no-stat tile", () => {
    const board = [
      [768, 768, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = mergeTilesAt(board, { row: 0, col: 0 }, { row: 0, col: 1 });
    expect(result.merged).toBe(true);
    expect(result.exploded).toBe(true);
    expect(result.won).toBe(false);
    expect(result.board[0][0]).toBe(0);
    expect(result.board[0][1]).toBe(3);
    expect(result.gained).toBe(1536);
  });

  it("wins when a merge forms the top tile, keeping the tile on the board", () => {
    const board = [
      [384, 0, 0, 384],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = mergeTilesAt(board, { row: 0, col: 0 }, { row: 0, col: 3 });
    expect(result.won).toBe(true);
    expect(result.exploded).toBe(false);
    expect(result.value).toBe(MAX_STAT_TILE);
    expect(result.board[0][3]).toBe(768);
  });

  it("reports the produced value so the UI can reveal the matching stat", () => {
    const board = [
      [24, 24, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = mergeTilesAt(board, { row: 0, col: 0 }, { row: 0, col: 1 });
    expect(result.value).toBe(48);
    expect(result.won).toBe(false);
  });
});

describe("STAT_LADDER", () => {
  it("has a stat on every doubling from 6 up to the top tile, with no gaps", () => {
    const tiles = STAT_LADDER.map((s) => s.tile);
    expect(tiles[0]).toBe(6);
    expect(tiles[tiles.length - 1]).toBe(MAX_STAT_TILE);
    for (let i = 1; i < tiles.length; i++) expect(tiles[i]).toBe(tiles[i - 1] * 2);
    for (const t of tiles) expect(getStatForTile(t)).toBeDefined();
  });

  it("uses each stat key once", () => {
    const keys = STAT_LADDER.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("getStatForTile", () => {
  it("maps tile 6 to the recruited stat", () => {
    expect(getStatForTile(6)).toBe("recruited");
  });

  it("maps tile 48 to the teams stat", () => {
    expect(getStatForTile(48)).toBe("teams");
  });

  it("maps tile 384 to the chess kids stat", () => {
    expect(getStatForTile(384)).toBe("kids");
  });

  it("maps the top tile to the users stat", () => {
    expect(getStatForTile(768)).toBe("users");
  });

  it("returns undefined for tile values that do not represent a stat", () => {
    expect(getStatForTile(3)).toBeUndefined();
    expect(getStatForTile(1536)).toBeUndefined();
  });
});

describe("seedBoard", () => {
  it("opens with starter tiles only, so no stat is unlocked before the first merge", () => {
    for (let i = 0; i < 50; i++) {
      const board = seedBoard();
      const values = board.flat().filter((v) => v !== 0);
      expect(values).toHaveLength(6);
      expect(values.every((v) => v === 3)).toBe(true);
    }
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
  function added(before: Board, after: Board): number | null {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (after[r][c] !== before[r][c]) return after[r][c];
      }
    }
    return null;
  }

  it("places a stat tile strictly below the highest tile on the board", () => {
    const board: Board = [
      [96, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let i = 0; i < 20; i++) {
      let n = 0;
      const rng = () => (n++ * 0.137 + i * 0.31) % 1;
      const value = added(board, spawnRandomMilestone(board, rng));
      expect([6, 12, 24, 48]).toContain(value);
    }
  });

  it("never spawns the top tile, even when the board already holds it", () => {
    const board: Board = [
      [768, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let i = 0; i < 20; i++) {
      let n = 0;
      const rng = () => (n++ * 0.211 + i * 0.17) % 1;
      expect(added(board, spawnRandomMilestone(board, rng))).not.toBe(768);
    }
  });

  it("never adds a third copy of a value", () => {
    const board: Board = [
      [24, 6, 6, 0],
      [12, 12, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let i = 0; i < 20; i++) {
      let n = 0;
      const rng = () => (n++ * 0.137 + i * 0.31) % 1;
      const value = added(board, spawnRandomMilestone(board, rng));
      expect(value).not.toBe(6);
      expect(value).not.toBe(12);
    }
  });

  it("falls back to a starter tile when nothing qualifies", () => {
    const board: Board = [
      [6, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(added(board, spawnRandomMilestone(board, () => 0))).toBe(3);
  });

  it("produces varied values across multiple calls", () => {
    const board: Board = [
      [384, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const values = new Set<number>();
    for (let i = 0; i < 20; i++) {
      let n = 0;
      const rng = () => (n++ * 0.137 + i * 0.31) % 1;
      const value = added(board, spawnRandomMilestone(board, rng));
      if (value) values.add(value);
    }
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

  it("does not copy the top tile or a value that already has a twin", () => {
    const board: Board = [
      [768, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 6, 6],
      [0, 0, 0, 0],
    ];
    for (let seed = 0; seed < 10; seed++) {
      const rng = () => (seed * 0.137) % 1;
      const result = spawnNext(board, rng);
      const flat = result.flat();
      expect(flat.filter((v) => v === 768)).toHaveLength(1);
      expect(flat.filter((v) => v === 6)).toHaveLength(2);
    }
  });
});

describe("full game", () => {
  function playGreedy(seedValue: number, order: "lowest" | "highest") {
    let s = seedValue;
    const rng = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    let board = ensureMergeAvailable(seedBoard(6, rng), rng);
    let mode: "active" | "withhold" = "active";
    const unlocked = new Set<string>();
    let worstPile = 0;
    for (let step = 1; step <= 200; step++) {
      const byValue = new Map<number, Array<[number, number]>>();
      board.forEach((row, r) =>
        row.forEach((v, c) => {
          if (v === 0) return;
          const list = byValue.get(v) ?? [];
          list.push([r, c]);
          byValue.set(v, list);
        }),
      );
      for (const [v, list] of byValue) {
        // Piles of spawned stat tiles are the bug we are guarding against.
        if (v >= 48) worstPile = Math.max(worstPile, list.length);
      }
      const pairs = [...byValue.entries()]
        .filter(([, list]) => list.length >= 2)
        .sort(([a], [b]) => (order === "lowest" ? a - b : b - a));
      if (pairs.length === 0) return { won: false, step, unlocked, worstPile };
      const [[fr, fc], [tr, tc]] = pairs[0][1];
      const result = mergeTilesAt(board, { row: fr, col: fc }, { row: tr, col: tc });
      const stat = getStatForTile(result.value);
      if (stat) unlocked.add(stat);
      if (result.won) return { won: true, step, unlocked, worstPile };
      let next = result.board;
      const plan = nextSpawnPlan(next, mode);
      mode = plan.mode;
      for (let i = 0; i < plan.count; i++) {
        next = i === 0 ? spawnNext(next, rng) : spawnRandomMilestone(next, rng);
      }
      board = ensureMergeAvailable(next, rng);
    }
    return { won: false, step: 200, unlocked, worstPile };
  }

  it("is winnable in a reasonable number of merges and unlocks every stat on the way", () => {
    for (const seed of [1, 7, 42, 1337, 9001]) {
      for (const order of ["lowest", "highest"] as const) {
        const run = playGreedy(seed, order);
        expect(run.won, `seed=${seed} order=${order}`).toBe(true);
        expect(run.step, `seed=${seed} order=${order}`).toBeLessThanOrEqual(120);
        expect([...run.unlocked].sort()).toEqual(STAT_LADDER.map((s) => s.key).sort());
      }
    }
  });

  it("never piles more than two spawned copies of a high stat on the board", () => {
    for (const seed of [1, 7, 42, 1337, 9001]) {
      expect(playGreedy(seed, "highest").worstPile, `seed=${seed}`).toBeLessThanOrEqual(3);
    }
  });
});

describe("findHintPair", () => {
  it("returns the closest pair of the lowest duplicated value", () => {
    const board: Board = [
      [3, 0, 0, 6],
      [0, 0, 0, 6],
      [0, 0, 0, 0],
      [3, 0, 3, 0],
    ];
    expect(findHintPair(board)).toEqual({ from: { row: 3, col: 0 }, to: { row: 3, col: 2 } });
  });

  it("returns null when nothing can merge", () => {
    const board: Board = [
      [3, 6, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(findHintPair(board)).toBeNull();
  });
});

describe("ensureMergeAvailable", () => {
  it("spawns a duplicate of the lowest existing tile when no merge is available but empties remain", () => {
    const board: Board = [
      [14, 0, 0, 47],
      [0, 0, 15, 5000],
      [0, 0, 0, 0],
      [10, 7, 0, 0],
    ];
    // Lowest non-zero tile on the board is 7
    const result = ensureMergeAvailable(board, () => 0);
    expect(hasValidMerge(result)).toBe(true);
    let sevens = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (result[r][c] === 7) sevens++;
      }
    }
    expect(sevens).toBe(2);
  });

  it("leaves the board untouched when a valid merge already exists", () => {
    const board: Board = [
      [3, 3, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = ensureMergeAvailable(board, () => 0);
    expect(result).toEqual(board);
  });

  it("starts a fresh pair of starters when only the top tile is left", () => {
    const board: Board = [
      [768, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = ensureMergeAvailable(board, () => 0);
    expect(result.flat().filter((v) => v === 3)).toHaveLength(2);
    expect(result.flat().filter((v) => v === 768)).toHaveLength(1);
  });

  it("returns the board unchanged when it is already full", () => {
    const board: Board = [
      [3, 6, 12, 24],
      [48, 96, 192, 384],
      [768, 1536, 3072, 6144],
      [12288, 24576, 49152, 98304],
    ];
    const result = ensureMergeAvailable(board, () => 0);
    expect(result).toEqual(board);
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

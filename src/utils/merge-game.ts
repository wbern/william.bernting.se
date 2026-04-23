export type Board = number[][];

export const STARTING_TILE = 3;

export type StatKey =
  | "recruited"
  | "teams"
  | "experience"
  | "prototypes"
  | "speaking"
  | "managed"
  | "bugfix"
  | "clients"
  | "coderate"
  | "linkedin"
  | "users";

const STAT_TILES: Record<number, StatKey> = {
  6: "recruited",
  12: "teams",
  24: "experience",
  48: "prototypes",
  96: "speaking",
  192: "managed",
  384: "bugfix",
  768: "clients",
  1536: "coderate",
  3072: "linkedin",
  6144: "users",
};

export function getStatForTile(value: number): StatKey | undefined {
  return STAT_TILES[value];
}

export type Position = { row: number; col: number };

export function mergeTilesAt(
  board: Board,
  from: Position,
  to: Position,
): { board: Board; gained: number; merged: boolean } {
  if (from.row === to.row && from.col === to.col) {
    return { board, gained: 0, merged: false };
  }
  const fromValue = board[from.row][from.col];
  const toValue = board[to.row][to.col];
  if (fromValue === 0 || toValue === 0 || fromValue !== toValue) {
    return { board, gained: 0, merged: false };
  }
  const next = board.map((row) => [...row]);
  const sum = next[from.row][from.col] * 2;
  next[from.row][from.col] = 0;
  next[to.row][to.col] = sum;
  return { board: next, gained: sum, merged: true };
}

export function createEmptyBoard(size = 4): Board {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

export function seedBoard(
  initialTiles = 6,
  rng: () => number = Math.random,
): Board {
  let b = createEmptyBoard();
  for (let i = 0; i < initialTiles; i++) {
    b = spawnTile(b, rng);
    if (i % 2 === 1) {
      const threes: Array<[number, number]> = [];
      b.forEach((row, r) =>
        row.forEach((v, c) => {
          if (v === STARTING_TILE) threes.push([r, c]);
        }),
      );
      if (threes.length > 0) {
        const [r, c] = threes[Math.floor(rng() * threes.length)];
        b = b.map((row, ri) =>
          ri === r ? row.map((v, ci) => (ci === c ? 6 : v)) : row,
        );
      }
    }
  }
  return b;
}

export function spawnTile(board: Board, rng: () => number = Math.random): Board {
  const empties: Array<[number, number]> = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return board;
  const [r, c] = empties[Math.floor(rng() * empties.length)];
  return board.map((row, ri) =>
    ri === r ? row.map((v, ci) => (ci === c ? STARTING_TILE : v)) : row,
  );
}

export function spawnNext(board: Board, rng: () => number = Math.random): Board {
  const nonZero: Array<{ row: number; col: number; value: number }> = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] !== 0) nonZero.push({ row: r, col: c, value: board[r][c] });
    }
  }
  const shuffled = [...nonZero].sort(() => rng() - 0.5);
  for (const tile of shuffled) {
    const neighbors: Array<[number, number]> = [
      [tile.row - 1, tile.col],
      [tile.row + 1, tile.col],
      [tile.row, tile.col - 1],
      [tile.row, tile.col + 1],
    ].filter(
      ([r, c]) =>
        r >= 0 && r < board.length && c >= 0 && c < board[r].length && board[r][c] === 0,
    );
    if (neighbors.length === 0) continue;
    const [r, c] = neighbors[Math.floor(rng() * neighbors.length)];
    return board.map((row, ri) =>
      ri === r ? row.map((v, ci) => (ci === c ? tile.value : v)) : row,
    );
  }
  return spawnTile(board, rng);
}

const MILESTONE_VALUES = [6, 12, 24, 48, 96, 192, 384, 768, 1536, 6144] as const;

export function spawnRandomMilestone(
  board: Board,
  rng: () => number = Math.random,
): Board {
  const empties: Array<[number, number]> = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return board;
  const [r, c] = empties[Math.floor(rng() * empties.length)];
  const value = MILESTONE_VALUES[Math.floor(rng() * MILESTONE_VALUES.length)];
  return board.map((row, ri) =>
    ri === r ? row.map((v, ci) => (ci === c ? value : v)) : row,
  );
}

export type SpawnMode = "active" | "withhold";

const SPAWN_WITHHOLD_HIGH = 11;
const SPAWN_WITHHOLD_LOW = 4;

export function nextSpawnPlan(
  board: Board,
  mode: SpawnMode,
): { count: number; mode: SpawnMode } {
  let filled = 0;
  for (const row of board) for (const v of row) if (v !== 0) filled++;
  if (mode === "active" && filled >= SPAWN_WITHHOLD_HIGH) {
    return { count: 0, mode: "withhold" };
  }
  if (mode === "withhold" && filled <= SPAWN_WITHHOLD_LOW) {
    return { count: 2, mode: "active" };
  }
  return { count: mode === "active" ? 2 : 0, mode };
}

export function hasValidMerge(board: Board): boolean {
  const seen = new Set<number>();
  for (const row of board) {
    for (const v of row) {
      if (v === 0) continue;
      if (seen.has(v)) return true;
      seen.add(v);
    }
  }
  return false;
}

export function isGameOver(board: Board): boolean {
  return !hasValidMerge(board);
}


export type Board = number[][];

export const STARTING_TILE = 3;

export type StatKey =
  | "recruited"
  | "teams"
  | "experience"
  | "prototypes"
  | "tdd"
  | "managed"
  | "bugfix"
  | "clients"
  | "coderate"
  | "users";

const STAT_TILES: Record<number, StatKey> = {
  6: "recruited",
  12: "teams",
  24: "experience",
  48: "prototypes",
  96: "tdd",
  192: "managed",
  384: "bugfix",
  768: "clients",
  1536: "coderate",
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


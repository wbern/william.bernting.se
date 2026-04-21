export type Board = number[][];

export const STARTING_TILE = 3;

export type StatKey =
  | "teams"
  | "experience"
  | "prototypes"
  | "coderate"
  | "users";

const STAT_TILES: Record<number, StatKey> = {
  12: "teams",
  24: "experience",
  48: "prototypes",
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
  const distance = Math.abs(from.row - to.row) + Math.abs(from.col - to.col);
  if (distance !== 1) {
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

export function isGameOver(board: Board): boolean {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const v = board[r][c];
      if (v === 0) continue;
      if (c + 1 < board[r].length && v !== 0 && board[r][c + 1] === v) {
        return false;
      }
      if (r + 1 < board.length && v !== 0 && board[r + 1][c] === v) {
        return false;
      }
    }
  }
  return true;
}


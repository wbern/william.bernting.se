export type Direction = "left" | "right" | "up" | "down";
export type Board = number[][];

export function move(
  board: Board,
  direction: Direction,
): { board: Board; gained: number; moved: boolean } {
  const isVertical = direction === "up" || direction === "down";
  const isReversed = direction === "right" || direction === "down";
  const rows = isVertical ? transpose(board) : board;
  let gained = 0;
  const slid = rows.map((row) => {
    const forward = isReversed ? [...row].reverse() : row;
    const { row: merged, gained: rowGained } = slideAndMergeRow(forward);
    gained += rowGained;
    return isReversed ? merged.reverse() : merged;
  });
  const nextBoard = isVertical ? transpose(slid) : slid;
  const moved = nextBoard.some((row, r) =>
    row.some((value, c) => value !== board[r][c]),
  );
  return { board: nextBoard, gained, moved };
}

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
  if (board.some((row) => row.some((v) => v === 0))) return false;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (c + 1 < board[r].length && board[r][c] === board[r][c + 1]) {
        return false;
      }
      if (r + 1 < board.length && board[r][c] === board[r + 1][c]) {
        return false;
      }
    }
  }
  return true;
}

function transpose(board: Board): Board {
  return board[0].map((_, col) => board.map((row) => row[col]));
}

export function slideRowLeft(row: number[]): number[] {
  return slideAndMergeRow(row).row;
}

function slideAndMergeRow(row: number[]): { row: number[]; gained: number } {
  const filled = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let gained = 0;
  for (let i = 0; i < filled.length; i++) {
    if (filled[i] === filled[i + 1]) {
      const sum = filled[i] * 2;
      merged.push(sum);
      gained += sum;
      i++;
    } else {
      merged.push(filled[i]);
    }
  }
  return {
    row: [...merged, ...Array(row.length - merged.length).fill(0)],
    gained,
  };
}

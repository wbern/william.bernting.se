export type Board = number[][];

export const STARTING_TILE = 3;

// The stat ladder. Tile values double (6, 12, 24 ... 768) and each rung
// reveals one fact, ordered so the displayed numbers escalate too:
// 6 hires -> 7 client products -> 8 tools -> 14 teams -> 15 years ->
// 77 projects -> ~500 chess kids -> 5 000 users (the top tile / win).
export type StatKey =
  | "recruited"
  | "clients"
  | "tools"
  | "teams"
  | "experience"
  | "projects"
  | "kids"
  | "users";

export const STAT_LADDER: ReadonlyArray<{ tile: number; key: StatKey }> = [
  { tile: 6, key: "recruited" },
  { tile: 12, key: "clients" },
  { tile: 24, key: "tools" },
  { tile: 48, key: "teams" },
  { tile: 96, key: "experience" },
  { tile: 192, key: "projects" },
  { tile: 384, key: "kids" },
  { tile: 768, key: "users" },
];

const STAT_TILES: Record<number, StatKey> = Object.fromEntries(
  STAT_LADDER.map(({ tile, key }) => [tile, key]),
);

export function getStatForTile(value: number): StatKey | undefined {
  return STAT_TILES[value];
}

export type Position = { row: number; col: number };

/** The top of the ladder. Forming it by a merge wins the game. */
export const MAX_STAT_TILE = 768;

export type MergeResult = {
  board: Board;
  gained: number;
  merged: boolean;
  /** Two top tiles merged past the ladder; the cell resets to a starter. */
  exploded: boolean;
  /** The merge produced the top tile. */
  won: boolean;
  /** Value of the tile the merge produced (0 when nothing merged). */
  value: number;
};

export function mergeTilesAt(board: Board, from: Position, to: Position): MergeResult {
  const none: MergeResult = { board, gained: 0, merged: false, exploded: false, won: false, value: 0 };
  if (from.row === to.row && from.col === to.col) return none;
  const fromValue = board[from.row][from.col];
  const toValue = board[to.row][to.col];
  if (fromValue === 0 || toValue === 0 || fromValue !== toValue) return none;
  const next = board.map((row) => [...row]);
  const sum = next[from.row][from.col] * 2;
  next[from.row][from.col] = 0;
  const exploded = sum > MAX_STAT_TILE;
  const value = exploded ? STARTING_TILE : sum;
  next[to.row][to.col] = value;
  return { board: next, gained: sum, merged: true, exploded, won: sum === MAX_STAT_TILE, value };
}

function countValue(board: Board, value: number): number {
  let n = 0;
  for (const row of board) for (const v of row) if (v === value) n++;
  return n;
}

function maxValue(board: Board): number {
  let m = 0;
  for (const row of board) for (const v of row) if (v > m) m = v;
  return m;
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
      const value = board[r][c];
      // Never copy the top tile (that would hand out the win), and never copy
      // a value that already has a twin (that is how duplicate piles start).
      if (value === 0 || value >= MAX_STAT_TILE || countValue(board, value) >= 2) continue;
      nonZero.push({ row: r, col: c, value });
    }
  }
  const shuffled = [...nonZero].sort(() => rng() - 0.5);
  for (const tile of shuffled) {
    const neighbors = ([
      [tile.row - 1, tile.col],
      [tile.row + 1, tile.col],
      [tile.row, tile.col - 1],
      [tile.row, tile.col + 1],
    ] as Array<[number, number]>).filter(
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

// Every rung below the top. The top tile is never spawned: it has to be earned.
const MILESTONE_VALUES = STAT_LADDER.map(({ tile }) => tile).filter((v) => v < MAX_STAT_TILE);

/**
 * Drops a stat tile into an empty cell to speed the climb up. Only values
 * strictly below the highest tile on the board qualify, and never one that
 * already appears twice, so the board stays a ladder instead of a pile of
 * duplicates. Falls back to a plain starter tile when nothing qualifies.
 */
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
  const top = maxValue(board);
  const candidates = MILESTONE_VALUES.filter((v) => v < top && countValue(board, v) < 2);
  if (candidates.length === 0) return spawnTile(board, rng);
  const [r, c] = empties[Math.floor(rng() * empties.length)];
  const value = candidates[Math.floor(rng() * candidates.length)];
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

export function ensureMergeAvailable(
  board: Board,
  rng: () => number = Math.random,
): Board {
  if (hasValidMerge(board)) return board;
  const empties: Array<[number, number]> = [];
  let lowest = Infinity;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const v = board[r][c];
      if (v === 0) empties.push([r, c]);
      else if (v < lowest && v < MAX_STAT_TILE) lowest = v;
    }
  }
  if (empties.length === 0) return board;
  const place = (b: Board, value: number, [r, c]: [number, number]): Board =>
    b.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? value : v)) : row));
  if (lowest === Infinity) {
    // Only the top tile (or nothing) is left: start a fresh pair of starters.
    if (empties.length < 2) return board;
    const first = Math.floor(rng() * empties.length);
    const rest = empties.filter((_, i) => i !== first);
    const second = rest[Math.floor(rng() * rest.length)];
    return place(place(board, STARTING_TILE, empties[first]), STARTING_TILE, second);
  }
  return place(board, lowest, empties[Math.floor(rng() * empties.length)]);
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

/**
 * The pair the onboarding hint should demonstrate: the two lowest equal
 * tiles, preferring the closest pair so the ghost drag is short.
 */
export function findHintPair(board: Board): { from: Position; to: Position } | null {
  const byValue = new Map<number, Position[]>();
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const v = board[r][c];
      if (v === 0) continue;
      const list = byValue.get(v) ?? [];
      list.push({ row: r, col: c });
      byValue.set(v, list);
    }
  }
  const values = [...byValue.keys()].sort((a, b) => a - b);
  for (const v of values) {
    const list = byValue.get(v)!;
    if (list.length < 2) continue;
    let best: { from: Position; to: Position } | null = null;
    let bestDist = Infinity;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const d = Math.abs(list[i].row - list[j].row) + Math.abs(list[i].col - list[j].col);
        if (d < bestDist) {
          bestDist = d;
          best = { from: list[i], to: list[j] };
        }
      }
    }
    return best;
  }
  return null;
}

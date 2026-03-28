import { randomChar } from "./chars";

export interface Cell {
  char: string;
  brightness: number;
  locked: boolean;
  lockChar: string | null;
  lockTimer: number;
  colorProgress: number;
}

export interface Column {
  cells: Cell[];
  headY: number;
  speed: number;
  trailLength: number;
}

function createCell(): Cell {
  return {
    char: "",
    brightness: 0,
    locked: false,
    lockChar: null,
    lockTimer: 0,
    colorProgress: 0,
  };
}

const FADE_RATE = 0.04;

export function tickColumn(col: Column, dt: number): void {
  const rows = col.cells.length;
  const steps = col.speed * (dt / 1000);
  const prevHead = Math.floor(col.headY);

  col.headY += steps;

  const headRow = Math.floor(col.headY);

  // Light up any rows the head passed through this tick
  for (let r = Math.max(0, prevHead + 1); r <= Math.min(headRow, rows - 1); r++) {
    const cell = col.cells[r];
    if (!cell.locked) {
      cell.brightness = 1;
      cell.char = randomChar();
    }
  }

  // Update brightness for all cells based on distance from head
  for (let i = 0; i < rows; i++) {
    const cell = col.cells[i];
    if (cell.locked) continue;

    const distance = headRow - i;
    if (distance < 0 || distance > col.trailLength) {
      // Not in trail — fade out
      cell.brightness = Math.max(0, cell.brightness - FADE_RATE * (dt / 16));
    }
    // Cells in trail keep their current brightness (set when head passed)
  }

  // Reset column when head goes past the bottom plus trail
  if (headRow - col.trailLength > rows) {
    col.headY = -Math.floor(Math.random() * rows);
    col.speed = 1 + Math.random() * 2;
    col.trailLength = 4 + Math.floor(Math.random() * 12);
  }
}

export function createColumns(cols: number, rows: number): Column[] {
  return Array.from({ length: cols }, () => ({
    cells: Array.from({ length: rows }, () => createCell()),
    headY: -Math.floor(Math.random() * rows),
    speed: 1 + Math.random() * 2,
    trailLength: 4 + Math.floor(Math.random() * 12),
  }));
}

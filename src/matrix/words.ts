import { randomChar } from "./chars";
import type { Column } from "./rain";

export type WordState =
  | "pending"
  | "materializing"
  | "locked"
  | "dissolving"
  | "done";

export interface WordEvent {
  word: string;
  chars: string[];
  row: number;
  colStart: number;
  triggerTime: number;
  state: WordState;
  materializeStart: number;
  staggerIndex: number;
  lockStart: number;
  colorProgress: number;
}

const LOCK_DURATION = 1500;
const STAGGER_DELAY = 80;
const COLOR_TRANSITION_MS = 500;
const DISSOLVE_STAGGER = 50;

export function createWordEvent(
  word: string,
  row: number,
  colStart: number,
  triggerTime: number,
): WordEvent {
  return {
    word,
    chars: word.split(""),
    row,
    colStart,
    triggerTime,
    state: "pending",
    materializeStart: 0,
    staggerIndex: 0,
    lockStart: 0,
    colorProgress: 0,
  };
}

export function tickWordEvent(
  event: WordEvent,
  now: number,
  columns: Column[],
): void {
  if (event.state === "done") return;

  if (event.state === "pending" && now >= event.triggerTime) {
    event.state = "materializing";
    event.materializeStart = now;
    event.staggerIndex = 0;
  }

  if (event.state === "materializing") {
    const elapsed = now - event.materializeStart;
    const chars = event.chars;

    // Stagger: reveal one character per STAGGER_DELAY
    const revealedCount = Math.min(
      chars.length,
      Math.floor(elapsed / STAGGER_DELAY) + 1,
    );

    for (let i = 0; i < revealedCount; i++) {
      const col = event.colStart + i;
      if (col >= columns.length) continue;
      const cell = columns[col].cells[event.row];
      if (!cell) continue;

      const charElapsed = elapsed - i * STAGGER_DELAY;
      // Scramble phase: show random chars before settling
      if (charElapsed < STAGGER_DELAY * 2) {
        cell.char = randomChar();
      } else {
        cell.char = chars[i];
      }
      cell.locked = true;
      cell.brightness = 1;
    }

    event.staggerIndex = revealedCount;

    // All characters revealed and settled?
    if (revealedCount >= chars.length && elapsed >= chars.length * STAGGER_DELAY + STAGGER_DELAY * 2) {
      event.state = "locked";
      event.lockStart = now;
      // Ensure all chars show final letter
      for (let i = 0; i < chars.length; i++) {
        const col = event.colStart + i;
        if (col >= columns.length) continue;
        const cell = columns[col].cells[event.row];
        if (cell) cell.char = chars[i];
      }
    }
  }

  if (event.state === "locked") {
    const elapsed = now - event.lockStart;
    event.colorProgress = Math.min(1, elapsed / COLOR_TRANSITION_MS);

    // Apply color progress to each cell
    const chars = event.chars;
    for (let i = 0; i < chars.length; i++) {
      const col = event.colStart + i;
      if (col >= columns.length) continue;
      const cell = columns[col].cells[event.row];
      if (cell) {
        cell.colorProgress = event.colorProgress;
        cell.brightness = 1;
      }
    }

    if (elapsed >= LOCK_DURATION) {
      event.state = "dissolving";
    }
  }

  if (event.state === "dissolving") {
    const chars = event.chars;
    let allDone = true;

    for (let i = 0; i < chars.length; i++) {
      const col = event.colStart + i;
      if (col >= columns.length) continue;
      const cell = columns[col].cells[event.row];
      if (!cell) continue;

      const dissolveDelay = i * DISSOLVE_STAGGER;
      const timeSinceDissolve = now - event.lockStart - LOCK_DURATION - dissolveDelay;

      if (timeSinceDissolve > 0) {
        cell.locked = false;
        cell.colorProgress = Math.max(0, event.colorProgress - timeSinceDissolve / COLOR_TRANSITION_MS);
        cell.brightness = Math.max(0, 1 - timeSinceDissolve / 500);
      } else {
        allDone = false;
      }

      if (cell.brightness > 0) allDone = false;
    }

    if (allDone) {
      event.state = "done";
    }
  }
}

import { createWordEvent, type WordEvent } from "./words";

export interface Scheduler {
  next(now: number): WordEvent | null;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createScheduler(
  traits: string[],
  cols: number,
  rows: number,
): Scheduler {
  // Filter out traits that don't fit in the grid
  const fittingTraits = traits.filter((t) => t.length <= cols - 4);

  let queue = shuffle(fittingTraits);
  let index = 0;

  // Middle third of rows for word placement
  const minRow = Math.max(1, Math.floor(rows * 0.2));
  const maxRow = Math.min(rows - 2, Math.floor(rows * 0.8));

  return {
    next(now: number): WordEvent | null {
      if (fittingTraits.length === 0) return null;

      // Reshuffle when exhausted
      if (index >= queue.length) {
        queue = shuffle(fittingTraits);
        index = 0;
      }

      const word = queue[index++];
      const maxCol = cols - word.length;
      const colStart = Math.floor(Math.random() * maxCol);
      const row = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));

      return createWordEvent(word, row, colStart, now);
    },
  };
}

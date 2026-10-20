/** Pure helpers for the projects roulette (Projects.astro). */

/** Positive modulo: mod(-1, 5) === 4. */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Pick where a spin should settle. Starts from the natural landing slot
 * `settleTo` (an unwrapped scroll position) and walks outwards (+1, -1, +2,
 * -2, …) until it finds a slot that is allowed:
 *  - never the slot the spin started on (a spin must visibly change things)
 *  - if `targets` is non-empty, one of the targets (used to make the first
 *    spin on arrival land on a flagship case instead of a random one).
 *
 * Returns the adjusted unwrapped position, so the settle animation only
 * travels the few slots between the natural stop and the chosen one.
 */
export function pickLanding(
  settleTo: number,
  startIdx: number,
  n: number,
  targets: ReadonlySet<number> = new Set(),
): number {
  const ok = (pos: number) => {
    const idx = mod(pos, n);
    if (n > 1 && idx === mod(startIdx, n)) return false;
    return targets.size === 0 || targets.has(idx);
  };
  for (let step = 0; step <= n; step++) {
    if (ok(settleTo + step)) return settleTo + step;
    if (step > 0 && ok(settleTo - step)) return settleTo - step;
  }
  return settleTo;
}

/**
 * Index of the next item (after `current`, wrapping) whose track matches.
 * Returns -1 when no item has that track.
 */
export function nextInTrack(current: number, tracks: readonly string[], track: string): number {
  const n = tracks.length;
  for (let step = 1; step <= n; step++) {
    const idx = mod(current + step, n);
    if (tracks[idx] === track) return idx;
  }
  return -1;
}

import { lerpRainColor } from "./color";

const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;
const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const BRIGHTNESS_LEVELS = [0.15, 0.35, 0.55, 0.75, 1.0] as const;
export const COLOR_PROGRESS_LEVELS = [0, 0.5, 1.0] as const;

const RAIN_ROWS = BRIGHTNESS_LEVELS.length * COLOR_PROGRESS_LEVELS.length;

/**
 * Snap a continuous value to the nearest value in a sorted array.
 */
export function quantize(value: number, levels: readonly number[]): number {
  let best = 0;
  let bestDist = Math.abs(levels[0] - value);
  for (let i = 1; i < levels.length; i++) {
    const d = Math.abs(levels[i] - value);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/**
 * Pre-computed lookup tables for O(1) quantization in the render loop.
 * Maps [0..255] -> nearest level index.
 */
function buildLookup(levels: readonly number[]): Uint8Array {
  const table = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    table[i] = quantize(i / 255, levels);
  }
  return table;
}

const brightnessLUT = buildLookup(BRIGHTNESS_LEVELS);
const colorProgressLUT = buildLookup(COLOR_PROGRESS_LEVELS);

/** O(1) brightness quantization for the render loop. */
export function quantizeBrightness(value: number): number {
  return brightnessLUT[(value * 255) | 0];
}

/** O(1) color progress quantization for the render loop. */
export function quantizeColorProgress(value: number): number {
  return colorProgressLUT[(value * 255) | 0];
}

/**
 * Build the full character set: Katakana + Latin + any extra chars from traits.
 */
export function buildCharSet(traitWords: string[]): string[] {
  const seen = new Set<string>();
  const chars: string[] = [];

  function add(ch: string) {
    if (!seen.has(ch)) {
      seen.add(ch);
      chars.push(ch);
    }
  }

  for (let i = KATAKANA_START; i <= KATAKANA_END; i++) add(String.fromCharCode(i));
  for (const ch of LATIN) add(ch);
  for (const word of traitWords) {
    for (const ch of word) add(ch);
  }
  return chars;
}

/**
 * Compute the sprite row for a rain cell (non-head).
 */
export function rainRow(brightnessIdx: number, colorProgressIdx: number): number {
  return brightnessIdx * COLOR_PROGRESS_LEVELS.length + colorProgressIdx;
}

/**
 * Compute the sprite row for a head cell.
 */
export function headRow(brightnessIdx: number): number {
  return RAIN_ROWS + brightnessIdx;
}

export const TOTAL_VARIANT_ROWS =
  BRIGHTNESS_LEVELS.length * COLOR_PROGRESS_LEVELS.length +
  BRIGHTNESS_LEVELS.length;

export interface SpriteSheet {
  source: HTMLCanvasElement | ImageBitmap;
  charIndex: Map<string, number>;
  charCount: number;
}

/**
 * Create a sprite sheet canvas with all characters pre-rendered at quantized colors.
 * Must be called after fonts are loaded.
 */
export function createSpriteSheet(
  fontSize: number,
  traitWords: string[],
): SpriteSheet {
  const chars = buildCharSet(traitWords);
  const charIndex = new Map<string, number>();
  chars.forEach((ch, i) => charIndex.set(ch, i));

  const canvas = document.createElement("canvas");
  canvas.width = chars.length * fontSize;
  canvas.height = TOTAL_VARIANT_ROWS * fontSize;
  const ctx = canvas.getContext("2d", { alpha: true })!;
  ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
  ctx.textBaseline = "top";

  let row = 0;

  // Rain variants: each (brightness, colorProgress) combination
  for (const brightness of BRIGHTNESS_LEVELS) {
    for (const colorProgress of COLOR_PROGRESS_LEVELS) {
      ctx.fillStyle = lerpRainColor(colorProgress, brightness);
      for (let c = 0; c < chars.length; c++) {
        ctx.fillText(chars[c], c * fontSize, row * fontSize);
      }
      row++;
    }
  }

  // Head variants: bright green-white at each brightness level
  for (const brightness of BRIGHTNESS_LEVELS) {
    ctx.fillStyle = `rgba(180, 255, 180, ${brightness})`;
    for (let c = 0; c < chars.length; c++) {
      ctx.fillText(chars[c], c * fontSize, row * fontSize);
    }
    row++;
  }

  return { source: canvas, charIndex, charCount: chars.length };
}

/**
 * Convert sprite sheet canvas to an immutable GPU-resident ImageBitmap
 * for faster drawImage in the render loop.
 */
export async function toImageBitmap(
  sheet: SpriteSheet,
): Promise<SpriteSheet> {
  const bitmap = await createImageBitmap(sheet.source as HTMLCanvasElement);
  return { source: bitmap, charIndex: sheet.charIndex, charCount: sheet.charCount };
}

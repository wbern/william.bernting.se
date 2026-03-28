const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;
const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const POOL_SIZE = 256;
const pool: string[] = [];
let poolIdx = 0;

function generateChar(): string {
  if (Math.random() < 0.5) {
    return String.fromCharCode(
      KATAKANA_START +
        Math.floor(Math.random() * (KATAKANA_END - KATAKANA_START + 1)),
    );
  }
  return LATIN[Math.floor(Math.random() * LATIN.length)];
}

// Fill pool at module load
for (let i = 0; i < POOL_SIZE; i++) pool.push(generateChar());

export function randomChar(): string {
  const ch = pool[poolIdx];
  poolIdx = (poolIdx + 1) & (POOL_SIZE - 1);
  return ch;
}

export function isKatakana(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= KATAKANA_START && code <= KATAKANA_END;
}

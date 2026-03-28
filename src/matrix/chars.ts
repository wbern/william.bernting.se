const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;
const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function randomChar(): string {
  if (Math.random() < 0.5) {
    return String.fromCharCode(
      KATAKANA_START +
        Math.floor(Math.random() * (KATAKANA_END - KATAKANA_START + 1)),
    );
  }
  return LATIN[Math.floor(Math.random() * LATIN.length)];
}

export function isKatakana(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= KATAKANA_START && code <= KATAKANA_END;
}

const GREEN_HUE = 120;
const PURPLE_HUE = 280;
const GREEN_LIGHTNESS = 50;
const PURPLE_LIGHTNESS = 60;

export function lerpRainColor(progress: number, brightness: number): string {
  const hue = Math.round(GREEN_HUE + (PURPLE_HUE - GREEN_HUE) * progress);
  const lightness = Math.round(
    GREEN_LIGHTNESS + (PURPLE_LIGHTNESS - GREEN_LIGHTNESS) * progress,
  );

  if (brightness >= 1) {
    return `hsl(${hue}, 100%, ${lightness}%)`;
  }
  return `hsla(${hue}, 100%, ${lightness}%, ${brightness})`;
}

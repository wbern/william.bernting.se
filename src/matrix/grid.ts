export interface Grid {
  cols: number;
  rows: number;
  fontSize: number;
}

export function createGrid(
  width: number,
  height: number,
  fontSize: number,
): Grid {
  return {
    cols: Math.floor(width / fontSize),
    rows: Math.floor(height / fontSize),
    fontSize,
  };
}

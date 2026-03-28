import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

const cache = new Map<string, { dataUrl: string; width: number; height: number }>();

/**
 * Generate a tiny base64 blur placeholder for a public image at build time.
 * Results are cached per process to avoid redundant work during SSG.
 */
export async function blurPlaceholder(publicPath: string): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  if (cache.has(publicPath)) return cache.get(publicPath)!;

  const filePath = join(process.cwd(), "public", publicPath);
  const buffer = readFileSync(filePath);
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 1;
  const height = metadata.height ?? 1;

  const tiny = await sharp(buffer)
    .resize(20, Math.round(20 * (height / width)), { fit: "fill" })
    .jpeg({ quality: 40 })
    .toBuffer();

  const dataUrl = `data:image/jpeg;base64,${tiny.toString("base64")}`;
  const result = { dataUrl, width, height };
  cache.set(publicPath, result);
  return result;
}

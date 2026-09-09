import type { Rgb } from "./lab";

export type PixelSource = {
  data: Uint8ClampedArray | number[];
  width: number;
  height: number;
};

/**
 * Downsamples image data to a gridWidth x gridHeight grid by box averaging:
 * each output cell is the mean color of every source pixel that falls in
 * its region. Deliberately not nearest-neighbor sampling, which throws
 * away most of the source pixels and produces noisy, speckled edges —
 * exactly where a face reads as recognizable or not.
 *
 * Returns a flat, row-major array (matching Pattern.cells' layout).
 */
export function boxAverageDownsample(
  source: PixelSource,
  gridWidth: number,
  gridHeight: number,
): Rgb[] {
  const { data, width, height } = source;
  const out: Rgb[] = [];

  for (let gy = 0; gy < gridHeight; gy++) {
    const y0 = Math.floor((gy * height) / gridHeight);
    const y1 = Math.max(y0 + 1, Math.floor(((gy + 1) * height) / gridHeight));

    for (let gx = 0; gx < gridWidth; gx++) {
      const x0 = Math.floor((gx * width) / gridWidth);
      const x1 = Math.max(x0 + 1, Math.floor(((gx + 1) * width) / gridWidth));

      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n++;
        }
      }
      out.push({ r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) });
    }
  }

  return out;
}

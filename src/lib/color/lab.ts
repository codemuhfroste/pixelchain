export type Rgb = { r: number; g: number; b: number };
export type Lab = { L: number; a: number; b: number };

/**
 * sRGB -> CIE Lab. Lab is perceptually uniform (equal numeric distance ≈
 * equal perceived color difference) in a way RGB is not — this is why
 * nearest-color matching in Lab gets skin tones right where plain RGB
 * distance goes muddy or grey. See nearestBead.ts for where this is used.
 */
export function rgbToLab({ r, g, b }: Rgb): Lab {
  // 1. Undo sRGB's gamma encoding to get physically linear light values.
  const toLinear = (channel: number) => {
    const v = channel / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);

  // 2. Linear sRGB -> CIE XYZ (D65 illuminant, sRGB primaries).
  const x = rl * 0.4124 + gl * 0.3576 + bl * 0.1805;
  const y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  const z = rl * 0.0193 + gl * 0.1192 + bl * 0.9505;

  // 3. XYZ -> Lab, normalized against the D65 reference white point.
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);

  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/**
 * Euclidean distance in Lab space. This project uses plain Euclidean
 * distance rather than CIEDE2000 — CIEDE2000 is more perceptually accurate
 * at small distances but meaningfully more complex, and for matching
 * against a hand-picked bead palette (a few dozen colors, not millions)
 * plain Lab distance is more than good enough.
 */
export function labDistance(a: Lab, b: Lab): number {
  return Math.sqrt((a.L - b.L) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2);
}

import { rgbToLab, labDistance, type Rgb } from "./lab";

export type PaletteColor = { id: string; hex: string };

export function hexToRgb(hex: string): Rgb {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

/**
 * Finds the palette color perceptually closest to `rgb`, comparing in Lab
 * space rather than raw RGB (see lab.ts for why). Pure and side-effect
 * free on purpose: it's the one piece of the pattern generator worth
 * unit-testing and tuning independent of any UI.
 */
export function nearestBead<T extends PaletteColor>(rgb: Rgb, palette: T[]): T {
  if (palette.length === 0) {
    throw new Error("nearestBead: palette is empty");
  }
  const targetLab = rgbToLab(rgb);
  let best = palette[0];
  let bestDistance = Infinity;
  for (const color of palette) {
    const distance = labDistance(targetLab, rgbToLab(hexToRgb(color.hex)));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = color;
    }
  }
  return best;
}

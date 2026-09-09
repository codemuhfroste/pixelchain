// Pricing/size tiers for 2.6mm mini beads, matching how the maker actually
// prices keychains (physical size in cm), not an arbitrary grid-size list.
// Grid dimensions are the operative rule; the cm ranges are the label she
// quotes customers.
export type SizeTier = {
  name: "Small" | "Medium" | "Large";
  cmRange: string;
  min: number;
  max: number;
  defaultSize: number;
  examples: string;
};

export const SIZE_TIERS: SizeTier[] = [
  {
    name: "Small",
    cmRange: "1–3cm",
    min: 4,
    max: 11,
    defaultSize: 8,
    examples: "Minecraft faces, micro Pokéballs",
  },
  {
    name: "Medium",
    cmRange: "4–6cm",
    min: 12,
    max: 23,
    defaultSize: 16,
    examples: "GBA/DS sprites, Sanrio heads — the bestseller size",
  },
  {
    name: "Large",
    cmRange: "7cm+",
    min: 24,
    max: 60,
    defaultSize: 24,
    examples: "Full sprites, custom logos",
  },
];

export const MIN_GRID_SIZE = SIZE_TIERS[0].min;
export const MAX_GRID_SIZE = SIZE_TIERS[SIZE_TIERS.length - 1].max;

export function tierForSize(size: number): SizeTier {
  return SIZE_TIERS.find((t) => size <= t.max) ?? SIZE_TIERS[SIZE_TIERS.length - 1];
}

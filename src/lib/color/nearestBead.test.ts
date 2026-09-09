import { describe, expect, it } from "vitest";
import { nearestBead, hexToRgb } from "./nearestBead";

const palette = [
  { id: "black", hex: "#1A1815" },
  { id: "white", hex: "#FBFAF7" },
  { id: "skin-light", hex: "#E8B894" },
  { id: "skin-medium", hex: "#C98A5E" },
  { id: "teal", hex: "#1E7D82" },
];

describe("hexToRgb", () => {
  it("parses a hex string into components", () => {
    expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("00ff80")).toEqual({ r: 0, g: 255, b: 128 });
  });
});

describe("nearestBead", () => {
  it("returns the exact match when the color is already in the palette", () => {
    const match = nearestBead(hexToRgb("#1E7D82"), palette);
    expect(match.id).toBe("teal");
  });

  it("picks the perceptually closer of two skin tones over RGB-nearest", () => {
    // A mid skin tone that's perceptually closer to skin-medium than
    // skin-light, even though this is not necessarily the RGB-nearest
    // choice — this is the case that motivates using Lab distance at all.
    const match = nearestBead({ r: 195, g: 130, b: 88 }, palette);
    expect(match.id).toBe("skin-medium");
  });

  it("never picks an unrelated hue (teal) for a warm skin tone", () => {
    const match = nearestBead({ r: 210, g: 160, b: 120 }, palette);
    expect(match.id).not.toBe("teal");
  });

  it("throws on an empty palette rather than returning something wrong", () => {
    expect(() => nearestBead({ r: 0, g: 0, b: 0 }, [])).toThrow();
  });
});

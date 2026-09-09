import { describe, expect, it } from "vitest";
import { rgbToLab, labDistance } from "./lab";

describe("rgbToLab", () => {
  it("maps white to L≈100, a≈0, b≈0", () => {
    const lab = rgbToLab({ r: 255, g: 255, b: 255 });
    expect(lab.L).toBeCloseTo(100, 0);
    expect(lab.a).toBeCloseTo(0, 0);
    expect(lab.b).toBeCloseTo(0, 0);
  });

  it("maps black to L≈0", () => {
    const lab = rgbToLab({ r: 0, g: 0, b: 0 });
    expect(lab.L).toBeCloseTo(0, 0);
  });

  it("gives mid-grey a much larger L than a near-black shade", () => {
    const midGrey = rgbToLab({ r: 128, g: 128, b: 128 });
    const nearBlack = rgbToLab({ r: 20, g: 20, b: 20 });
    expect(midGrey.L).toBeGreaterThan(nearBlack.L);
  });
});

describe("labDistance", () => {
  it("is zero for identical colors", () => {
    const lab = rgbToLab({ r: 200, g: 100, b: 50 });
    expect(labDistance(lab, lab)).toBe(0);
  });

  it("is symmetric", () => {
    const a = rgbToLab({ r: 200, g: 100, b: 50 });
    const b = rgbToLab({ r: 10, g: 180, b: 220 });
    expect(labDistance(a, b)).toBeCloseTo(labDistance(b, a), 10);
  });

  it("puts two similar skin tones closer together than a skin tone and blue", () => {
    const skinLight = rgbToLab({ r: 232, g: 184, b: 148 });
    const skinMedium = rgbToLab({ r: 201, g: 138, b: 94 });
    const blue = rgbToLab({ r: 30, g: 60, b: 220 });
    expect(labDistance(skinLight, skinMedium)).toBeLessThan(
      labDistance(skinLight, blue),
    );
  });
});

import { describe, expect, it } from "vitest";
import { boxAverageDownsample } from "./downsample";

function solidImage(width: number, height: number, r: number, g: number, b: number) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return { data, width, height };
}

describe("boxAverageDownsample", () => {
  it("returns the same color for every cell on a solid-color image", () => {
    const image = solidImage(8, 8, 200, 100, 50);
    const cells = boxAverageDownsample(image, 4, 4);
    expect(cells).toHaveLength(16);
    for (const cell of cells) {
      expect(cell).toEqual({ r: 200, g: 100, b: 50 });
    }
  });

  it("averages a 2x2 image down to a single cell", () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, // top-left: red
      0, 255, 0, 255, // top-right: green
      0, 0, 255, 255, // bottom-left: blue
      255, 255, 0, 255, // bottom-right: yellow
    ]);
    const cells = boxAverageDownsample({ data, width: 2, height: 2 }, 1, 1);
    expect(cells).toEqual([{ r: 128, g: 128, b: 64 }]);
  });

  it("produces a row-major, width*height-length array for a non-square grid", () => {
    const image = solidImage(10, 20, 10, 20, 30);
    const cells = boxAverageDownsample(image, 3, 5);
    expect(cells).toHaveLength(15);
  });

  it("keeps the left half and right half of a half-red/half-blue image distinct", () => {
    const width = 4;
    const height = 2;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const isLeft = x < width / 2;
        data[i] = isLeft ? 255 : 0;
        data[i + 1] = 0;
        data[i + 2] = isLeft ? 0 : 255;
        data[i + 3] = 255;
      }
    }
    const cells = boxAverageDownsample({ data, width, height }, 2, 1);
    expect(cells[0]).toEqual({ r: 255, g: 0, b: 0 });
    expect(cells[1]).toEqual({ r: 0, g: 0, b: 255 });
  });
});

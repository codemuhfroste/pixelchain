// A raw face-detection box is tight around the face and cuts off hair and
// chin — exactly the parts that make a keychain recognizable. These pad the
// box before it's shown as the (still draggable/resizable) starting crop.
// Tunable independently of everything else.
export const CROP_PAD_TOP = 0.4;
export const CROP_PAD_SIDES = 0.2;
export const CROP_PAD_BOTTOM = 0.15;

export type Box = { x: number; y: number; width: number; height: number };

export function padBox(box: Box, imageWidth: number, imageHeight: number): Box {
  const padTop = box.height * CROP_PAD_TOP;
  const padBottom = box.height * CROP_PAD_BOTTOM;
  const padSides = box.width * CROP_PAD_SIDES;

  const x = Math.max(0, box.x - padSides);
  const y = Math.max(0, box.y - padTop);
  const right = Math.min(imageWidth, box.x + box.width + padSides);
  const bottom = Math.min(imageHeight, box.y + box.height + padBottom);

  return { x, y, width: right - x, height: bottom - y };
}

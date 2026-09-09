import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";

// Lazily loaded and cached, same reasoning as faceDetection.ts — this is a
// separate ~2-3MB model, no point fetching it until background removal is
// actually requested.
let segmenterPromise: Promise<ImageSegmenter> | null = null;

function getSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
    ).then((vision) =>
      ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite",
        },
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      }),
    );
  }
  return segmenterPromise;
}

// A cell counts as "subject" if the segmenter is at least this confident.
// Tunable independently of everything else — lower it if hair/shoulders are
// getting cut, raise it if background is bleeding through.
export const BACKGROUND_THRESHOLD = 0.5;

// The selfie segmenter is trained on real photos, so it can come back
// essentially blank (every pixel near 0) for something that isn't a
// photographic person at all — a cartoon, a pet, a logo. If the *best*
// pixel in the whole mask never clears this floor, there's no usable
// subject signal, and applying BACKGROUND_THRESHOLD per cell would null
// out the entire grid instead of falling back to the full crop.
const MIN_PEAK_CONFIDENCE = 0.3;

export type SubjectMask = { data: Float32Array; width: number; height: number };

/**
 * Runs person segmentation on an already-loaded image and returns a
 * per-pixel confidence mask (0 = background, 1 = subject), or null if
 * segmentation failed or found no confident subject. Like face detection,
 * this must never throw and block pattern generation — plenty of source
 * photos (pets, logos) won't have a "person" for the model to find, and
 * callers should just skip background removal in that case.
 */
export async function segmentSubject(
  image: HTMLImageElement | HTMLCanvasElement,
): Promise<SubjectMask | null> {
  try {
    const segmenter = await getSegmenter();
    const result = segmenter.segment(image);
    const mask = result.confidenceMasks?.[0];
    if (!mask) {
      result.close();
      return null;
    }
    const data = mask.getAsFloat32Array().slice();
    const { width, height } = mask;
    result.close();

    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > peak) peak = data[i];
    }
    if (peak < MIN_PEAK_CONFIDENCE) return null;

    return { data, width, height };
  } catch (err) {
    console.warn("Background segmentation unavailable, keeping full crop:", err);
    return null;
  }
}

/** Bilinear-ish nearest lookup of the mask's subject confidence at a point
 * in the *source image's* pixel coordinates (the mask is often a different
 * resolution than the source). */
export function sampleMask(mask: SubjectMask, x: number, y: number, sourceW: number, sourceH: number): number {
  const mx = Math.min(mask.width - 1, Math.max(0, Math.round((x / sourceW) * mask.width)));
  const my = Math.min(mask.height - 1, Math.max(0, Math.round((y / sourceH) * mask.height)));
  return mask.data[my * mask.width + mx];
}

import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

// Loaded lazily and cached — MediaPipe fetches ~1-2MB of WASM + model
// assets from Google's CDN on first use, no point doing that before the
// pattern generator screen actually needs it.
let detectorPromise: Promise<FaceDetector> | null = null;

function getDetector() {
  if (!detectorPromise) {
    detectorPromise = FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
    ).then((vision) =>
      FaceDetector.createFromModelPath(
        vision,
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
      ),
    );
  }
  return detectorPromise;
}

export type DetectedBox = { x: number; y: number; width: number; height: number };

/**
 * Runs face detection on an already-loaded <img>. Returns the tightest
 * bounding box (in the image's natural pixel coordinates) around the most
 * confident face found, or null if no face was detected or detection
 * itself failed for any reason. Callers must treat null as "fall back to
 * a manual crop box" — this must never throw and block the pattern
 * generator, since plenty of uploads will be pets, logos, or group shots.
 */
export async function detectFaceBox(image: HTMLImageElement): Promise<DetectedBox | null> {
  try {
    const detector = await getDetector();
    const result = detector.detect(image);
    const box = result.detections[0]?.boundingBox;
    if (!box) return null;
    return { x: box.originX, y: box.originY, width: box.width, height: box.height };
  } catch (err) {
    console.warn("Face detection unavailable, falling back to manual crop:", err);
    return null;
  }
}

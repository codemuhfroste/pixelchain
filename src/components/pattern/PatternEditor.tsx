"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { detectFaceBox } from "@/lib/faceDetection";
import { padBox, type Box } from "@/lib/cropPadding";
import { boxAverageDownsample } from "@/lib/color/downsample";
import { nearestBead } from "@/lib/color/nearestBead";
import { drawSampleFace } from "@/lib/sampleFace";
import { savePatternAction } from "@/lib/actions/patterns";
import { segmentSubject, sampleMask, BACKGROUND_THRESHOLD } from "@/lib/segmentation";
import { SIZE_TIERS, MIN_GRID_SIZE, MAX_GRID_SIZE, tierForSize } from "@/lib/sizingTiers";
import { PatternGrid } from "./PatternGrid";
import { BeadCountSummary } from "./BeadCountSummary";
import { PrintSheet } from "./PrintSheet";

type PaletteColor = { id: string; name: string; code: string | null; hex: string };
type Tool = "paint" | "eyedrop" | "erase";

// Medium is the bestseller tier per the maker's own pricing matrix — the
// sensible default for a fresh pattern.
const DEFAULT_GRID = SIZE_TIERS.find((t) => t.name === "Medium")!.defaultSize;
const DISPLAY_WIDTH = 340;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function PatternEditor({
  orderItemId,
  itemDescription,
  initialPhotoUrl,
  palette,
  existingPattern,
}: {
  orderItemId: string;
  itemDescription: string;
  initialPhotoUrl: string | null;
  palette: PaletteColor[];
  existingPattern: { gridWidth: number; gridHeight: number; cells: (string | null)[] } | null;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialPhotoUrl);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [displayHeight, setDisplayHeight] = useState(0);
  const [crop, setCrop] = useState<Box | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [faceStatus, setFaceStatus] = useState<"idle" | "found" | "not-found">("idle");

  const [gridWidth, setGridWidth] = useState(existingPattern?.gridWidth ?? DEFAULT_GRID);
  const [gridHeight, setGridHeight] = useState(existingPattern?.gridHeight ?? DEFAULT_GRID);
  const [cells, setCells] = useState<(string | null)[]>(
    existingPattern?.cells ?? new Array(DEFAULT_GRID * DEFAULT_GRID).fill(null),
  );
  const hasSavedWork = useRef(Boolean(existingPattern));

  const [undoStack, setUndoStack] = useState<(string | null)[][]>([]);
  const [redoStack, setRedoStack] = useState<(string | null)[][]>([]);
  const strokeStarted = useRef(false);

  const [tool, setTool] = useState<Tool>("paint");
  const [selectedColorId, setSelectedColorId] = useState<string | null>(palette[0]?.id ?? null);
  const [showBorders, setShowBorders] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showCodes, setShowCodes] = useState(false);

  const [removeBackground, setRemoveBackground] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [bgStatus, setBgStatus] = useState<"idle" | "removed" | "not-found">("idle");

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [saving, startSaving] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const cropBoxRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ mode: "move" | "resize"; startX: number; startY: number; start: Box } | null>(null);

  // Load the image (photo or sample) and run client-side face detection.
  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;
    const img = new window.Image();
    img.onload = async () => {
      if (cancelled) return;
      imgRef.current = img;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      const scale = DISPLAY_WIDTH / img.naturalWidth;
      const dh = img.naturalHeight * scale;
      setDisplayHeight(dh);

      setDetecting(true);
      const box = await detectFaceBox(img);
      if (cancelled) return;
      setDetecting(false);

      if (box) {
        const padded = padBox(box, img.naturalWidth, img.naturalHeight);
        setCrop({
          x: padded.x * scale,
          y: padded.y * scale,
          width: padded.width * scale,
          height: padded.height * scale,
        });
        setFaceStatus("found");
      } else {
        setCrop({ x: DISPLAY_WIDTH * 0.2, y: dh * 0.15, width: DISPLAY_WIDTH * 0.6, height: dh * 0.7 });
        setFaceStatus("not-found");
      }
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  // Reset the paint-stroke flag once the pointer is released anywhere.
  useEffect(() => {
    function up() {
      strokeStarted.current = false;
    }
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
  }

  function handleUseSample() {
    setImageUrl(drawSampleFace());
  }

  function pushUndo() {
    setUndoStack((s) => [...s.slice(-29), cells]);
    setRedoStack([]);
  }

  function handleCellInteract(index: number) {
    if (tool === "eyedrop") {
      if (cells[index]) {
        setSelectedColorId(cells[index]);
        setTool("paint");
      }
      return;
    }
    if (!strokeStarted.current) {
      pushUndo();
      strokeStarted.current = true;
    }
    setCells((prev) => {
      const next = prev.slice();
      next[index] = tool === "erase" ? null : selectedColorId;
      return next;
    });
  }

  function undo() {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const prev = stack[stack.length - 1];
      setRedoStack((r) => [...r, cells]);
      setCells(prev);
      return stack.slice(0, -1);
    });
  }

  function redo() {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1];
      setUndoStack((u) => [...u, cells]);
      setCells(next);
      return stack.slice(0, -1);
    });
  }

  function handleGridSizeChange(rawSize: number) {
    const size = clamp(Math.round(rawSize) || MIN_GRID_SIZE, MIN_GRID_SIZE, MAX_GRID_SIZE);
    if (cells.some((c) => c !== null)) {
      if (!window.confirm("Changing grid size clears the current pattern. Continue?")) return;
    }
    setGridWidth(size);
    setGridHeight(size);
    setCells(new Array(size * size).fill(null));
    setUndoStack([]);
    setRedoStack([]);
  }

  async function handleGenerate() {
    if (!imgRef.current || !crop || !naturalSize) return;
    if (hasSavedWork.current && cells.some((c) => c !== null)) {
      if (!window.confirm("This overwrites the current pattern, including any manual touch-ups. Continue?")) {
        return;
      }
    }

    setGenerating(true);
    setBgStatus("idle");

    const scale = naturalSize.w / DISPLAY_WIDTH;
    const sx = Math.round(crop.x * scale);
    const sy = Math.round(crop.y * scale);
    const sw = Math.round(crop.width * scale);
    const sh = Math.round(crop.height * scale);

    const offscreen = document.createElement("canvas");
    offscreen.width = sw;
    offscreen.height = sh;
    const ctx = offscreen.getContext("2d")!;
    ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, sw, sh);
    const imageData = ctx.getImageData(0, 0, sw, sh);

    // Optional Phase 4: person segmentation over the same crop, so cells
    // outside the subject become null (no bead) instead of a wasted color.
    // Runs on the cropped canvas, not the full photo, so mask coordinates
    // already line up with the ImageData used for downsampling below.
    let mask = null;
    if (removeBackground) {
      mask = await segmentSubject(offscreen);
      setBgStatus(mask ? "removed" : "not-found");
    }

    pushUndo();
    const averaged = boxAverageDownsample(imageData, gridWidth, gridHeight);
    const next = averaged.map((rgb, i) => {
      if (mask) {
        const gx = i % gridWidth;
        const gy = Math.floor(i / gridWidth);
        const cx = (gx + 0.5) * (sw / gridWidth);
        const cy = (gy + 0.5) * (sh / gridHeight);
        if (sampleMask(mask, cx, cy, sw, sh) < BACKGROUND_THRESHOLD) return null;
      }
      return nearestBead(rgb, palette).id;
    });
    setCells(next);
    setGenerating(false);
  }

  function handleSave() {
    startSaving(async () => {
      await savePatternAction(orderItemId, gridWidth, gridHeight, cells);
      hasSavedWork.current = true;
      setSaveMessage("Saved");
      setTimeout(() => setSaveMessage(null), 2000);
    });
  }

  // --- crop box drag/resize -------------------------------------------
  function startDrag(mode: "move" | "resize", e: React.PointerEvent) {
    if (!crop) return;
    e.stopPropagation();
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, start: crop };
    cropBoxRef.current?.setPointerCapture(e.pointerId);
  }
  function onDragMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const { mode, startX, startY, start } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (mode === "move") {
      setCrop({
        ...start,
        x: clamp(start.x + dx, 0, DISPLAY_WIDTH - start.width),
        y: clamp(start.y + dy, 0, displayHeight - start.height),
      });
    } else {
      setCrop({
        ...start,
        width: clamp(start.width + dx, 24, DISPLAY_WIDTH - start.x),
        height: clamp(start.height + dy, 24, displayHeight - start.y),
      });
    }
  }
  function endDrag() {
    dragRef.current = null;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* left column: source photo + crop + grid size + bead count */}
        <div className="space-y-4">
          <Panel title="1 · Source photo">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-xs text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-200"
            />
            <button
              onClick={handleUseSample}
              className="mt-2 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
            >
              Use sample photo instead
            </button>

            {imageUrl && naturalSize && crop && (
              <div
                className="relative mt-3 overflow-hidden rounded-md border border-zinc-800 bg-black"
                style={{ width: DISPLAY_WIDTH, height: displayHeight }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" width={DISPLAY_WIDTH} height={displayHeight} className="block" />
                <div
                  ref={cropBoxRef}
                  onPointerDown={(e) => startDrag("move", e)}
                  onPointerMove={onDragMove}
                  onPointerUp={endDrag}
                  className="absolute cursor-move border-2 border-teal-400 bg-teal-400/10"
                  style={{
                    left: crop.x,
                    top: crop.y,
                    width: crop.width,
                    height: crop.height,
                    boxShadow: "0 0 0 2000px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    onPointerDown={(e) => startDrag("resize", e)}
                    onPointerMove={onDragMove}
                    onPointerUp={endDrag}
                    className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-full border-2 border-zinc-950 bg-teal-400"
                  />
                </div>
              </div>
            )}
            <p className="mt-2 text-[11px] leading-snug text-zinc-500">
              {detecting
                ? "Detecting a face…"
                : faceStatus === "found"
                  ? "Face detected — crop box padded automatically. Drag to adjust, resize from the corner."
                  : faceStatus === "not-found"
                    ? "No face detected — draw the crop box manually."
                    : "Upload a photo, or try the sample."}
            </p>
          </Panel>

          <Panel title="2 · Grid size">
            <div className="flex gap-1.5">
              {SIZE_TIERS.map((tier) => (
                <button
                  key={tier.name}
                  onClick={() => handleGridSizeChange(tier.defaultSize)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-center text-xs font-semibold transition ${
                    tierForSize(gridWidth).name === tier.name
                      ? "bg-teal-500 text-zinc-950"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {tier.name}
                  <span className="block font-normal opacity-80">{tier.cmRange}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min={MIN_GRID_SIZE}
                max={MAX_GRID_SIZE}
                value={gridWidth}
                onChange={(e) => handleGridSizeChange(Number(e.target.value))}
                className="w-20 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100"
              />
              <span className="text-xs text-zinc-500">
                × {gridWidth} grid — {tierForSize(gridWidth).name} tier ({tierForSize(gridWidth).cmRange})
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-zinc-500">
              {tierForSize(gridWidth).examples}. Below ~20×20, facial detail starts disappearing (eyes go
              first) — fine for sprites and logos, but faces read best at Medium or larger.
            </p>

            <label className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={removeBackground}
                onChange={(e) => setRemoveBackground(e.target.checked)}
              />
              Remove background
            </label>
            <p className="mt-1 text-[11px] leading-snug text-zinc-500">
              {generating && removeBackground
                ? "Finding the subject…"
                : bgStatus === "removed"
                  ? "Background cells set to no-bead — recognizable, but no wasted beads."
                  : bgStatus === "not-found"
                    ? "No clear subject found — kept the full crop, background included."
                    : "Cells outside the subject become empty instead of a wasted color."}
            </p>

            <button
              onClick={handleGenerate}
              disabled={!imageUrl || !crop || generating}
              className="mt-3 w-full rounded-md bg-teal-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-teal-400 disabled:opacity-40"
            >
              {generating ? "Generating…" : <>Generate pattern &rarr;</>}
            </button>
          </Panel>

          <Panel title="Bead count">
            <BeadCountSummary cells={cells} palette={palette} />
          </Panel>
        </div>

        {/* right column: touch-up editor */}
        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              3 · Touch up
            </p>
            <div className="flex gap-1.5">
              <ToolButton onClick={undo} disabled={undoStack.length === 0}>Undo</ToolButton>
              <ToolButton onClick={redo} disabled={redoStack.length === 0}>Redo</ToolButton>
              <ToolButton onClick={() => window.print()}>Print view</ToolButton>
              <ToolButton onClick={handleSave} disabled={saving} accent>
                {saving ? "Saving…" : saveMessage ?? "Save"}
              </ToolButton>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToolButton onClick={() => setTool(tool === "eyedrop" ? "paint" : "eyedrop")} active={tool === "eyedrop"}>
              Eyedropper
            </ToolButton>
            <ToolButton onClick={() => setTool(tool === "erase" ? "paint" : "erase")} active={tool === "erase"}>
              Eraser
            </ToolButton>
            <label className="ml-auto flex items-center gap-1.5 text-xs text-zinc-400">
              <input type="checkbox" checked={showBorders} onChange={(e) => setShowBorders(e.target.checked)} />
              cell borders
            </label>
            <label className="flex items-center gap-1.5 text-xs text-zinc-400">
              <input type="checkbox" checked={showNumbers} onChange={(e) => setShowNumbers(e.target.checked)} />
              row/col numbers
            </label>
            <label className="flex items-center gap-1.5 text-xs text-zinc-400">
              <input type="checkbox" checked={showCodes} onChange={(e) => setShowCodes(e.target.checked)} />
              bead codes
            </label>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {palette.map((color) => (
              <button
                key={color.id}
                title={color.name}
                onClick={() => {
                  setSelectedColorId(color.id);
                  setTool("paint");
                }}
                className={`h-7 w-7 rounded-md border-2 ${
                  selectedColorId === color.id && tool === "paint" ? "border-teal-400" : "border-transparent"
                }`}
                style={{ background: color.hex }}
              />
            ))}
          </div>

          <div className="overflow-auto rounded-md border border-zinc-800">
            <PatternGrid
              gridWidth={gridWidth}
              gridHeight={gridHeight}
              cells={cells}
              palette={palette}
              showBorders={showBorders}
              onCellInteract={handleCellInteract}
            />
          </div>
        </div>
      </div>

      <PrintSheet
        title={`Bead pattern — ${itemDescription}`}
        gridWidth={gridWidth}
        gridHeight={gridHeight}
        cells={cells}
        palette={palette}
        showNumbers={showNumbers}
        showCodes={showCodes}
      />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</p>
      {children}
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
  active,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40 ${
        accent
          ? "bg-teal-500 text-zinc-950 hover:bg-teal-400"
          : active
            ? "bg-teal-500 text-zinc-950"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

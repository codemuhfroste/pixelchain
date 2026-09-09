"use client";

import { useEffect, useRef } from "react";

type PaletteColor = { id: string; hex: string };

export function PatternGrid({
  gridWidth,
  gridHeight,
  cells,
  palette,
  showBorders,
  onCellInteract,
}: {
  gridWidth: number;
  gridHeight: number;
  cells: (string | null)[];
  palette: PaletteColor[];
  showBorders: boolean;
  onCellInteract: (index: number) => void;
}) {
  const isDownRef = useRef(false);

  useEffect(() => {
    function up() {
      isDownRef.current = false;
    }
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  const hexById = new Map(palette.map((c) => [c.id, c.hex]));

  return (
    <div
      className="grid aspect-square w-full max-w-[560px] cursor-pointer select-none"
      style={{
        gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
        gridTemplateRows: `repeat(${gridHeight}, 1fr)`,
      }}
    >
      {cells.map((colorId, i) => (
        <div
          key={i}
          onPointerDown={() => {
            isDownRef.current = true;
            onCellInteract(i);
          }}
          onPointerEnter={() => {
            if (isDownRef.current) onCellInteract(i);
          }}
          style={{
            background: colorId ? hexById.get(colorId) : "transparent",
            outline: showBorders ? "1px solid rgba(0,0,0,0.15)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

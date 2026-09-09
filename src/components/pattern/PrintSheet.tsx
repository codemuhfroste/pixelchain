type PaletteColor = { id: string; name: string; code: string | null; hex: string };

const CELL_PX = 18;

export function PrintSheet({
  title,
  gridWidth,
  gridHeight,
  cells,
  palette,
  showNumbers,
  showCodes,
}: {
  title: string;
  gridWidth: number;
  gridHeight: number;
  cells: (string | null)[];
  palette: PaletteColor[];
  showNumbers: boolean;
  showCodes: boolean;
}) {
  const byId = new Map(palette.map((c) => [c.id, c]));
  const cols = showNumbers ? gridWidth + 1 : gridWidth;

  const gridCells: React.ReactNode[] = [];

  if (showNumbers) {
    gridCells.push(<HeaderCell key="corner" />);
    for (let c = 0; c < gridWidth; c++) {
      gridCells.push(<HeaderCell key={`col-${c}`}>{c + 1}</HeaderCell>);
    }
  }

  for (let r = 0; r < gridHeight; r++) {
    if (showNumbers) gridCells.push(<HeaderCell key={`row-${r}`}>{r + 1}</HeaderCell>);
    for (let c = 0; c < gridWidth; c++) {
      const i = r * gridWidth + c;
      const color = cells[i] ? byId.get(cells[i]!) : undefined;
      gridCells.push(
        <div
          key={`cell-${i}`}
          className="flex items-center justify-center border border-zinc-400 text-[6px] leading-none text-black"
          style={{ width: CELL_PX, height: CELL_PX, background: color?.hex ?? "#fff" }}
        >
          {showCodes ? color?.code : ""}
        </div>,
      );
    }
  }

  return (
    <div id="print-area" className="hidden bg-white p-6 text-black print:block">
      <h2 className="mb-1 text-base font-semibold">{title}</h2>
      <p className="mb-3 text-xs text-zinc-600">
        {gridWidth} × {gridHeight} grid
      </p>
      <div className="grid w-max" style={{ gridTemplateColumns: `repeat(${cols}, ${CELL_PX}px)` }}>
        {gridCells}
      </div>
    </div>
  );
}

function HeaderCell({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-center text-[6px] font-semibold text-zinc-500"
      style={{ width: CELL_PX, height: CELL_PX }}
    >
      {children}
    </div>
  );
}

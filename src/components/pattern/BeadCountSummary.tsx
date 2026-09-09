type PaletteColor = { id: string; name: string; hex: string };

export function BeadCountSummary({
  cells,
  palette,
}: {
  cells: (string | null)[];
  palette: PaletteColor[];
}) {
  const counts = new Map<string, number>();
  for (const id of cells) {
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const byId = new Map(palette.map((c) => [c.id, c]));
  const total = rows.reduce((sum, [, n]) => sum + n, 0);

  if (rows.length === 0) {
    return <p className="text-xs text-zinc-500">Generate a pattern to see the bead count.</p>;
  }

  return (
    <div className="space-y-1 text-xs">
      {rows.map(([id, n]) => {
        const color = byId.get(id);
        return (
          <div key={id} className="flex items-center justify-between border-t border-zinc-800 py-1.5 first:border-0">
            <span className="flex items-center gap-2 text-zinc-300">
              <span className="h-3 w-3 rounded-sm" style={{ background: color?.hex ?? "#888" }} />
              {color?.name ?? "unknown"}
            </span>
            <span className="font-mono text-zinc-300">{n}</span>
          </div>
        );
      })}
      <div className="flex items-center justify-between border-t-2 border-zinc-700 pt-1.5 font-semibold text-zinc-100">
        <span>Total beads</span>
        <span className="font-mono">{total}</span>
      </div>
    </div>
  );
}

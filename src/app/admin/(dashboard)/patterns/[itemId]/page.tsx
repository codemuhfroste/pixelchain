import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPhotoUrl } from "@/lib/storage";
import { PatternEditor } from "@/components/pattern/PatternEditor";

export default async function PatternPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const item = await prisma.orderItem.findUnique({
    where: { id: itemId },
    include: { pattern: true },
  });
  if (!item) notFound();

  const palette = await prisma.beadColor.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-4">
      <Link href={`/admin/orders/${item.orderId}`} className="text-xs text-zinc-500 transition hover:text-zinc-300">
        &larr; back to order
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Pattern generator</h1>
        <p className="text-xs text-zinc-500">{item.description}</p>
      </div>

      {palette.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 px-8 py-14 text-center text-sm text-zinc-400">
          No bead colors yet.{" "}
          <Link href="/admin/palette" className="text-teal-400 hover:underline">
            Add some to the palette
          </Link>{" "}
          before generating a pattern.
        </div>
      ) : (
        <PatternEditor
          orderItemId={item.id}
          itemDescription={item.description}
          initialPhotoUrl={item.referencePhotoPath ? getPhotoUrl(item.referencePhotoPath) : null}
          palette={palette}
          existingPattern={
            item.pattern
              ? {
                  gridWidth: item.pattern.gridWidth,
                  gridHeight: item.pattern.gridHeight,
                  cells: item.pattern.cells as (string | null)[],
                }
              : null
          }
        />
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { AddColorForm, PaletteGrid } from "@/components/admin/PaletteManager";

export default async function AdminPalettePage() {
  const colors = await prisma.beadColor.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Bead palette</h1>
        <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-500">
          For patterns to look right, photograph your actual bead jars under neutral
          light and sample the hex values from that photo — manufacturer color charts
          don&apos;t match what&apos;s physically in the jar, and this is the single
          biggest factor in whether generated patterns look right.
        </p>
      </div>
      <AddColorForm />
      <PaletteGrid colors={colors} />
    </div>
  );
}

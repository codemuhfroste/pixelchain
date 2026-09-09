"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";

// Called directly from the pattern editor's client-side event handlers
// (save, undo-triggered autosave) rather than through a <form> — the
// payload is a cell array, not form fields.
export async function savePatternAction(
  orderItemId: string,
  gridWidth: number,
  gridHeight: number,
  cells: (string | null)[],
) {
  await requireAdminSession();

  const item = await prisma.orderItem.findUnique({ where: { id: orderItemId } });
  if (!item) throw new Error("Order item not found");

  const pattern = await prisma.pattern.upsert({
    where: { id: item.patternId ?? "" },
    update: { gridWidth, gridHeight, cells },
    create: { gridWidth, gridHeight, cells },
  });

  if (!item.patternId) {
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { patternId: pattern.id },
    });
  }

  revalidatePath(`/admin/orders/${item.orderId}`);
  revalidatePath(`/admin/patterns/${orderItemId}`);
}

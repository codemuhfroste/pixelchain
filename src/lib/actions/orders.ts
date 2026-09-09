"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { savePhoto } from "@/lib/storage";
import { requireAdminSession, requireMemberSession } from "@/lib/auth/session";
import type { FormState } from "./auth";

const STATUSES = [
  "inquiry",
  "confirmed",
  "in_progress",
  "ready",
  "delivered",
  "cancelled",
] as const;

// --- admin: type in an order after a Messenger conversation ---------------
export async function createOrderManualAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const customerName = String(formData.get("customerName") ?? "").trim();
  const contactHandle = String(formData.get("contactHandle") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);
  const totalPrice = Number(formData.get("totalPrice") ?? 0) || 0;
  const dueDateRaw = String(formData.get("dueDate") ?? "");

  if (!customerName || !description) {
    return { error: "Customer name and item description are required." };
  }

  let customer = await prisma.customer.findFirst({
    where: { name: { equals: customerName } },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { name: customerName, contactHandle: contactHandle || null },
    });
  }

  const order = await prisma.order.create({
    data: {
      customerId: customer.id,
      status: "confirmed",
      source: "manual",
      totalPrice,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      items: { create: [{ description, quantity }] },
    },
  });

  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${order.id}`);
}

// --- member: request an order from their own account -----------------------
export async function createMemberOrderAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireMemberSession();

  const description = String(formData.get("description") ?? "").trim();
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);
  const photo = formData.get("photo");

  if (!description) {
    return { error: "Describe what you'd like made." };
  }

  let referencePhotoPath: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    referencePhotoPath = await savePhoto(photo);
  }

  const order = await prisma.order.create({
    data: {
      customerId: session.customerId,
      status: "inquiry",
      source: "public_form",
      items: { create: [{ description, quantity, referencePhotoPath }] },
    },
  });

  revalidatePath("/account");
  redirect(`/account?created=${order.id}`);
}

// --- admin: order detail mutations -----------------------------------------
export async function setOrderStatusAction(orderId: string, status: string) {
  await requireAdminSession();
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    throw new Error("Invalid status");
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as (typeof STATUSES)[number] },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function updateOrderDetailsAction(
  orderId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const totalPrice = Number(formData.get("totalPrice") ?? 0) || 0;
  const amountPaid = Number(formData.get("amountPaid") ?? 0) || 0;
  const dueDateRaw = String(formData.get("dueDate") ?? "");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      totalPrice,
      amountPaid,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import type { FormState } from "./auth";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export async function addBeadColorAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const hex = String(formData.get("hex") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (!HEX_RE.test(hex)) return { error: "Hex must look like #A1B2C3." };

  await prisma.beadColor.create({ data: { name, code: code || null, hex } });
  revalidatePath("/admin/palette");
  return {};
}

export async function updateBeadColorAction(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const hex = String(formData.get("hex") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (!HEX_RE.test(hex)) return { error: "Hex must look like #A1B2C3." };

  await prisma.beadColor.update({
    where: { id },
    data: { name, code: code || null, hex },
  });
  revalidatePath("/admin/palette");
  return {};
}

export async function deleteBeadColorAction(id: string) {
  await requireAdminSession();
  await prisma.beadColor.delete({ where: { id } });
  revalidatePath("/admin/palette");
}

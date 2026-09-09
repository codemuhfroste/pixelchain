import type { Prisma } from "@/generated/prisma/client";

export function formatMoney(value: Prisma.Decimal | number | string): string {
  return `₱${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(value: Date | string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function isOverdue(dueDate: Date | string | null, status: string): boolean {
  if (!dueDate) return false;
  if (status === "delivered" || status === "cancelled") return false;
  return new Date(dueDate).getTime() < Date.now();
}

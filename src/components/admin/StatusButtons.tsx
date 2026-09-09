"use client";

import { useTransition } from "react";
import { setOrderStatusAction } from "@/lib/actions/orders";
import { statusLabel } from "@/components/StatusPill";

const STATUSES = [
  "inquiry",
  "confirmed",
  "in_progress",
  "ready",
  "delivered",
  "cancelled",
] as const;

export function StatusButtons({ orderId, current }: { orderId: string; current: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((status) => (
        <button
          key={status}
          disabled={pending}
          onClick={() => startTransition(() => setOrderStatusAction(orderId, status))}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
            current === status
              ? "bg-teal-500 text-zinc-950"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-100"
          }`}
        >
          {statusLabel(status)}
        </button>
      ))}
    </div>
  );
}

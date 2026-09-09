"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createOrderManualAction } from "@/lib/actions/orders";
import type { FormState } from "@/lib/actions/auth";
import { AdminField, AdminErrorMessage, AdminSubmitButton } from "@/components/forms/AdminField";

const initialState: FormState = {};

export default function NewAdminOrderPage() {
  const [state, action, pending] = useActionState(createOrderManualAction, initialState);

  return (
    <div className="max-w-md space-y-5">
      <Link href="/admin/orders" className="text-xs text-zinc-500 transition hover:text-zinc-300">
        &larr; all orders
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">New order</h1>
        <p className="text-xs text-zinc-500">Typed in after a Messenger chat</p>
      </div>
      <form
        action={action}
        className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <AdminField label="Customer name" name="customerName" required placeholder="e.g. Liza Reyes" />
        <AdminField
          label="Messenger / contact"
          name="contactHandle"
          placeholder="Messenger name or phone"
        />
        <AdminField
          label="Item description"
          name="description"
          required
          placeholder="e.g. keychain — orange tabby cat"
        />
        <div className="grid grid-cols-2 gap-3">
          <AdminField label="Quantity" name="quantity" type="number" min="1" defaultValue={1} />
          <AdminField label="Price (₱)" name="totalPrice" type="number" min="0" step="0.01" defaultValue={150} />
        </div>
        <AdminField label="Due date" name="dueDate" type="date" />
        <AdminErrorMessage message={state.error} />
        <AdminSubmitButton pending={pending} pendingLabel="Creating…">
          Create order
        </AdminSubmitButton>
      </form>
    </div>
  );
}

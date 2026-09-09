"use client";

import { useActionState } from "react";
import { updateOrderDetailsAction } from "@/lib/actions/orders";
import type { FormState } from "@/lib/actions/auth";
import { AdminField, AdminSubmitButton, AdminErrorMessage } from "@/components/forms/AdminField";

const initialState: FormState = {};

export function OrderMoneyForm({
  orderId,
  totalPrice,
  amountPaid,
  dueDate,
}: {
  orderId: string;
  totalPrice: number;
  amountPaid: number;
  dueDate: string | null;
}) {
  const boundAction = updateOrderDetailsAction.bind(null, orderId);
  const [state, action, pending] = useActionState(boundAction, initialState);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <AdminField
        label="Total price (₱)"
        name="totalPrice"
        type="number"
        step="0.01"
        min="0"
        defaultValue={totalPrice}
      />
      <AdminField
        label="Amount paid (₱)"
        name="amountPaid"
        type="number"
        step="0.01"
        min="0"
        defaultValue={amountPaid}
      />
      <AdminField label="Due date" name="dueDate" type="date" defaultValue={dueDate ?? ""} />
      <AdminSubmitButton pending={pending} pendingLabel="Saving…">
        Save
      </AdminSubmitButton>
      {state.error && <AdminErrorMessage message={state.error} />}
    </form>
  );
}

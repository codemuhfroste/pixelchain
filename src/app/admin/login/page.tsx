"use client";

import { useActionState } from "react";
import { adminLoginAction, type FormState } from "@/lib/actions/auth";
import { AdminField, AdminErrorMessage, AdminSubmitButton } from "@/components/forms/AdminField";
import { Mark } from "@/components/Mark";

const initialState: FormState = {};

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminLoginAction, initialState);

  return (
    <div className="pegboard-bg relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 text-zinc-900">
      <div className="relative w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Mark size={40} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-400">
              Admin console
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">Sign in</h1>
          </div>
        </div>
        <form
          action={action}
          className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-lg shadow-black/20 backdrop-blur-sm"
        >
          <AdminField label="Email" name="email" type="email" required />
          <AdminField label="Password" name="password" type="password" required />
          <AdminErrorMessage message={state.error} />
          <div className="[&>button]:w-full">
            <AdminSubmitButton pending={pending} pendingLabel="Signing in…">
              Enter console
            </AdminSubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { memberLoginAction, type FormState } from "@/lib/actions/auth";
import { Field, ErrorMessage, SubmitButton } from "@/components/forms/Field";
import { Mark } from "@/components/Mark";

const initialState: FormState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(memberLoginAction, initialState);

  return (
    <div className="pegboard-bg relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-6 text-zinc-200 dark:bg-zinc-950 dark:text-zinc-900">
      <div className="relative w-full max-w-sm space-y-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <Mark size={40} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Log in to track your order.
            </p>
          </div>
        </div>

        <form
          action={action}
          className="space-y-4 rounded-xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90"
        >
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          <ErrorMessage message={state.error} />
          <SubmitButton pending={pending} pendingLabel="Logging in…">
            Log in
          </SubmitButton>
        </form>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          No account yet?{" "}
          <Link href="/register" className="font-medium text-teal-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { memberRegisterAction, type FormState } from "@/lib/actions/auth";
import { Field, ErrorMessage, SubmitButton } from "@/components/forms/Field";
import { Mark } from "@/components/Mark";

const initialState: FormState = {};

export default function RegisterPage() {
  const [state, action, pending] = useActionState(memberRegisterAction, initialState);
  const [type, setType] = useState<"individual" | "organization">("individual");

  return (
    <div className="pegboard-bg relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-6 py-10 text-zinc-200 dark:bg-zinc-950 dark:text-zinc-900">
      <div className="relative w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Mark size={40} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create an account
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Track your order and message the maker less.
            </p>
          </div>
        </div>
        <form
          action={action}
          className="space-y-4 rounded-xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90"
        >
          <div className="space-y-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Account type
            </span>
            <div className="flex gap-2">
              {(["individual", "organization"] as const).map((option) => (
                <label
                  key={option}
                  className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm capitalize transition ${
                    type === option
                      ? "border-teal-600 bg-teal-50 font-medium text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                      : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={option}
                    checked={type === option}
                    onChange={() => setType(option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <Field label="Full name" name="name" required />
          {type === "organization" && (
            <Field label="Organization name" name="orgName" required />
          )}
          <Field
            label="Messenger name / phone"
            name="contactHandle"
            placeholder="how you'll be found on Facebook"
          />
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />

          <ErrorMessage message={state.error} />
          <SubmitButton pending={pending} pendingLabel="Creating account…">
            Create account
          </SubmitButton>
        </form>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-teal-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

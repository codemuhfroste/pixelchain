"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { createMemberOrderAction } from "@/lib/actions/orders";
import type { FormState } from "@/lib/actions/auth";
import { Field, TextareaField, ErrorMessage, SubmitButton } from "@/components/forms/Field";

const initialState: FormState = {};

// Stays comfortably under next.config.ts's Server Action bodySizeLimit
// (10mb) to leave room for multipart overhead, and to fail with a clear
// message here instead of Next's raw "Body exceeded limit" error page.
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export default function NewMemberOrderPage() {
  const [state, action, pending] = useActionState(createMemberOrderAction, initialState);
  const [photoError, setPhotoError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_PHOTO_BYTES) {
      setPhotoError(
        `That photo is ${(file.size / (1024 * 1024)).toFixed(1)}MB — please pick one under ${MAX_PHOTO_BYTES / (1024 * 1024)}MB.`,
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setPhotoError(undefined);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Link href="/account" className="text-xs text-zinc-500 hover:underline dark:text-zinc-400">
        &larr; back to my orders
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Request a keychain
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          This creates an inquiry — the maker will confirm price and timeline with you.
        </p>
      </div>
      <form
        action={action}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <TextareaField
          label="Description"
          name="description"
          required
          placeholder="e.g. keychain of my dog, golden retriever"
        />
        <Field label="Quantity" name="quantity" type="number" min="1" defaultValue={1} />
        <label className="block space-y-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Reference photo (optional)
          </span>
          <input
            ref={fileInputRef}
            name="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:text-zinc-400 dark:file:bg-zinc-800"
          />
          <span className="block text-xs text-zinc-400">Up to {MAX_PHOTO_BYTES / (1024 * 1024)}MB.</span>
        </label>
        <ErrorMessage message={photoError} />
        <ErrorMessage message={state.error} />
        <SubmitButton pending={pending} disabled={!!photoError} pendingLabel="Submitting…">
          Submit request
        </SubmitButton>
      </form>
    </div>
  );
}

"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addBeadColorAction,
  updateBeadColorAction,
  deleteBeadColorAction,
} from "@/lib/actions/palette";
import type { FormState } from "@/lib/actions/auth";
import { AdminField, AdminSubmitButton, AdminErrorMessage } from "@/components/forms/AdminField";

type BeadColor = { id: string; name: string; code: string | null; hex: string };

const initialState: FormState = {};

export function AddColorForm() {
  const [state, action, pending] = useActionState(addBeadColorAction, initialState);
  const [hex, setHex] = useState("#CCCCCC");

  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
    >
      <label className="space-y-1 text-sm">
        <span className="font-medium text-zinc-300">Color</span>
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="block h-9 w-14 cursor-pointer rounded-md border border-zinc-700 bg-zinc-950"
        />
      </label>
      <input type="hidden" name="hex" value={hex} />
      <AdminField label="Name" name="name" required placeholder="e.g. Cream" />
      <AdminField label="Manufacturer code" name="code" placeholder="e.g. H10" />
      <AdminSubmitButton pending={pending} pendingLabel="Adding…">
        + Add color
      </AdminSubmitButton>
      {state.error && <AdminErrorMessage message={state.error} />}
    </form>
  );
}

export function PaletteGrid({ colors }: { colors: BeadColor[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (colors.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 px-8 py-14 text-center text-sm text-zinc-500">
        No colors yet — add your first bead color above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {colors.map((color) =>
        editingId === color.id ? (
          <EditColorCard key={color.id} color={color} onDone={() => setEditingId(null)} />
        ) : (
          <SwatchCard key={color.id} color={color} onEdit={() => setEditingId(color.id)} />
        ),
      )}
    </div>
  );
}

function SwatchCard({ color, onEdit }: { color: BeadColor; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700">
      <div className="h-16 transition group-hover:brightness-110" style={{ background: color.hex }} />
      <div className="space-y-0.5 p-2.5 text-xs">
        <p className="font-semibold text-zinc-100">{color.name}</p>
        <p className="font-mono text-zinc-500">
          {color.code || "—"} · {color.hex}
        </p>
      </div>
      <div className="flex border-t border-zinc-800 text-xs font-semibold">
        <button onClick={onEdit} className="flex-1 py-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100">
          Edit
        </button>
        <button
          disabled={pending}
          onClick={() => startTransition(() => deleteBeadColorAction(color.id))}
          className="flex-1 border-l border-zinc-800 py-1.5 text-zinc-400 transition hover:bg-red-950 hover:text-red-400 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function EditColorCard({ color, onDone }: { color: BeadColor; onDone: () => void }) {
  const [hex, setHex] = useState(color.hex);
  const [name, setName] = useState(color.name);
  const [code, setCode] = useState(color.code ?? "");
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function save() {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("code", code);
    formData.set("hex", hex);
    startTransition(async () => {
      const result = await updateBeadColorAction(color.id, initialState, formData);
      if (result.error) setError(result.error);
      else onDone();
    });
  }

  return (
    <div className="col-span-2 space-y-2 rounded-xl border border-teal-700 bg-zinc-900 p-3 sm:col-span-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-zinc-950"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100"
        />
      </div>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Manufacturer code"
        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100"
      />
      {error && <AdminErrorMessage message={error} />}
      <div className="flex gap-2 text-xs font-semibold">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="flex-1 rounded-md bg-teal-500 py-1.5 text-zinc-950 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-md bg-zinc-800 py-1.5 text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

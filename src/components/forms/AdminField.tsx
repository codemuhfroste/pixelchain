export function AdminField({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  step?: string;
  min?: string | number;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-zinc-300">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
      />
    </label>
  );
}

export function AdminSubmitButton({
  pending,
  children,
  pendingLabel,
}: {
  pending: boolean;
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-teal-400 disabled:opacity-50"
    >
      {pending ? (pendingLabel ?? "Saving…") : children}
    </button>
  );
}

export function AdminErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-400">{message}</p>
  );
}

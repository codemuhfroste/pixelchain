const STYLES: Record<string, string> = {
  inquiry: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  confirmed: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  in_progress: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  ready: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  delivered: "bg-zinc-100 text-zinc-400 line-through dark:bg-zinc-800 dark:text-zinc-500",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const DOTS: Record<string, string> = {
  inquiry: "bg-zinc-400 dark:bg-zinc-500",
  confirmed: "bg-teal-500",
  in_progress: "bg-amber-500",
  ready: "bg-emerald-500",
  delivered: "bg-zinc-400 dark:bg-zinc-500",
  cancelled: "bg-red-500",
};

export function statusLabel(status: string) {
  return status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status] ?? STYLES.inquiry}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[status] ?? DOTS.inquiry}`} />
      {statusLabel(status)}
    </span>
  );
}

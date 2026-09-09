// A small icon-only mark — a 2x2 bead grid — used in place of a wordmark.
// No product name anywhere in the app; this is the only recurring visual
// anchor, so it stays intentionally plain.
export function Mark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-teal-600 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
        <circle cx="4" cy="4" r="2.4" fill="white" fillOpacity="0.95" />
        <circle cx="12" cy="4" r="2.4" fill="white" fillOpacity="0.65" />
        <circle cx="4" cy="12" r="2.4" fill="white" fillOpacity="0.65" />
        <circle cx="12" cy="12" r="2.4" fill="white" fillOpacity="0.95" />
      </svg>
    </span>
  );
}

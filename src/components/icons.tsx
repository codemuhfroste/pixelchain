type IconProps = { className?: string };

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function OrdersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M8.5 11h7M8.5 15h7M8.5 19h4" />
    </svg>
  );
}

export function CustomersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.7-3.4 3-5.2 5.5-5.2s4.8 1.8 5.5 5.2" />
      <path d="M15.5 5.3a3.2 3.2 0 0 1 0 6.2" />
      <path d="M16 14.9c2.3.4 4 2.1 4.5 5.1" />
    </svg>
  );
}

export function PaletteIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3a9 8 0 1 0 0 16c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.7-1.6h1.9c1.6 0 2.6-1.6 2.1-3A9 8 0 0 0 12 3Z" />
      <circle cx="7.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7.3" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.3" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

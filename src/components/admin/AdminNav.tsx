"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrdersIcon, CustomersIcon, PaletteIcon } from "@/components/icons";

const NAV = [
  { href: "/admin/orders", label: "Orders", Icon: OrdersIcon },
  { href: "/admin/customers", label: "Customers", Icon: CustomersIcon },
  { href: "/admin/palette", label: "Bead palette", Icon: PaletteIcon },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition ${
              active
                ? "bg-teal-500/15 text-teal-300"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            <Icon className={active ? "text-teal-400" : "text-zinc-500"} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

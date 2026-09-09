import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusPill, statusLabel } from "@/components/StatusPill";
import { formatMoney, formatDate, isOverdue } from "@/lib/format";

const STATUSES = [
  "inquiry",
  "confirmed",
  "in_progress",
  "ready",
  "delivered",
  "cancelled",
] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string }>;
}) {
  const { status, sort = "due_asc" } = await searchParams;

  const orders = await prisma.order.findMany({
    where: status ? { status: status as (typeof STATUSES)[number] } : undefined,
    include: { customer: true, items: true },
    orderBy: sort === "created_desc" ? { createdAt: "desc" } : undefined,
  });

  // Prisma can't order NULLs last across every DB the same way we want
  // here, so due-date sort (the default — "what needs work today") is done
  // in memory: soonest due date first, orders with no due date pushed last.
  if (sort !== "created_desc") {
    orders.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Orders</h1>
          <p className="text-xs text-zinc-500">What needs work today</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="shrink-0 rounded-md bg-teal-500 px-3.5 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-teal-400 hover:shadow"
        >
          + New order (manual entry)
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <FilterTab label="All" status={undefined} active={!status} sort={sort} />
          {STATUSES.map((s) => (
            <FilterTab key={s} label={statusLabel(s)} status={s} active={status === s} sort={sort} />
          ))}
        </div>
        <div className="flex gap-1.5 text-xs">
          <SortLink label="Due date" value="due_asc" active={sort !== "created_desc"} status={status} />
          <SortLink label="Newest" value="created_desc" active={sort === "created_desc"} status={status} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Balance due</th>
              <th className="px-4 py-3 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  No orders match this filter.
                </td>
              </tr>
            )}
            {orders.map((order) => {
              const balance = Number(order.totalPrice) - Number(order.amountPaid);
              const overdue = isOverdue(order.dueDate, order.status);
              const item = order.items[0];
              return (
                <tr
                  key={order.id}
                  className="group border-b border-zinc-800/60 transition last:border-0 hover:bg-zinc-900"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center gap-2.5 font-medium text-zinc-100 group-hover:text-teal-400"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-400 group-hover:bg-teal-500/20 group-hover:text-teal-300">
                        {order.customer.name.charAt(0).toUpperCase()}
                      </span>
                      {order.customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {item?.description}
                    {order.items.length > 1 && (
                      <span className="ml-1 text-zinc-500">+{order.items.length - 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={order.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-300">
                    {formatDate(order.dueDate)}
                    {overdue && (
                      <span className="ml-2 rounded-full bg-red-950 px-2 py-0.5 text-xs font-semibold text-red-400">
                        overdue
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 font-mono ${
                      balance > 0 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {formatMoney(balance)}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {order.source === "public_form" ? "customer portal" : "manual entry"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterTab({
  label,
  status,
  active,
  sort,
}: {
  label: string;
  status: string | undefined;
  active: boolean;
  sort: string;
}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (sort !== "due_asc") params.set("sort", sort);
  const href = `/admin/orders${params.size ? `?${params}` : ""}`;
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        active ? "bg-teal-500 text-zinc-950" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
      }`}
    >
      {label}
    </Link>
  );
}

function SortLink({
  label,
  value,
  active,
  status,
}: {
  label: string;
  value: string;
  active: boolean;
  status: string | undefined;
}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (value !== "due_asc") params.set("sort", value);
  const href = `/admin/orders${params.size ? `?${params}` : ""}`;
  return (
    <Link
      href={href}
      className={`rounded-md px-2.5 py-1.5 font-medium ${
        active ? "bg-zinc-800 text-teal-400" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </Link>
  );
}

import Link from "next/link";
import { getMemberSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StatusPill } from "@/components/StatusPill";
import { formatMoney, formatDate } from "@/lib/format";

const STATUS_ACCENT: Record<string, string> = {
  inquiry: "bg-zinc-300 dark:bg-zinc-700",
  confirmed: "bg-teal-500",
  in_progress: "bg-amber-500",
  ready: "bg-emerald-500",
  delivered: "bg-zinc-300 dark:bg-zinc-700",
  cancelled: "bg-red-400",
};

export default async function AccountDashboard() {
  const session = await getMemberSession();
  const customer = await prisma.customer.findUnique({ where: { id: session!.customerId } });
  const orders = await prisma.order.findMany({
    where: { customerId: session!.customerId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
            My orders
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back, {customer?.name.split(" ")[0]}
          </h1>
        </div>
        <Link
          href="/account/orders/new"
          className="shrink-0 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 hover:shadow"
        >
          + Request an order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 px-8 py-14 text-center dark:border-zinc-700">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="4.5" />
              <path d="M12.2 12.2 20 20" />
              <path d="M9 7.5v3l2 1" />
            </svg>
          </div>
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
            No orders yet. Once you request a keychain it&apos;ll show up here with
            its status and balance due.
          </p>
          <Link
            href="/account/orders/new"
            className="mt-1 text-sm font-medium text-teal-600 hover:underline"
          >
            Request your first keychain &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const balance = Number(order.totalPrice) - Number(order.amountPaid);
            const primaryItem = order.items[0];
            return (
              <div
                key={order.id}
                className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className={`w-1.5 shrink-0 ${STATUS_ACCENT[order.status] ?? "bg-zinc-300"}`} />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {primaryItem?.description}
                        {order.items.length > 1 && (
                          <span className="ml-1 text-xs font-normal text-zinc-500">
                            +{order.items.length - 1} more
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-zinc-400">
                        order #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <StatusPill status={order.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      Due <b className="font-mono text-zinc-800 dark:text-zinc-200">{formatDate(order.dueDate)}</b>
                    </span>
                    <span>
                      Total <b className="font-mono text-zinc-800 dark:text-zinc-200">{formatMoney(order.totalPrice)}</b>
                    </span>
                    <span>
                      Paid <b className="font-mono text-zinc-800 dark:text-zinc-200">{formatMoney(order.amountPaid)}</b>
                    </span>
                    <span>
                      Balance{" "}
                      <b
                        className={`font-mono ${
                          balance > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatMoney(balance)}
                      </b>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

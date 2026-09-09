import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusPill } from "@/components/StatusPill";
import { StatusButtons } from "@/components/admin/StatusButtons";
import { OrderMoneyForm } from "@/components/admin/OrderMoneyForm";
import { formatMoney } from "@/lib/format";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: { include: { pattern: true } } },
  });
  if (!order) notFound();

  const balance = Number(order.totalPrice) - Number(order.amountPaid);

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 transition hover:text-zinc-300"
      >
        &larr; all orders
      </Link>

      <div className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300">
              {order.customer.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-mono text-xs text-zinc-500">order #{order.id.slice(0, 8)}</p>
              <h1 className="mt-0.5 flex items-center gap-2 text-lg font-semibold text-zinc-50">
                {order.customer.name}
                {order.customer.type === "organization" && (
                  <span className="rounded-full bg-teal-950 px-2 py-0.5 text-xs font-semibold text-teal-300">
                    org
                  </span>
                )}
              </h1>
              {order.customer.contactHandle && (
                <p className="text-xs text-zinc-500">{order.customer.contactHandle}</p>
              )}
            </div>
          </div>
          <StatusPill status={order.status} />
        </div>

        <StatusButtons orderId={order.id} current={order.status} />

        <div className="border-t border-zinc-800 pt-5">
          <OrderMoneyForm
            orderId={order.id}
            totalPrice={Number(order.totalPrice)}
            amountPaid={Number(order.amountPaid)}
            dueDate={order.dueDate ? order.dueDate.toISOString().slice(0, 10) : null}
          />
          <p className="mt-3 text-xs text-zinc-500">
            Balance due:{" "}
            <span
              className={`font-mono font-semibold ${
                balance > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {formatMoney(balance)}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-1 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Items</p>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 border-t border-zinc-800 py-3.5 first:border-0 first:pt-0"
          >
            <div>
              <p className="font-medium text-zinc-100">{item.description}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                qty {item.quantity} ·{" "}
                {item.pattern ? (
                  <span className="text-emerald-400">pattern saved</span>
                ) : (
                  "no pattern yet"
                )}
              </p>
            </div>
            <Link
              href={`/admin/patterns/${item.id}`}
              className="shrink-0 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
            >
              {item.pattern ? "Edit pattern" : "Generate pattern"} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

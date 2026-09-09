import { prisma } from "@/lib/prisma";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Customers</h1>
        <p className="text-xs text-zinc-500">{customers.length} on file</p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 px-8 py-14 text-center text-sm text-zinc-500">
          No customers yet — they show up here once someone registers or you add an
          order manually.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Portal access</th>
                <th className="px-4 py-3 font-medium">Orders</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-zinc-800/60 transition last:border-0 hover:bg-zinc-900"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-zinc-400">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div className="font-medium text-zinc-100">{customer.name}</div>
                        {customer.orgName && (
                          <div className="text-xs text-zinc-500">{customer.orgName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        customer.type === "organization"
                          ? "bg-teal-950 text-teal-300"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {customer.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {customer.contactHandle || customer.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {customer.passwordHash ? (
                      <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                        has login
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">admin-entered only</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-300">{customer._count.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

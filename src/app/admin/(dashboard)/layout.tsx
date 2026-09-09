import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { adminLogoutAction } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { Mark } from "@/components/Mark";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const admin = await prisma.admin.findUnique({ where: { id: session.adminId } });

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="flex w-56 flex-none flex-col gap-1 border-r border-zinc-800 bg-zinc-900 p-3">
        <div className="mb-5 flex items-center gap-2.5 px-1 py-1">
          <Mark size={28} />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Admin
          </span>
        </div>
        <AdminNav />
        <div className="mt-auto space-y-1.5 border-t border-zinc-800 px-2.5 pt-3 text-xs">
          <p className="truncate text-zinc-300">{admin?.name ?? "Admin"}</p>
          <p className="truncate font-mono text-zinc-500">{admin?.email}</p>
          <form action={adminLogoutAction}>
            <button className="pt-0.5 font-medium text-teal-400 transition hover:text-teal-300 hover:underline">
              Log out
            </button>
          </form>
        </div>
      </nav>
      <main className="min-w-0 flex-1 p-7">{children}</main>
    </div>
  );
}

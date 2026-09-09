import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/auth/session";
import { memberLogoutAction } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { Mark } from "@/components/Mark";

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const session = await getMemberSession();
  if (!session) redirect("/login");

  const customer = await prisma.customer.findUnique({ where: { id: session.customerId } });
  if (!customer) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/85 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/85">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Mark size={30} />
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {customer.type === "organization" ? customer.orgName : customer.name.split(" ")[0]}
            </span>
            <form action={memberLogoutAction}>
              <button className="text-xs font-medium text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100">
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-5 py-8">{children}</div>
    </div>
  );
}

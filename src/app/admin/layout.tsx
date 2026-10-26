import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";

// Этот «охранник» стоит на входе во ВСЕ страницы внутри /admin
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const newOrders = await prisma.order.count({ where: { status: "NEW" } });

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="h-fit lg:sticky lg:top-28">
        <p className="mb-3 hidden px-4 text-xs uppercase tracking-widest text-muted lg:block">
          Админка · {session.user.name}
        </p>
        <AdminNav newOrders={newOrders} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

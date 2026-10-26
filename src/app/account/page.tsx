import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { money, plural } from "@/lib/format";
import { statusChip, statusLabel } from "@/lib/orderStatus";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { orders: { orderBy: { createdAt: "desc" }, take: 3, include: { items: true } } },
    }),
    prisma.order.aggregate({
      where: { userId: session.user.id, status: { not: "CANCELLED" } },
      _sum: { total: true },
      _count: true,
    }),
  ]);
  if (!user) redirect("/login");

  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      {/* Шапка профиля */}
      <section className="relative overflow-hidden rounded-3xl border bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 font-display text-3xl font-bold text-black">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold">Здравствуйте, {user.name}!</h1>
            <p className="text-muted">{user.email}</p>
            {user.role === "ADMIN" && (
              <Link href="/admin" className="mt-2 inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                Администратор · перейти в админку →
              </Link>
            )}
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-surface-2 p-4">
            <p className="text-sm text-muted">Заказов</p>
            <p className="font-display text-3xl font-bold">{stats._count}</p>
          </div>
          <div className="rounded-2xl bg-surface-2 p-4">
            <p className="text-sm text-muted">Потрачено</p>
            <p className="font-display text-3xl font-bold">{money(stats._sum.total ?? 0)}</p>
          </div>
        </div>
      </section>

      {/* Последние заказы */}
      <section className="rounded-3xl border bg-surface p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Последние заказы</h2>
          <Link href="/account/orders" className="text-sm text-muted transition hover:text-accent">
            Все заказы →
          </Link>
        </div>
        {user.orders.length === 0 ? (
          <p className="text-muted">
            Заказов пока нет.{" "}
            <Link href="/catalog" className="text-accent underline">Перейти в каталог</Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {user.orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/account/orders/${o.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition hover:border-accent/60"
                >
                  <div>
                    <p className="font-semibold">Заказ №{o.number}</p>
                    <p className="text-sm text-muted">
                      {o.createdAt.toLocaleDateString("ru-RU")} · {o.items.length}{" "}
                      {plural(o.items.length, ["позиция", "позиции", "позиций"])}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusChip(o.status)}`}>
                    {statusLabel(o.status)}
                  </span>
                  <p className="font-display text-lg font-bold">{money(o.total)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Данные */}
      <section className="rounded-3xl border bg-surface p-6 sm:p-8">
        <h2 className="mb-4 font-display text-xl font-bold">Мои данные</h2>
        <ProfileForm name={user.name} phone={user.phone ?? ""} email={user.email} />
      </section>

      <section className="rounded-3xl border bg-surface p-6 sm:p-8">
        <h2 className="mb-4 font-display text-xl font-bold">Безопасность</h2>
        <PasswordForm />
      </section>
    </div>
  );
}

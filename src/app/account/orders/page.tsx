import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { money, plural } from "@/lib/format";
import { paymentBadge, statusChip, statusLabel } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">Мои заказы</h1>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-12 text-center">
          <p className="text-lg font-semibold">Заказов пока нет</p>
          <p className="mt-2 text-muted">Самое время что-нибудь подобрать для вашего автомобиля.</p>
          <Link href="/catalog" className="btn btn-primary mt-6">В каталог</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => {
            const pay = paymentBadge(o);
            const awaiting = o.paymentMethod === "CARD" && !o.paidAt && o.status !== "CANCELLED";
            return (
              <li key={o.id} className="rounded-2xl border bg-surface p-5 transition hover:border-accent/60">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/account/orders/${o.id}`} className="font-display text-lg font-bold hover:text-accent">
                      Заказ №{o.number}
                    </Link>
                    <p className="text-sm text-muted">
                      {o.createdAt.toLocaleDateString("ru-RU")} · {o.items.length}{" "}
                      {plural(o.items.length, ["позиция", "позиции", "позиций"])}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusChip(o.status)}`}>
                    {statusLabel(o.status)}
                  </span>
                </div>

                <p className="mt-3 line-clamp-1 text-sm text-muted">
                  {o.items.map((i) => i.partName).join(", ")}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="font-display text-xl font-bold">
                    {money(o.total)} <span className={`ml-2 text-sm font-normal ${pay.cls}`}>{pay.label}</span>
                  </p>
                  <div className="flex gap-2">
                    {awaiting && (
                      <Link href={`/pay/${o.id}`} className="btn btn-primary btn-sm">Оплатить</Link>
                    )}
                    <Link href={`/account/orders/${o.id}`} className="btn btn-ghost btn-sm">Подробнее</Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

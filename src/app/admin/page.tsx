import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import { statusChip, statusLabel } from "@/lib/orderStatus";
import RevenueChart from "./RevenueChart";

export const dynamic = "force-dynamic";

const DAYS = 14;

export default async function AdminDashboard() {
  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const notCancelled = { status: { not: "CANCELLED" as const } };

  const [revenue, ordersCount, newCount, recent, lowStock, top, chartOrders] = await Promise.all([
    prisma.order.aggregate({ where: notCancelled, _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: true } }),
    prisma.part.findMany({ where: { isActive: true, stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 6 }),
    prisma.orderItem.groupBy({
      by: ["partId", "partName"],
      where: { order: notCancelled },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      where: { ...notCancelled, createdAt: { gte: since } },
      select: { createdAt: true, total: true },
    }),
  ]);

  // Выручка по дням за последние две недели
  const byDay = new Map<string, number>();
  for (const o of chartOrders) {
    const key = o.createdAt.toLocaleDateString("ru-RU");
    byDay.set(key, (byDay.get(key) ?? 0) + Number(o.total));
  }
  const chart = Array.from({ length: DAYS }).map((_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return {
      label: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
      value: byDay.get(d.toLocaleDateString("ru-RU")) ?? 0,
    };
  });
  const periodTotal = chart.reduce((a, d) => a + d.value, 0);

  const kpis = [
    { label: "Выручка (всего)", value: money(revenue._sum.total ?? 0), accent: true },
    { label: "Заказов", value: String(ordersCount) },
    { label: "Новых заказов", value: String(newCount), warn: newCount > 0 },
    { label: "Заканчиваются", value: String(lowStock.length), warn: lowStock.length > 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">Дашборд</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border bg-surface p-5">
            <p className="text-sm text-muted">{k.label}</p>
            <p className={`mt-2 font-display text-3xl font-bold ${k.accent ? "text-accent" : k.warn ? "text-accent-2" : ""}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border bg-surface p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-xl font-bold">Выручка за {DAYS} дней</h2>
          <p className="text-muted">
            Итого: <span className="font-semibold text-ink">{money(periodTotal)}</span>
          </p>
        </div>
        <RevenueChart data={chart} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Последние заказы</h2>
            <Link href="/admin/orders" className="text-sm text-muted transition hover:text-accent">Все →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-muted">Заказов пока нет.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3 transition hover:text-accent">
                    <span className="min-w-0">
                      <span className="block font-semibold">№{o.number} · {o.user.name}</span>
                      <span className="text-xs text-muted">{o.createdAt.toLocaleDateString("ru-RU")}</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusChip(o.status)}`}>{statusLabel(o.status)}</span>
                    <span className="font-semibold">{money(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border bg-surface p-6">
            <h2 className="mb-4 font-display text-xl font-bold">Хиты продаж</h2>
            {top.length === 0 ? (
              <p className="text-muted">Пока нет продаж.</p>
            ) : (
              <ol className="flex flex-col gap-2 text-sm">
                {top.map((t, i) => (
                  <li key={t.partId} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-accent">{i + 1}</span>
                    <span className="flex-1">{t.partName}</span>
                    <span className="text-muted">{t._sum.quantity} шт.</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-2xl border bg-surface p-6">
            <h2 className="mb-4 font-display text-xl font-bold">Заканчиваются на складе</h2>
            {lowStock.length === 0 ? (
              <p className="text-muted">Всё в достатке 👍</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <Link href={`/admin/parts/${p.id}`} className="flex-1 transition hover:text-accent">{p.name}</Link>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.stock === 0 ? "bg-bad/15 text-bad" : "bg-accent-2/15 text-accent-2"}`}>
                      {p.stock === 0 ? "нет" : `${p.stock} шт.`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

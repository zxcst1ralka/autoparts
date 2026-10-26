import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import { ORDER_STATUS_LABELS, paymentBadge, statusChip, statusLabel } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "" } = await searchParams;
  const filter = Object.keys(ORDER_STATUS_LABELS).includes(status) ? (status as OrderStatus) : null;

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: filter ? { status: filter } : {},
      orderBy: { createdAt: "desc" },
      include: { user: true, items: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((a, c) => a + c._count, 0);

  const tab = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
      active ? "border-accent bg-accent text-on-accent" : "text-muted hover:border-accent hover:text-accent"
    }`;

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">Заказы</h1>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <Link href="/admin/orders" className={tab(!filter)}>Все · {total}</Link>
        {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
          <Link key={key} href={`/admin/orders?status=${key}`} className={tab(filter === key)}>
            {label} · {countOf(key)}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-muted">Заказов с таким статусом нет.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-muted">
              <tr>
                <th className="px-4 py-3">№</th>
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3">Клиент</th>
                <th className="px-4 py-3">Оплата</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const pay = paymentBadge(o);
                return (
                  <tr key={o.id} className="border-b last:border-0 transition hover:bg-surface-2">
                    <td className="px-4 py-3 font-semibold">{o.number}</td>
                    <td className="px-4 py-3">{o.createdAt.toLocaleDateString("ru-RU")}</td>
                    <td className="px-4 py-3">
                      {o.user.name}
                      <span className="block text-xs text-muted">{o.user.email}</span>
                    </td>
                    <td className={`px-4 py-3 ${pay.cls}`}>{pay.label}</td>
                    <td className="px-4 py-3 font-semibold">{money(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusChip(o.status)}`}>
                        {statusLabel(o.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="text-accent underline">Открыть</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

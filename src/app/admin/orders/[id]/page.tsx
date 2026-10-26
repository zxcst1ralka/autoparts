import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import { DELIVERY, PAYMENT, isDelivery, isPayment } from "@/lib/checkout";
import { ORDER_STATUS_LABELS, paymentBadge, statusChip, statusLabel } from "@/lib/orderStatus";
import OrderTracker from "@/components/OrderTracker";
import { updateOrderStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true, items: true },
  });
  if (!order) notFound();

  const locked = order.status === "CANCELLED";
  const pay = paymentBadge(order);
  const deliveryLabel = isDelivery(order.deliveryMethod) ? DELIVERY[order.deliveryMethod].label : order.deliveryMethod;
  const paymentLabel = isPayment(order.paymentMethod) ? PAYMENT[order.paymentMethod].label : order.paymentMethod;

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-muted underline transition hover:text-accent">
          ← К списку заказов
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold">Заказ №{order.number}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusChip(order.status)}`}>
            {statusLabel(order.status)}
          </span>
        </div>
        <p className="mt-1 text-muted">{order.createdAt.toLocaleString("ru-RU")}</p>
      </div>

      <section className="rounded-2xl border bg-surface p-6">
        <OrderTracker status={order.status} paymentMethod={order.paymentMethod} />
      </section>

      <section className="rounded-2xl border bg-surface p-6">
        <h2 className="mb-3 font-display text-xl font-bold">Статус заказа</h2>
        {locked ? (
          <p className="text-muted">Заказ отменён, запчасти возвращены на склад. Изменить статус нельзя.</p>
        ) : (
          <form action={updateOrderStatus} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={order.id} />
            <select name="status" defaultValue={order.status} className="input w-auto">
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Сохранить</button>
            <p className="w-full text-sm text-muted">
              При выборе «Отменён» запчасти автоматически вернутся на склад.
            </p>
          </form>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-2xl border bg-surface p-6 text-sm">
          <h2 className="mb-3 font-display text-lg font-bold">Клиент</h2>
          <p className="font-semibold">{order.user.name}</p>
          <p className="text-muted">{order.user.email}</p>
          <p className="mt-2 text-muted">Получатель: {order.contactName}</p>
          <p className="text-muted">{order.contactPhone}</p>
        </section>
        <section className="rounded-2xl border bg-surface p-6 text-sm">
          <h2 className="mb-3 font-display text-lg font-bold">Доставка</h2>
          <p className="font-semibold">{deliveryLabel}</p>
          <p className="mt-2 text-muted">
            {order.shipCity}, {order.shipStreet}
            {order.shipPostalCode ? `, ${order.shipPostalCode}` : ""}
          </p>
          {order.comment && <p className="mt-2 text-muted">Комментарий: {order.comment}</p>}
        </section>
        <section className="rounded-2xl border bg-surface p-6 text-sm">
          <h2 className="mb-3 font-display text-lg font-bold">Оплата</h2>
          <p className="font-semibold">{paymentLabel}</p>
          <p className={`mt-2 ${pay.cls}`}>{pay.label}</p>
          {order.paidAt && <p className="text-muted">{order.paidAt.toLocaleString("ru-RU")}</p>}
        </section>
      </div>

      <section className="rounded-2xl border bg-surface p-6">
        <h2 className="mb-4 font-display text-xl font-bold">Состав заказа</h2>
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
              <span>
                {item.partName}
                <span className="block text-sm text-muted">{item.partSku} · {money(item.unitPrice)} × {item.quantity}</span>
              </span>
              <span className="font-semibold">{money(Number(item.unitPrice) * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 flex flex-col gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Доставка</dt>
            <dd>{Number(order.shippingCost) === 0 ? "Бесплатно" : money(order.shippingCost)}</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-end justify-between border-t pt-4">
          <span className="text-muted">Итого</span>
          <span className="font-display text-2xl font-bold">{money(order.total)}</span>
        </p>
      </section>
    </div>
  );
}

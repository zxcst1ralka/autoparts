import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import { DELIVERY, PAYMENT, isDelivery, isPayment } from "@/lib/checkout";
import { statusLabel } from "@/lib/orderStatus";
import OrderTracker from "@/components/OrderTracker";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; paid?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const { new: isNew, paid } = await searchParams;

  // Ищем заказ ТОЛЬКО среди заказов этого пользователя,
  // чтобы нельзя было открыть чужой заказ, подставив его номер в ссылку
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true },
  });
  if (!order) notFound();

  const awaitingPayment =
    order.paymentMethod === "CARD" && !order.paidAt && order.status !== "CANCELLED";

  const deliveryLabel = isDelivery(order.deliveryMethod) ? DELIVERY[order.deliveryMethod].label : order.deliveryMethod;
  const paymentLabel = isPayment(order.paymentMethod) ? PAYMENT[order.paymentMethod].label : order.paymentMethod;

  return (
    <div>
      <Link href="/account/orders" className="text-sm text-muted underline transition hover:text-accent">
        ← Все заказы
      </Link>

      {paid && (
        <p className="mt-4 rounded-xl border border-ok/50 bg-ok/10 p-4 text-ok">
          ✓ Оплата прошла успешно. Спасибо за заказ!
        </p>
      )}
      {isNew && !paid && (
        <p className="mt-4 rounded-xl border border-ok/50 bg-ok/10 p-4 text-ok">
          ✓ Заказ оформлен. Мы свяжемся с вами для подтверждения.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Заказ №{order.number}</h1>
          <p className="mt-1 text-muted">
            от {order.createdAt.toLocaleDateString("ru-RU")} · {statusLabel(order.status)}
          </p>
        </div>
        {awaitingPayment && (
          <Link href={`/pay/${order.id}`} className="btn btn-primary">
            Оплатить {money(order.total)}
          </Link>
        )}
      </div>

      <section className="mt-6 rounded-2xl border bg-surface p-6">
        <OrderTracker status={order.status} paymentMethod={order.paymentMethod} />
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
        <section className="rounded-2xl border bg-surface p-6">
          <h2 className="mb-4 font-display text-xl font-bold">Состав заказа</h2>
          <ul className="flex flex-col gap-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
                <span>
                  {item.partName}
                  <span className="block text-sm text-muted">
                    {item.partSku} · {money(item.unitPrice)} × {item.quantity}
                  </span>
                </span>
                <span className="font-semibold">{money(Number(item.unitPrice) * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Доставка</dt>
              <dd className={Number(order.shippingCost) === 0 ? "text-ok" : ""}>
                {Number(order.shippingCost) === 0 ? "Бесплатно" : money(order.shippingCost)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 flex items-end justify-between border-t pt-4">
            <span className="text-muted">Итого</span>
            <span className="font-display text-2xl font-bold">{money(order.total)}</span>
          </p>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-2xl border bg-surface p-6 text-sm">
            <h2 className="mb-3 font-display text-lg font-bold">Доставка</h2>
            <p className="font-semibold">{deliveryLabel}</p>
            <p className="mt-2 text-muted">
              {order.shipCity}, {order.shipStreet}
              {order.shipPostalCode ? `, ${order.shipPostalCode}` : ""}
            </p>
            <p className="mt-2 text-muted">
              {order.contactName}, {order.contactPhone}
            </p>
            {order.comment && <p className="mt-2 text-muted">Комментарий: {order.comment}</p>}
          </section>

          <section className="rounded-2xl border bg-surface p-6 text-sm">
            <h2 className="mb-3 font-display text-lg font-bold">Оплата</h2>
            <p className="font-semibold">{paymentLabel}</p>
            <p className={`mt-2 ${order.paidAt ? "text-ok" : awaitingPayment ? "text-accent-2" : "text-muted"}`}>
              {order.paidAt
                ? `Оплачен ${order.paidAt.toLocaleDateString("ru-RU")}`
                : awaitingPayment
                  ? "Ожидает оплаты"
                  : order.paymentMethod === "CASH"
                    ? "Оплата при получении"
                    : ""}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

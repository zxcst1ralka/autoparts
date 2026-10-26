import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import CheckoutSteps from "@/components/CheckoutSteps";
import CardForm from "./CardForm";

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true },
  });
  if (!order) notFound();

  // Платить нечего: заказ уже оплачен, отменён или оплачивается при получении
  if (order.paymentMethod !== "CARD" || order.paidAt || order.status === "CANCELLED") {
    redirect(`/account/orders/${order.id}`);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <CheckoutSteps current={3} />
      <h1 className="mb-8 font-display text-3xl font-bold">Оплата заказа №{order.number}</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <CardForm orderId={order.id} amount={Number(order.total)} />

        <aside className="h-fit rounded-2xl border bg-surface p-6">
          <h2 className="font-display text-xl font-bold">Состав заказа</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.partName} <span className="text-muted">× {item.quantity}</span>
                </span>
                <span>{money(Number(item.unitPrice) * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Доставка</dt>
              <dd className={Number(order.shippingCost) === 0 ? "text-ok" : ""}>
                {Number(order.shippingCost) === 0 ? "Бесплатно" : money(order.shippingCost)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 flex items-end justify-between border-t pt-4">
            <span className="text-muted">К оплате</span>
            <span className="font-display text-2xl font-bold">{money(order.total)}</span>
          </p>
          <Link href={`/account/orders/${order.id}`} className="mt-5 block text-center text-sm text-muted underline transition hover:text-accent">
            Оплатить позже
          </Link>
        </aside>
      </div>
    </main>
  );
}

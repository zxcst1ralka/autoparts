"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ДЕМО-оплата. Данные карты сюда НЕ приходят и нигде не сохраняются:
// форма на странице оплаты их только проверяет и показывает на «карте».
// В настоящем магазине заказ помечается оплаченным не отсюда,
// а когда платёжная система (ЮKassa, Stripe и т.п.) сообщает об успешном платеже.
export async function payOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Войдите в аккаунт" };

  // Ищем заказ только среди заказов этого пользователя
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
  });
  if (!order) return { ok: false, error: "Заказ не найден" };
  if (order.paymentMethod !== "CARD") return { ok: false, error: "Этот заказ оплачивается при получении" };
  if (order.paidAt) return { ok: false, error: "Заказ уже оплачен" };
  if (order.status === "CANCELLED") return { ok: false, error: "Заказ отменён" };

  await prisma.order.update({
    where: { id: order.id },
    // Статус меняем только у нового заказа, чтобы не откатить уже продвинутый
    data: { paidAt: new Date(), ...(order.status === "NEW" ? { status: "PAID" as const } : {}) },
  });

  revalidatePath("/account");
  revalidatePath(`/account/orders/${order.id}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

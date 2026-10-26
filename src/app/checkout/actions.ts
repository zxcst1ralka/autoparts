"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clearCart, getCart } from "@/lib/cart";
import { SITE } from "@/lib/site";
import { deliveryPrice, isDelivery, isPayment } from "@/lib/checkout";

type FormState = { error?: string };

// Понятная пользователю ошибка (например, «товар закончился»)
class OrderError extends Error {}

export async function placeOrder(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const contactName = text("contactName");
  const contactPhone = text("contactPhone");
  const deliveryRaw = text("deliveryMethod");
  const paymentRaw = text("paymentMethod");
  const city = text("city");
  const street = text("street");
  const postalCode = text("postalCode");
  const comment = text("comment");

  if (!isDelivery(deliveryRaw)) return { error: "Выберите способ доставки" };
  if (!isPayment(paymentRaw)) return { error: "Выберите способ оплаты" };
  const delivery = deliveryRaw;
  const payment = paymentRaw;
  const needsAddress = delivery !== "PICKUP";

  if (contactName.length < 2) return { error: "Введите имя получателя" };
  if (contactPhone.length < 5) return { error: "Введите телефон" };
  if (needsAddress && !city) return { error: "Введите город" };
  if (needsAddress && !street) return { error: "Введите адрес (улица, дом, квартира)" };

  const cart = await getCart();
  const ids = Object.keys(cart);
  if (ids.length === 0) return { error: "Корзина пуста" };

  let orderId: string;
  try {
    // Транзакция: либо выполняется всё (заказ + списание со склада), либо ничего
    orderId = await prisma.$transaction(async (tx) => {
      const parts = await tx.part.findMany({
        where: { id: { in: ids }, isActive: true },
      });
      if (parts.length !== ids.length) {
        throw new OrderError("Некоторые товары больше недоступны. Проверьте корзину.");
      }

      let subtotal = 0;
      const items = parts.map((p) => {
        const quantity = cart[p.id];
        subtotal += Number(p.price) * quantity;
        return {
          partId: p.id,
          quantity,
          unitPrice: p.price, // запоминаем цену на момент заказа
          partName: p.name,
          partSku: p.sku,
        };
      });

      // Стоимость доставки считаем на сервере: цифрам из браузера верить нельзя
      const shippingCost = deliveryPrice(delivery, subtotal);
      const total = Math.round((subtotal + shippingCost) * 100) / 100;

      // Списываем со склада, но только если товара достаточно
      for (const p of parts) {
        const res = await tx.part.updateMany({
          where: { id: p.id, stock: { gte: cart[p.id] } },
          data: { stock: { decrement: cart[p.id] } },
        });
        if (res.count === 0) {
          throw new OrderError(`Недостаточно товара на складе: ${p.name}`);
        }
      }

      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          total,
          shippingCost,
          deliveryMethod: delivery,
          paymentMethod: payment,
          comment: comment || null,
          shipCity: needsAddress ? city : "Самовывоз",
          shipStreet: needsAddress ? street : SITE.pickupAddress,
          shipPostalCode: needsAddress ? postalCode || null : null,
          contactName,
          contactPhone,
          items: { create: items },
        },
      });
      return order.id;
    });
  } catch (e) {
    if (e instanceof OrderError) return { error: e.message };
    throw e;
  }

  await clearCart();
  revalidatePath("/", "layout");

  // Оплата картой: сразу на страницу оплаты. Иначе на страницу заказа.
  redirect(payment === "CARD" ? `/pay/${orderId}` : `/account/orders/${orderId}?new=1`);
}

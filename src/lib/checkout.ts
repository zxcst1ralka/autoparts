import { SITE } from "@/lib/site";

export type DeliveryMethod = "COURIER" | "PVZ" | "PICKUP";
export type PaymentMethod = "CARD" | "CASH";

export const DELIVERY: Record<DeliveryMethod, { label: string; hint: string; price: number }> = {
  COURIER: { label: "Курьером до двери", hint: "1–3 дня", price: 390 },
  PVZ: { label: "Пункт выдачи", hint: "1–3 дня", price: 190 },
  PICKUP: { label: "Самовывоз со склада", hint: "готов к выдаче в день заказа", price: 0 },
};

export const PAYMENT: Record<PaymentMethod, { label: string; hint: string }> = {
  CARD: { label: "Картой онлайн", hint: "Visa, Mastercard, МИР" },
  CASH: { label: "При получении", hint: "наличными или картой" },
};

// Стоимость доставки: самовывоз бесплатный, а от определённой суммы бесплатно всё
export function deliveryPrice(method: DeliveryMethod, subtotal: number) {
  if (method === "PICKUP") return 0;
  if (subtotal >= SITE.freeShippingFrom) return 0;
  return DELIVERY[method].price;
}

export const isDelivery = (v: string): v is DeliveryMethod =>
  Object.keys(DELIVERY).includes(v);

export const isPayment = (v: string): v is PaymentMethod =>
  Object.keys(PAYMENT).includes(v);

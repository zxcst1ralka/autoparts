"use client";
/* eslint-disable @next/next/no-img-element */

import { useActionState, useState } from "react";
import { placeOrder } from "./actions";
import {
  DELIVERY,
  PAYMENT,
  deliveryPrice,
  type DeliveryMethod,
  type PaymentMethod,
} from "@/lib/checkout";
import { money } from "@/lib/format";
import { SITE } from "@/lib/site";
import PartIcon from "@/components/PartIcon";

type Item = {
  id: string;
  name: string;
  quantity: number;
  sum: number;
  image: string | null;
  slug: string;
};

const radioCard =
  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:border-accent/60 has-[:checked]:border-accent has-[:checked]:bg-accent/10";

export default function CheckoutForm({
  defaultName,
  defaultPhone,
  defaultCity = "",
  defaultStreet = "",
  defaultPostal = "",
  items,
  subtotal,
}: {
  defaultName: string;
  defaultPhone: string;
  defaultCity?: string;
  defaultStreet?: string;
  defaultPostal?: string;
  items: Item[];
  subtotal: number;
}) {
  const [state, formAction, pending] = useActionState(placeOrder, {});
  const [delivery, setDelivery] = useState<DeliveryMethod>("COURIER");
  const [payment, setPayment] = useState<PaymentMethod>("CARD");

  const shipping = deliveryPrice(delivery, subtotal);
  const total = subtotal + shipping;

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-6">
        {/* Контакты */}
        <section className="rounded-2xl border bg-surface p-6">
          <h2 className="mb-4 font-display text-xl font-bold">1. Контакты</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-muted">
              Имя получателя
              <input name="contactName" defaultValue={defaultName} required className="input" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted">
              Телефон
              <input name="contactPhone" type="tel" defaultValue={defaultPhone} placeholder="+7 ..." required className="input" />
            </label>
          </div>
        </section>

        {/* Доставка */}
        <section className="rounded-2xl border bg-surface p-6">
          <h2 className="mb-4 font-display text-xl font-bold">2. Доставка</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(DELIVERY) as DeliveryMethod[]).map((key) => {
              const price = deliveryPrice(key, subtotal);
              return (
                <label key={key} className={radioCard}>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={key}
                    checked={delivery === key}
                    onChange={() => setDelivery(key)}
                    className="mt-1 accent-accent"
                  />
                  <span>
                    <span className="block font-semibold">{DELIVERY[key].label}</span>
                    <span className="block text-sm text-muted">{DELIVERY[key].hint}</span>
                    <span className={`mt-1 block text-sm font-semibold ${price === 0 ? "text-ok" : ""}`}>
                      {price === 0 ? "Бесплатно" : money(price)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          {delivery === "PICKUP" ? (
            <p className="mt-5 rounded-xl bg-surface-2 p-4 text-sm text-muted">
              Заберёте заказ по адресу: <b className="text-ink">{SITE.pickupAddress}</b>. Мы позвоним, когда заказ будет готов.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-muted">
                Город
                <input name="city" defaultValue={defaultCity} required className="input" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-muted">
                Индекс (необязательно)
                <input name="postalCode" defaultValue={defaultPostal} className="input" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-muted sm:col-span-2">
                {delivery === "PVZ" ? "Адрес или номер пункта выдачи" : "Улица, дом, квартира"}
                <input name="street" defaultValue={defaultStreet} required className="input" />
              </label>
            </div>
          )}
        </section>

        {/* Оплата */}
        <section className="rounded-2xl border bg-surface p-6">
          <h2 className="mb-4 font-display text-xl font-bold">3. Оплата</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(PAYMENT) as PaymentMethod[]).map((key) => (
              <label key={key} className={radioCard}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={key}
                  checked={payment === key}
                  onChange={() => setPayment(key)}
                  className="mt-1 accent-accent"
                />
                <span>
                  <span className="block font-semibold">{PAYMENT[key].label}</span>
                  <span className="block text-sm text-muted">{PAYMENT[key].hint}</span>
                </span>
              </label>
            ))}
          </div>
          <label className="mt-5 flex flex-col gap-1 text-sm text-muted">
            Комментарий к заказу (необязательно)
            <textarea name="comment" rows={3} className="input" />
          </label>
        </section>
      </div>

      {/* Итоги */}
      <aside className="h-fit rounded-2xl border bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-bold">Ваш заказ</h2>

        <ul className="mt-4 flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 text-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
                {item.image ? (
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <PartIcon slug={item.slug} className="h-7 w-7 text-line" />
                )}
              </div>
              <span className="flex-1">
                {item.name} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="font-semibold">{money(item.sum)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-2 border-t pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Товары</dt>
            <dd>{money(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Доставка</dt>
            <dd className={shipping === 0 ? "text-ok" : ""}>{shipping === 0 ? "Бесплатно" : money(shipping)}</dd>
          </div>
        </dl>

        <p className="mt-5 flex items-end justify-between border-t pt-5">
          <span className="text-muted">К оплате</span>
          <span className="font-display text-3xl font-bold">{money(total)}</span>
        </p>

        {state.error && (
          <p className="mt-4 rounded-xl border border-bad/50 bg-bad/10 p-3 text-sm text-bad">{state.error}</p>
        )}

        <button type="submit" disabled={pending} className="btn btn-primary mt-6 w-full disabled:opacity-50">
          {pending ? "Оформляю..." : payment === "CARD" ? "Перейти к оплате" : "Подтвердить заказ"}
        </button>
      </aside>
    </form>
  );
}

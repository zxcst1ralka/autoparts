import Link from "next/link";
import { auth } from "@/auth";
import { getCartItems } from "@/lib/cart";
import { money } from "@/lib/format";
import { SITE } from "@/lib/site";
import CheckoutSteps from "@/components/CheckoutSteps";
import PartIcon from "@/components/PartIcon";
import PartVisual from "@/components/PartVisual";
import { removeFromCart, updateCartItem } from "./actions";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [{ items, total }, session] = await Promise.all([getCartItems(), auth()]);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <PartIcon slug="gear" className="mx-auto h-28 w-28 text-line" />
        <h1 className="mt-6 font-display text-3xl font-bold">Корзина пуста</h1>
        <p className="mt-3 text-muted">Загляните в каталог: там много интересного.</p>
        <Link href="/catalog" className="btn btn-primary mt-8">
          Перейти в каталог
        </Link>
      </main>
    );
  }

  const free = SITE.freeShippingFrom;
  const left = Math.max(0, free - total);
  const progress = Math.min(100, Math.round((total / free) * 100));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <CheckoutSteps current={1} />
      <h1 className="mb-6 font-display text-3xl font-bold">Корзина</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="flex flex-col gap-4">
          {items.map(({ part, quantity, sum }) => (
            <li key={part.id} className="flex gap-4 rounded-2xl border bg-surface p-4">
              <Link
                href={`/parts/${part.slug}`}
                className="group block h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28"
              >
                <PartVisual src={part.images[0]?.url} slug={part.category.slug} alt={part.name} />
              </Link>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/parts/${part.slug}`} className="font-semibold transition hover:text-accent">
                      {part.name}
                    </Link>
                    <p className="text-sm text-muted">
                      Арт. {part.sku} · {money(part.price)} за шт.
                    </p>
                  </div>
                  <form action={removeFromCart}>
                    <input type="hidden" name="partId" value={part.id} />
                    <button
                      type="submit"
                      aria-label="Убрать из корзины"
                      className="rounded-lg p-2 text-muted transition hover:bg-bad/15 hover:text-bad"
                    >
                      ✕
                    </button>
                  </form>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  {/* Кнопки «−» и «+» работают без JavaScript: каждая отправляет новое количество */}
                  <form action={updateCartItem} className="flex items-center overflow-hidden rounded-xl border">
                    <input type="hidden" name="partId" value={part.id} />
                    <button
                      type="submit"
                      name="quantity"
                      value={quantity - 1}
                      className="px-4 py-2 transition hover:bg-surface-2"
                    >
                      −
                    </button>
                    <span className="min-w-10 text-center font-semibold">{quantity}</span>
                    <button
                      type="submit"
                      name="quantity"
                      value={quantity + 1}
                      disabled={quantity >= part.stock}
                      className="px-4 py-2 transition hover:bg-surface-2 disabled:opacity-30"
                    >
                      +
                    </button>
                  </form>
                  <p className="font-display text-xl font-bold">{money(sum)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Итоги */}
        <aside className="h-fit rounded-2xl border bg-surface p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-xl font-bold">Ваш заказ</h2>

          <div className="mt-5 rounded-xl bg-surface-2 p-4 text-sm">
            {left > 0 ? (
              <p>
                До бесплатной доставки осталось <b className="text-accent-2">{money(left)}</b>
              </p>
            ) : (
              <p className="font-semibold text-ok">🎉 Доставка бесплатная!</p>
            )}
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <dl className="mt-5 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Товары</dt>
              <dd>{money(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Доставка</dt>
              <dd className="text-muted">считается на следующем шаге</dd>
            </div>
          </dl>

          <p className="mt-5 flex items-end justify-between border-t pt-5">
            <span className="text-muted">Итого</span>
            <span className="font-display text-3xl font-bold">{money(total)}</span>
          </p>

          {session?.user ? (
            <Link href="/checkout" className="btn btn-primary mt-6 w-full">
              Оформить заказ
            </Link>
          ) : (
            <div className="mt-6 text-sm text-muted">
              <p>
                Чтобы оформить заказ,{" "}
                <Link href="/login" className="text-accent underline">войдите</Link> или{" "}
                <Link href="/register" className="text-accent underline">зарегистрируйтесь</Link>. Корзина сохранится.
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

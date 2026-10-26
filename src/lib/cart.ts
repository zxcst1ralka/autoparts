import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Корзина хранится в cookie браузера в виде { "id запчасти": количество }.
// Так она работает и без входа в аккаунт.
export type Cart = Record<string, number>;

const COOKIE = "cart";

export async function getCart(): Promise<Cart> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return {};

  try {
    const data = JSON.parse(raw) as unknown;
    const cart: Cart = {};
    if (data && typeof data === "object") {
      for (const [id, q] of Object.entries(data as Record<string, unknown>)) {
        const n = Number(q);
        // Cookie можно подделать, поэтому оставляем только разумные значения
        if (Number.isInteger(n) && n > 0 && n <= 99) cart[id] = n;
      }
    }
    return cart;
  } catch {
    return {};
  }
}

// Сохранять и очищать корзину можно только внутри «серверных действий»
export async function saveCart(cart: Cart) {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 дней
  });
}

export async function clearCart() {
  const store = await cookies();
  store.delete(COOKIE);
}

// Корзина с актуальными данными из базы: цены, названия, остатки
export async function getCartItems() {
  const cart = await getCart();
  const ids = Object.keys(cart);
  if (ids.length === 0) return { items: [], total: 0 };

  const parts = await prisma.part.findMany({
    where: { id: { in: ids }, isActive: true },
    include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const items = parts
    .map((part) => ({ part, quantity: Math.min(cart[part.id], part.stock) }))
    .filter((item) => item.quantity > 0)
    .map((item) => ({ ...item, sum: Number(item.part.price) * item.quantity }));

  const total = Math.round(items.reduce((acc, i) => acc + i.sum, 0) * 100) / 100;
  return { items, total };
}

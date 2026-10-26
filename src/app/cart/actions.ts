"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCart, saveCart } from "@/lib/cart";

export async function addToCart(formData: FormData): Promise<void> {
  const partId = String(formData.get("partId") ?? "");
  const wanted = Math.floor(Number(formData.get("quantity") ?? 1)) || 1;

  const part = await prisma.part.findUnique({
    where: { id: partId },
    select: { id: true, stock: true, isActive: true },
  });
  if (!part || !part.isActive || part.stock <= 0) return;

  const cart = await getCart();
  // Нельзя положить больше, чем есть на складе
  cart[partId] = Math.min(Math.max(1, (cart[partId] ?? 0) + wanted), part.stock, 99);
  await saveCart(cart);

  revalidatePath("/", "layout"); // обновить счётчик в шапке
  redirect("/cart");
}

export async function updateCartItem(formData: FormData): Promise<void> {
  const partId = String(formData.get("partId") ?? "");
  const quantity = Math.floor(Number(formData.get("quantity")));

  const cart = await getCart();
  if (!(partId in cart)) return;

  if (!Number.isFinite(quantity) || quantity <= 0) {
    delete cart[partId];
  } else {
    const part = await prisma.part.findUnique({
      where: { id: partId },
      select: { stock: true },
    });
    const next = Math.min(quantity, part?.stock ?? 0, 99);
    if (next <= 0) delete cart[partId];
    else cart[partId] = next;
  }

  await saveCart(cart);
  revalidatePath("/", "layout");
}

export async function removeFromCart(formData: FormData): Promise<void> {
  const partId = String(formData.get("partId") ?? "");
  const cart = await getCart();
  delete cart[partId];
  await saveCart(cart);
  revalidatePath("/", "layout");
}

"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type FormState = { error?: string; ok?: string };

async function requireUserId() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user.id;
}

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const name = text(formData, "name");
  const phone = text(formData, "phone");

  if (name.length < 2) return { error: "Введите имя (минимум 2 символа)" };
  if (phone && phone.length < 5) return { error: "Телефон указан неверно" };

  await prisma.user.update({ where: { id: userId }, data: { name, phone: phone || null } });
  revalidatePath("/account");
  return { ok: "Данные сохранены" };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");

  if (next.length < 8) return { error: "Новый пароль должен быть не короче 8 символов" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    return { error: "Текущий пароль указан неверно" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(next, 10) },
  });
  return { ok: "Пароль изменён" };
}

// ───────── Адреса ─────────

function backWithError(message: string): never {
  redirect(`/account/addresses?error=${encodeURIComponent(message)}`);
}

export async function addAddress(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const label = text(formData, "label");
  const city = text(formData, "city");
  const street = text(formData, "street");
  const postalCode = text(formData, "postalCode");
  const wantDefault = formData.get("isDefault") === "on";

  if (!city) backWithError("Укажите город");
  if (!street) backWithError("Укажите улицу, дом и квартиру");

  const count = await prisma.address.count({ where: { userId } });
  // Первый адрес всегда становится основным
  const isDefault = wantDefault || count === 0;

  await prisma.$transaction([
    ...(isDefault
      ? [prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })]
      : []),
    prisma.address.create({
      data: { userId, label: label || null, city, street, postalCode: postalCode || null, isDefault },
    }),
  ]);

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = text(formData, "id");
  // Условие userId гарантирует, что удалить можно только свой адрес
  await prisma.address.deleteMany({ where: { id, userId } });
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = text(formData, "id");

  const own = await prisma.address.findFirst({ where: { id, userId } });
  if (!own) return;

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}

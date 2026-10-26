"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

// Каждое действие проверяет, что его вызывает администратор
async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Нет доступа");
  }
}

// Вернуться на страницу справочников (с сообщением об ошибке, если она была)
function back(error?: string): never {
  revalidatePath("/admin/directories");
  revalidatePath("/admin/parts");
  revalidatePath("/catalog");
  redirect(
    error
      ? `/admin/directories?error=${encodeURIComponent(error)}`
      : "/admin/directories"
  );
}

// Если «адрес» уже занят, добавляем -2, -3 и так далее
async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  let slug = base;
  let i = 2;
  while (await exists(slug)) slug = `${base}-${i++}`;
  return slug;
}

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

// ───────── Категории ─────────

export async function createCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const name = text(formData, "name");
  if (name.length < 2) back("Введите название категории");

  const dup = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (dup) back("Такая категория уже есть");

  const slug = await uniqueSlug(
    slugify(name),
    async (s) => !!(await prisma.category.findUnique({ where: { slug: s } }))
  );
  await prisma.category.create({ data: { name, slug } });
  back();
}

export async function updateCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  if (name.length < 2) back("Введите название категории");

  await prisma.category.update({ where: { id }, data: { name } });
  back();
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id");

  const parts = await prisma.part.count({ where: { categoryId: id } });
  if (parts > 0) {
    back(`Нельзя удалить: в категории есть запчасти (${parts}). Сначала перенесите их в другую.`);
  }
  await prisma.category.delete({ where: { id } });
  back();
}

// ───────── Производители ─────────

export async function createBrand(formData: FormData): Promise<void> {
  await requireAdmin();
  const name = text(formData, "name");
  if (name.length < 2) back("Введите название производителя");

  const dup = await prisma.brand.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (dup) back("Такой производитель уже есть");

  const slug = await uniqueSlug(
    slugify(name),
    async (s) => !!(await prisma.brand.findUnique({ where: { slug: s } }))
  );
  await prisma.brand.create({ data: { name, slug } });
  back();
}

export async function updateBrand(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  if (name.length < 2) back("Введите название производителя");

  const dup = await prisma.brand.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, NOT: { id } },
  });
  if (dup) back("Производитель с таким названием уже есть");

  await prisma.brand.update({ where: { id }, data: { name } });
  back();
}

export async function deleteBrand(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id");

  const parts = await prisma.part.count({ where: { brandId: id } });
  if (parts > 0) {
    back(`Нельзя удалить: у производителя есть запчасти (${parts}). Сначала измените их производителя.`);
  }
  await prisma.brand.delete({ where: { id } });
  back();
}

// ───────── Автомобили ─────────

function readVehicle(formData: FormData) {
  const make = text(formData, "make");
  const model = text(formData, "model");
  const yearFrom = Number(text(formData, "yearFrom"));
  const yearToRaw = text(formData, "yearTo");
  const yearTo = yearToRaw === "" ? null : Number(yearToRaw);
  const engine = text(formData, "engine") || null;

  if (!make || !model) back("Укажите марку и модель автомобиля");
  if (!Number.isInteger(yearFrom) || yearFrom < 1950 || yearFrom > 2100)
    back("Год начала выпуска должен быть числом, например 2012");
  if (yearTo !== null && (!Number.isInteger(yearTo) || yearTo < yearFrom || yearTo > 2100))
    back("Год окончания выпуска должен быть числом и не раньше года начала (или оставьте пустым)");

  return { make, model, yearFrom, yearTo, engine };
}

export async function createVehicle(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.vehicle.create({ data: readVehicle(formData) });
  back();
}

export async function updateVehicle(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id");
  await prisma.vehicle.update({ where: { id }, data: readVehicle(formData) });
  back();
}

export async function deleteVehicle(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData, "id");
  // Связи «запчасть — автомобиль» удалятся сами, сами запчасти останутся
  await prisma.vehicle.delete({ where: { id } });
  back();
}

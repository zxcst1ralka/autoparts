"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type FormState = { error?: string };

// Принимаем только ссылки на свои загрузки: локальные или из Vercel Blob
function isAllowedImageUrl(u: string) {
  return (
    u.startsWith("/uploads/") ||
    u.startsWith("/demo/") ||
    /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(u)
  );
}

// Каждое действие ОБЯЗАТЕЛЬНО проверяет, что его вызывает администратор.
// Страница закрыта «охранником», но сами действия — это отдельные «двери»,
// и их тоже нужно запирать.
async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Нет доступа");
  }
}

// Создать новую запчасть или сохранить изменения в существующей
export async function savePart(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? ""); // пусто = новая запчасть
  const sku = String(formData.get("sku") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(String(formData.get("price") ?? "").replace(",", "."));
  const stock = Number(String(formData.get("stock") ?? ""));
  const brandId = String(formData.get("brandId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const isActive = formData.get("isActive") === "on";
  const vehicleIds = formData.getAll("vehicleIds").map(String);
  const imageUrls = formData.getAll("imageUrls").map(String).filter(Boolean);
  if (imageUrls.some((u) => !isAllowedImageUrl(u))) {
    return { error: "Недопустимая ссылка на изображение" };
  }

  if (!sku) return { error: "Введите артикул" };
  if (name.length < 2) return { error: "Введите название" };
  if (!Number.isFinite(price) || price <= 0)
    return { error: "Цена должна быть числом больше нуля" };
  if (!Number.isInteger(stock) || stock < 0)
    return { error: "Остаток должен быть целым числом, не меньше 0" };
  if (!brandId) return { error: "Выберите производителя" };
  if (!categoryId) return { error: "Выберите категорию" };

  // OEM-номера: «A1, B2, C3» -> список
  const oemNumbers = String(formData.get("oemNumbers") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Характеристики: по одной на строку, в виде «Название: значение»
  const specs: Record<string, string> = {};
  for (const line of String(formData.get("specs") ?? "").split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) {
      const key = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim();
      if (key && value) specs[key] = value;
    }
  }

  try {
    if (id) {
      // Редактирование: обновляем запчасть и заново записываем список автомобилей
      await prisma.$transaction([
        prisma.part.update({
          where: { id },
          data: {
            sku,
            name,
            description: description || null,
            price,
            stock,
            oemNumbers,
            specs,
            isActive,
            brandId,
            categoryId,
          },
        }),
        prisma.fitment.deleteMany({ where: { partId: id } }),
        prisma.fitment.createMany({
          data: vehicleIds.map((vehicleId) => ({ partId: id, vehicleId })),
        }),
        // Фото: первое в списке считается главным
        prisma.partImage.deleteMany({ where: { partId: id } }),
        prisma.partImage.createMany({
          data: imageUrls.map((url, i) => ({
            partId: id,
            url,
            position: i,
            isMain: i === 0,
          })),
        }),
      ]);
    } else {
      // Новая запчасть: «адрес» для ссылки делаем из артикула
      const slug =
        sku.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
        `part-${Date.now()}`;

      await prisma.part.create({
        data: {
          sku,
          slug,
          name,
          description: description || null,
          price,
          stock,
          oemNumbers,
          specs,
          isActive,
          brandId,
          categoryId,
          fitments: { create: vehicleIds.map((vehicleId) => ({ vehicleId })) },
          images: {
            create: imageUrls.map((url, i) => ({ url, position: i, isMain: i === 0 })),
          },
        },
      });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Запчасть с таким артикулом уже существует" };
    }
    throw e;
  }

  revalidatePath("/admin/parts");
  revalidatePath("/catalog");
  redirect("/admin/parts");
}

// Удалить запчасть. Если по ней уже были заказы, удалять нельзя
// (сломается история заказов), поэтому просто скрываем её из каталога.
export async function deletePart(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const used = await prisma.orderItem.count({ where: { partId: id } });
  if (used > 0) {
    await prisma.part.update({ where: { id }, data: { isActive: false } });
  } else {
    await prisma.part.delete({ where: { id } });
  }

  revalidatePath("/admin/parts");
  revalidatePath("/catalog");
}

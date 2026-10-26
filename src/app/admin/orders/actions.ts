"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Как и в запчастях: каждое действие само проверяет, что это администратор
async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Нет доступа");
  }
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  // Принимаем только настоящие статусы
  if (!(Object.values(OrderStatus) as string[]).includes(status)) return;
  const next = status as OrderStatus;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });

    // Отменённый заказ менять нельзя, а тот же самый статус ставить незачем
    if (!order || order.status === next || order.status === "CANCELLED") return;

    // При отмене возвращаем запчасти обратно на склад
    if (next === "CANCELLED") {
      for (const item of order.items) {
        await tx.part.update({
          where: { id: item.partId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    await tx.order.update({ where: { id }, data: { status: next } });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/account");
  revalidatePath("/catalog");
}

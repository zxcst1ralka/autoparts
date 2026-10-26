import { PrismaClient } from "@prisma/client";

// В режиме разработки Next.js перезагружает код при каждом сохранении.
// Чтобы не открывать новое подключение к базе каждый раз,
// сохраняем одно подключение в глобальной переменной.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

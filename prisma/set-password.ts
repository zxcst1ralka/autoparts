import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Использование:
//   npx tsx prisma/set-password.ts --list                     показать всех пользователей
//   npx tsx prisma/set-password.ts email@example.com 'пароль' поставить новый пароль
async function main() {
  const [first, newPassword] = process.argv.slice(2);

  if (!first) {
    console.error("Укажите --list или email и новый пароль. Примеры в начале файла.");
    process.exit(1);
  }

  if (first === "--list") {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { email: true, name: true, role: true },
    });
    console.log("Пользователи:");
    for (const u of users) {
      console.log(`  ${u.email}  (${u.name}, ${u.role === "ADMIN" ? "АДМИНИСТРАТОР" : "покупатель"})`);
    }
    return;
  }

  if (!newPassword || newPassword.length < 8) {
    console.error("Новый пароль обязателен и должен быть не короче 8 символов.");
    process.exit(1);
  }

  const email = first.toLowerCase();
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });

  console.log(`Готово: пароль для ${user.email} изменён. Теперь можно войти на сайте.`);
}

main()
  .catch((e) => {
    console.error("Не получилось. Проверьте, что такой email зарегистрирован (команда --list покажет всех).");
    console.error(e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

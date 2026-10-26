"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

type FormState = { error?: string };

const schema = z.object({
  name: z.string().min(2, "Введите имя (минимум 2 символа)"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов"),
});

export async function register(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { error: "Пользователь с таким email уже зарегистрирован" };
  }

  // Пароль никогда не хранится как есть, только его «отпечаток» (хеш)
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: { name: parsed.data.name, email, passwordHash },
  });

  // После регистрации сразу входим в аккаунт
  await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirectTo: "/account",
  });

  return {};
}

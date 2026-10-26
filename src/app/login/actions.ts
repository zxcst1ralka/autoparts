"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

type FormState = { error?: string };

export async function login(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/account",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Неверный email или пароль" };
    }
    // Служебный «переход на другую страницу» нужно пропустить дальше
    throw e;
  }
  return {};
}

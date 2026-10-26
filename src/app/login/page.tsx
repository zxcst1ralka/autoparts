"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">Вход</h1>

      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border bg-transparent p-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Пароль"
          required
          className="rounded border bg-transparent p-2"
        />

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-white p-2 font-semibold text-black disabled:opacity-50"
        >
          {pending ? "Подождите..." : "Войти"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        Нет аккаунта?{" "}
        <Link href="/register" className="underline">
          Зарегистрироваться
        </Link>
      </p>
    </main>
  );
}

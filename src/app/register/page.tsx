"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, {});

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">Регистрация</h1>

      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="name"
          placeholder="Имя"
          required
          className="rounded border bg-transparent p-2"
        />
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
          placeholder="Пароль (от 8 символов)"
          required
          className="rounded border bg-transparent p-2"
        />

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-white p-2 font-semibold text-black disabled:opacity-50"
        >
          {pending ? "Подождите..." : "Зарегистрироваться"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="underline">
          Войти
        </Link>
      </p>
    </main>
  );
}

"use client";

import { useActionState } from "react";
import { changePassword } from "./actions";

export default function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, {});

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-muted">
        Текущий пароль
        <input name="current" type="password" required autoComplete="current-password" className="input" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Новый пароль (от 8 символов)
        <input name="next" type="password" required autoComplete="new-password" className="input" />
      </label>

      {state.error && <p className="text-sm text-bad sm:col-span-2">{state.error}</p>}
      {state.ok && <p className="text-sm text-ok sm:col-span-2">✓ {state.ok}</p>}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-ghost disabled:opacity-50">
          {pending ? "Меняю..." : "Сменить пароль"}
        </button>
      </div>
    </form>
  );
}

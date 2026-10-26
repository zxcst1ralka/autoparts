"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

export default function ProfileForm({
  name,
  phone,
  email,
}: {
  name: string;
  phone: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfile, {});

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm text-muted">
        Имя
        <input name="name" defaultValue={name} required className="input" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Телефон
        <input name="phone" type="tel" defaultValue={phone} placeholder="+7 ..." className="input" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted sm:col-span-2">
        Email (изменить нельзя)
        <input value={email} disabled className="input opacity-60" readOnly />
      </label>

      {state.error && <p className="text-sm text-bad sm:col-span-2">{state.error}</p>}
      {state.ok && <p className="text-sm text-ok sm:col-span-2">✓ {state.ok}</p>}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-50">
          {pending ? "Сохраняю..." : "Сохранить"}
        </button>
      </div>
    </form>
  );
}

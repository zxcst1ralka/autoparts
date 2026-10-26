"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { payOrder } from "../actions";
import { money } from "@/lib/format";

// Проверка номера карты по алгоритму Луна (так банки отсекают опечатки)
function luhn(num: string) {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function brandOf(num: string) {
  if (/^4/.test(num)) return "VISA";
  if (/^(5[1-5]|2(22[1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720))/.test(num)) return "Mastercard";
  if (/^220[0-4]/.test(num)) return "МИР";
  return "";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CardForm({ orderId, amount }: { orderId: string; amount: number }) {
  const router = useRouter();
  const [number, setNumber] = useState(""); // только цифры
  const [name, setName] = useState("");
  const [exp, setExp] = useState(""); // только цифры, MMYY
  const [cvc, setCvc] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const groupedNumber = number.replace(/(.{4})/g, "$1 ").trim();
  const expShown = exp.length > 2 ? `${exp.slice(0, 2)}/${exp.slice(2)}` : exp;
  const brand = brandOf(number);

  function validate() {
    if (number.length !== 16 || !luhn(number)) return "Проверьте номер карты";
    if (name.trim().length < 2) return "Введите имя владельца, как на карте";
    const month = Number(exp.slice(0, 2));
    const year = 2000 + Number(exp.slice(2));
    if (exp.length !== 4 || month < 1 || month > 12) return "Укажите срок действия в формате ММ/ГГ";
    // карта действует до конца указанного месяца
    if (new Date(year, month, 1) <= new Date()) return "Срок действия карты истёк";
    if (cvc.length !== 3) return "Введите 3 цифры CVC";
    return "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const problem = validate();
    if (problem) return setError(problem);

    setBusy(true);
    await sleep(1800); // имитация «связи с банком»

    // Тестовая карта, имитирующая отказ банка
    if (number === "4000000000000002") {
      setBusy(false);
      return setError("Банк отклонил платёж. Попробуйте другую карту.");
    }

    // На сервер уходит только номер заказа, без данных карты
    const res = await payOrder(orderId);
    if (!res.ok) {
      setBusy(false);
      return setError(res.error ?? "Не удалось провести оплату");
    }
    router.push(`/account/orders/${orderId}?paid=1`);
    router.refresh();
  }

  function fillTest() {
    setNumber("4242424242424242");
    setName("IVAN PETROV");
    setExp("1230");
    setCvc("123");
    setError("");
  }

  return (
    <div>
      {/* Карта: переворачивается, когда вводите CVC */}
      <div className="mx-auto w-full max-w-sm [perspective:1000px]">
        <div
          className={`relative aspect-[1.586] w-full transition-transform duration-700 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Лицевая сторона */}
          <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#2b3440] via-[#171c23] to-[#0d1014] p-6 shadow-[0_20px_60px_-20px_var(--color-accent)] [backface-visibility:hidden]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative flex items-start justify-between">
              <svg viewBox="0 0 48 36" className="h-9 w-12">
                <rect width="48" height="36" rx="6" fill="#d4b254" />
                <path d="M0 12h48M0 24h48M16 0v36M32 0v36" stroke="#a88a2e" strokeWidth="1.5" />
              </svg>
              <span className="font-display text-lg font-bold tracking-wide">{brand || "CARD"}</span>
            </div>
            <p className="relative font-mono text-xl tracking-[0.15em] sm:text-2xl">
              {groupedNumber || "•••• •••• •••• ••••"}
            </p>
            <div className="relative flex items-end justify-between text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted">Владелец</p>
                <p className="font-semibold uppercase">{name || "IVAN PETROV"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted">Срок</p>
                <p className="font-semibold">{expShown || "ММ/ГГ"}</p>
              </div>
            </div>
          </div>

          {/* Обратная сторона */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#2b3440] via-[#171c23] to-[#0d1014] [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="mt-6 h-11 bg-black" />
            <div className="mx-6 mt-6 flex items-center gap-3">
              <div className="h-9 flex-1 rounded bg-white/90" />
              <div className="flex h-9 w-16 items-center justify-center rounded bg-white font-mono font-bold text-black">
                {cvc || "•••"}
              </div>
            </div>
            <p className="mx-6 mt-4 text-[10px] text-muted">Три цифры с обратной стороны карты</p>
          </div>
        </div>
      </div>

      {/* Поля. У них намеренно нет атрибута name: данные карты не отправляются никуда. */}
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Номер карты
          <input
            value={groupedNumber}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
            onFocus={() => setFlipped(false)}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
            className="input font-mono"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Имя владельца
          <input
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z\s.-]/g, ""))}
            onFocus={() => setFlipped(false)}
            autoComplete="cc-name"
            placeholder="IVAN PETROV"
            className="input"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-muted">
            Срок действия
            <input
              value={expShown}
              onChange={(e) => setExp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              onFocus={() => setFlipped(false)}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="ММ/ГГ"
              className="input font-mono"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            CVC
            <input
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="•••"
              className="input font-mono"
            />
          </label>
        </div>

        {error && (
          <p className="rounded-xl border border-bad/50 bg-bad/10 p-3 text-sm text-bad">{error}</p>
        )}

        <button type="submit" disabled={busy} className="btn btn-primary w-full py-4 text-lg disabled:opacity-60">
          {busy ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Проверяем платёж...
            </>
          ) : (
            <>Оплатить {money(amount)}</>
          )}
        </button>

        <p className="text-center text-xs text-muted">🔒 Данные карты не сохраняются и никуда не отправляются</p>
      </form>

      <div className="mt-6 rounded-xl border border-accent-2/40 bg-accent-2/10 p-4 text-sm">
        <p className="font-semibold text-accent-2">Демо-режим: деньги не списываются</p>
        <p className="mt-1 text-muted">
          Тестовая карта <span className="font-mono text-ink">4242 4242 4242 4242</span>, любой будущий срок и любой CVC.
          Карта <span className="font-mono text-ink">4000 0000 0000 0002</span> имитирует отказ банка.
        </p>
        <button type="button" onClick={fillTest} className="mt-3 text-accent underline">
          Заполнить тестовой картой
        </button>
      </div>
    </div>
  );
}

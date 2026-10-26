"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";

// Загрузчик фотографий внутри формы запчасти.
// Каждая фотография грузится сразу при выборе, а ссылки уходят вместе с формой.
export default function ImageUploader({ initial }: { initial: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setBusy(true);
    setError("");
    for (const file of files) {
      const body = new FormData();
      body.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Ошибка загрузки");
        setUrls((prev) => [...prev, data.url]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
        break;
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(i: number) {
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  function makeMain(i: number) {
    setUrls((prev) => [prev[i], ...prev.filter((_, idx) => idx !== i)]);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Эти скрытые поля несут ссылки на фото вместе с формой */}
      {urls.map((u) => (
        <input key={u} type="hidden" name="imageUrls" value={u} />
      ))}

      {urls.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((u, i) => (
            <li key={u} className="relative overflow-hidden rounded-xl border">
              <img src={u} alt="" className="aspect-square w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent">
                  Главное
                </span>
              )}
              <div className="flex justify-between gap-2 bg-black/60 px-2 py-1 text-xs">
                {i !== 0 ? (
                  <button type="button" onClick={() => makeMain(i)} className="underline">
                    Главным
                  </button>
                ) : (
                  <span />
                )}
                <button type="button" onClick={() => remove(i)} className="text-red-400 underline">
                  Убрать
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed p-4 text-sm text-gray-400 transition hover:border-white">
        {busy ? "Загружаю..." : "+ Добавить фото (JPG, PNG, WebP, до 4 МБ)"}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onPick}
          disabled={busy}
          className="hidden"
        />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

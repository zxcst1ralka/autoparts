"use client";

import { useActionState } from "react";
import Link from "next/link";
import { savePart } from "./actions";
import ImageUploader from "./ImageUploader";

type Option = { id: string; name: string };
type VehicleOption = { id: string; label: string };

type PartValues = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  brandId: string;
  categoryId: string;
  oemNumbers: string;
  specs: string;
  isActive: boolean;
  vehicleIds: string[];
  images: string[];
};

type Props = {
  brands: Option[];
  categories: Option[];
  vehicles: VehicleOption[];
  part?: PartValues; // если передано, значит редактируем
};

const card = "flex flex-col gap-4 rounded-2xl border bg-surface p-6";
const label = "flex flex-col gap-1 text-sm text-muted";

export default function PartForm({ brands, categories, vehicles, part }: Props) {
  const [state, formAction, pending] = useActionState(savePart, {});

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      {/* Скрытое поле: по нему сервер понимает, что это редактирование */}
      <input type="hidden" name="id" defaultValue={part?.id ?? ""} />

      <section className={card}>
        <h2 className="font-display text-lg font-bold">Основное</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={label}>
            Артикул
            <input name="sku" defaultValue={part?.sku} required className="input" />
          </label>
          <label className={`${label} sm:col-span-2`}>
            Название
            <input name="name" defaultValue={part?.name} required className="input" />
          </label>
        </div>
        <label className={label}>
          Описание
          <textarea name="description" defaultValue={part?.description} rows={3} className="input" />
        </label>
      </section>

      <section className={card}>
        <h2 className="font-display text-lg font-bold">Цена и склад</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Цена, ₽
            <input name="price" defaultValue={part?.price} inputMode="decimal" required className="input" />
          </label>
          <label className={label}>
            Остаток, шт.
            <input name="stock" defaultValue={part?.stock ?? 0} inputMode="numeric" required className="input" />
          </label>
        </div>
      </section>

      <section className={card}>
        <h2 className="font-display text-lg font-bold">Классификация</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Производитель
            <select name="brandId" defaultValue={part?.brandId ?? ""} required className="input">
              <option value="">Выберите...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label className={label}>
            Категория
            <select name="categoryId" defaultValue={part?.categoryId ?? ""} required className="input">
              <option value="">Выберите...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
        <label className={label}>
          OEM-номера (через запятую)
          <input name="oemNumbers" defaultValue={part?.oemNumbers} className="input" />
        </label>
        <label className={label}>
          Характеристики (каждая с новой строки, вида «Название: значение»)
          <textarea
            name="specs"
            defaultValue={part?.specs}
            rows={4}
            placeholder={"Диаметр: 280 мм\nТип: Вентилируемый"}
            className="input"
          />
        </label>
      </section>

      <section className={card}>
        <h2 className="font-display text-lg font-bold">Фотографии</h2>
        <ImageUploader initial={part?.images ?? []} />
      </section>

      <section className={card}>
        <h2 className="font-display text-lg font-bold">Подходит к автомобилям</h2>
        {vehicles.length === 0 ? (
          <p className="text-sm text-muted">Автомобилей пока нет. Добавьте их в разделе «Справочники».</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {vehicles.map((v) => (
              <label key={v.id} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  name="vehicleIds"
                  value={v.id}
                  defaultChecked={part?.vehicleIds.includes(v.id)}
                  className="accent-accent"
                />
                {v.label}
              </label>
            ))}
          </div>
        )}
      </section>

      <section className={card}>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isActive" defaultChecked={part?.isActive ?? true} className="accent-accent" />
          Показывать в каталоге
        </label>
      </section>

      {state.error && (
        <p className="rounded-xl border border-bad/50 bg-bad/10 p-3 text-sm text-bad">{state.error}</p>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-50">
          {pending ? "Сохраняю..." : "Сохранить"}
        </button>
        <Link href="/admin/parts" className="text-muted underline transition hover:text-accent">Отмена</Link>
      </div>
    </form>
  );
}

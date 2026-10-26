import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ConfirmButton from "./ConfirmButton";
import {
  createBrand,
  createCategory,
  createVehicle,
  deleteBrand,
  deleteCategory,
  deleteVehicle,
  updateBrand,
  updateCategory,
  updateVehicle,
} from "./actions";

export const dynamic = "force-dynamic";

const input = "rounded-xl border bg-surface-2 px-3 py-2 outline-none transition focus:border-accent";
const addButton = "btn btn-primary btn-sm";

export default async function DirectoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const [categories, brands, vehicles] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { parts: true } } },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { parts: true } } },
    }),
    prisma.vehicle.findMany({
      orderBy: [{ make: "asc" }, { model: "asc" }, { yearFrom: "asc" }],
      include: { _count: { select: { fitments: true } } },
    }),
  ]);

  return (
    <main>
      <Link href="/admin" className="text-sm text-gray-500 underline">
        ← В админку
      </Link>
      <h1 className="mt-4 mb-6 font-display text-3xl font-bold">Справочники</h1>

      {error && (
        <p className="mb-6 rounded-xl border border-bad/50 bg-bad/10 p-3 text-bad">
          {error}
        </p>
      )}

      {/* ───────── Категории ───────── */}
      <section className="mb-8 rounded-2xl border bg-surface p-6">
        <h2 className="mb-4 font-display text-xl font-bold">Категории ({categories.length})</h2>

        <form action={createCategory} className="mb-4 flex gap-3">
          <input name="name" placeholder="Новая категория" required className={`${input} flex-1`} />
          <button type="submit" className={addButton}>
            Добавить
          </button>
        </form>

        <ul className="flex flex-col gap-2">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3">
              <form action={updateCategory} className="flex flex-1 gap-2">
                <input type="hidden" name="id" value={c.id} />
                <input name="name" defaultValue={c.name} required className={`${input} flex-1`} />
                <button type="submit" className="text-sm text-accent underline">
                  Сохранить
                </button>
              </form>
              <span className="w-28 text-sm text-gray-500">
                запчастей: {c._count.parts}
              </span>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmButton label="Удалить" message={`Удалить категорию «${c.name}»?`} />
              </form>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── Производители ───────── */}
      <section className="mb-8 rounded-2xl border bg-surface p-6">
        <h2 className="mb-4 font-display text-xl font-bold">Производители ({brands.length})</h2>

        <form action={createBrand} className="mb-4 flex gap-3">
          <input name="name" placeholder="Новый производитель" required className={`${input} flex-1`} />
          <button type="submit" className={addButton}>
            Добавить
          </button>
        </form>

        <ul className="flex flex-col gap-2">
          {brands.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-3">
              <form action={updateBrand} className="flex flex-1 gap-2">
                <input type="hidden" name="id" value={b.id} />
                <input name="name" defaultValue={b.name} required className={`${input} flex-1`} />
                <button type="submit" className="text-sm text-accent underline">
                  Сохранить
                </button>
              </form>
              <span className="w-28 text-sm text-gray-500">
                запчастей: {b._count.parts}
              </span>
              <form action={deleteBrand}>
                <input type="hidden" name="id" value={b.id} />
                <ConfirmButton label="Удалить" message={`Удалить производителя «${b.name}»?`} />
              </form>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── Автомобили ───────── */}
      <section className="mb-8 rounded-2xl border bg-surface p-6">
        <h2 className="mb-4 font-display text-xl font-bold">Автомобили ({vehicles.length})</h2>

        <form action={createVehicle} className="mb-4 flex flex-wrap gap-3">
          <input name="make" placeholder="Марка" required className={`${input} w-36`} />
          <input name="model" placeholder="Модель" required className={`${input} w-36`} />
          <input name="yearFrom" placeholder="С года" inputMode="numeric" required className={`${input} w-24`} />
          <input name="yearTo" placeholder="По год" inputMode="numeric" className={`${input} w-24`} />
          <input name="engine" placeholder="Двигатель" className={`${input} w-32`} />
          <button type="submit" className={addButton}>
            Добавить
          </button>
        </form>

        <ul className="flex flex-col gap-2">
          {vehicles.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center gap-3">
              <form action={updateVehicle} className="flex flex-wrap gap-2">
                <input type="hidden" name="id" value={v.id} />
                <input name="make" defaultValue={v.make} required className={`${input} w-32`} />
                <input name="model" defaultValue={v.model} required className={`${input} w-32`} />
                <input name="yearFrom" defaultValue={v.yearFrom} inputMode="numeric" required className={`${input} w-20`} />
                <input name="yearTo" defaultValue={v.yearTo ?? ""} inputMode="numeric" className={`${input} w-20`} />
                <input name="engine" defaultValue={v.engine ?? ""} className={`${input} w-28`} />
                <button type="submit" className="text-sm text-accent underline">
                  Сохранить
                </button>
              </form>
              <span className="text-sm text-gray-500">запчастей: {v._count.fitments}</span>
              <form action={deleteVehicle}>
                <input type="hidden" name="id" value={v.id} />
                <ConfirmButton
                  label="Удалить"
                  message={`Удалить автомобиль «${v.make} ${v.model}»? Запчасти останутся, пропадёт только отметка, что они к нему подходят.`}
                />
              </form>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { plural } from "@/lib/format";
import PartCard from "@/components/PartCard";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

const SORTS: Record<
  string,
  { label: string; orderBy: Prisma.PartOrderByWithRelationInput }
> = {
  name: { label: "По названию", orderBy: { name: "asc" } },
  price_asc: { label: "Сначала дешёвые", orderBy: { price: "asc" } },
  price_desc: { label: "Сначала дорогие", orderBy: { price: "desc" } },
  new: { label: "Сначала новые", orderBy: { createdAt: "desc" } },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const q = one(sp.q).trim();
  const category = one(sp.category);
  const brand = one(sp.brand);
  const vehicle = one(sp.vehicle);
  const inStock = one(sp.stock) === "1";
  const sort = SORTS[one(sp.sort)] ? one(sp.sort) : "name";
  let page = Math.max(1, parseInt(one(sp.page)) || 1);

  const where: Prisma.PartWhereInput = { isActive: true };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { oemNumbers: { hasSome: [q, q.toUpperCase()] } },
    ];
  }
  if (category) {
    where.category = { OR: [{ slug: category }, { parent: { slug: category } }] };
  }
  if (brand) where.brand = { slug: brand };
  if (vehicle) where.fitments = { some: { vehicleId: vehicle } };
  if (inStock) where.stock = { gt: 0 };

  const total = await prisma.part.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  page = Math.min(page, totalPages);

  const [parts, categories, brands, vehicles] = await Promise.all([
    prisma.part.findMany({
      where,
      include: { brand: true, category: true, images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: SORTS[sort].orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ orderBy: [{ make: "asc" }, { model: "asc" }] }),
  ]);

  // Ссылка на каталог с текущими фильтрами, где можно поменять отдельные значения
  const current: Record<string, string> = {
    q,
    category,
    brand,
    vehicle,
    stock: inStock ? "1" : "",
    sort: sort !== "name" ? sort : "",
    page: "",
  };
  function buildHref(over: Record<string, string>) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...current, ...over })) {
      if (v) params.set(k, v);
    }
    const s = params.toString();
    return s ? `/catalog?${s}` : "/catalog";
  }

  const hasFilters = q || category || brand || vehicle || inStock || sort !== "name";
  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
      active
        ? "border-accent bg-accent text-on-accent"
        : "text-muted hover:border-accent hover:text-accent"
    }`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl font-bold">Каталог запчастей</h1>
          <p className="mt-1 text-muted">
            Найдено: {total} {plural(total, ["товар", "товара", "товаров"])}
          </p>
        </div>
        {hasFilters && (
          <Link href="/catalog" className="text-sm text-muted underline transition hover:text-accent">
            Сбросить всё
          </Link>
        )}
      </div>

      {/* Быстрые категории */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <Link href={buildHref({ category: "" })} className={chip(!category)}>
          Все
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={buildHref({ category: c.slug })} className={chip(category === c.slug)}>
            {c.name}
          </Link>
        ))}
      </div>

      {/* Поиск и фильтры */}
      <form
        method="GET"
        action="/catalog"
        className="mb-8 grid gap-3 rounded-2xl border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <input name="q" defaultValue={q} placeholder="Название, артикул или OEM" className="input lg:col-span-2" />
        <select name="vehicle" defaultValue={vehicle} className="input">
          <option value="">Любой автомобиль</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.make} {v.model} ({v.yearFrom}–{v.yearTo ?? "н.в."})
            </option>
          ))}
        </select>
        <select name="brand" defaultValue={brand} className="input">
          <option value="">Все производители</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} className="input">
          {Object.entries(SORTS).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input type="hidden" name="category" value={category} />

        <div className="flex items-center justify-between gap-4 sm:col-span-2 lg:col-span-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="stock" value="1" defaultChecked={inStock} className="accent-accent" />
            Только в наличии
          </label>
          <button type="submit" className="btn btn-primary">
            Применить
          </button>
        </div>
      </form>

      {parts.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <p className="text-lg font-semibold">Ничего не найдено</p>
          <p className="mt-2 text-muted">Попробуйте изменить условия поиска или сбросить фильтры.</p>
          <Link href="/catalog" className="btn btn-ghost mt-6">
            Сбросить фильтры
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {parts.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-6">
          {page > 1 ? (
            <Link href={buildHref({ page: String(page - 1) })} className="btn btn-ghost btn-sm">
              ← Назад
            </Link>
          ) : (
            <span className="px-3 text-muted/50">← Назад</span>
          )}
          <span className="text-sm text-muted">
            Страница {page} из {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={buildHref({ page: String(page + 1) })} className="btn btn-ghost btn-sm">
              Вперёд →
            </Link>
          ) : (
            <span className="px-3 text-muted/50">Вперёд →</span>
          )}
        </nav>
      )}
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addToCart } from "@/app/cart/actions";
import { money } from "@/lib/format";
import { SITE } from "@/lib/site";
import Gallery from "@/components/Gallery";
import PartCard from "@/components/PartCard";

export const dynamic = "force-dynamic";

export default async function PartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const part = await prisma.part.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      fitments: { include: { vehicle: true } },
    },
  });
  if (!part || !part.isActive) notFound();

  const related = await prisma.part.findMany({
    where: { isActive: true, categoryId: part.categoryId, NOT: { id: part.id } },
    include: { brand: true, category: true, images: { orderBy: { position: "asc" }, take: 1 } },
    take: 4,
  });

  const specs = Object.entries((part.specs ?? {}) as Record<string, string>);
  const inStock = part.stock > 0;
  const price = Number(part.price);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Хлебные крошки */}
      <nav className="mb-6 flex flex-wrap gap-2 text-sm text-muted">
        <Link href="/" className="transition hover:text-accent">Главная</Link>
        <span>/</span>
        <Link href="/catalog" className="transition hover:text-accent">Каталог</Link>
        <span>/</span>
        <Link href={`/catalog?category=${part.category.slug}`} className="transition hover:text-accent">
          {part.category.name}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery images={part.images.map((i) => i.url)} alt={part.name} slug={part.category.slug} />

        <div>
          <Link
            href={`/catalog?brand=${part.brand.slug}`}
            className="text-sm uppercase tracking-wider text-accent"
          >
            {part.brand.name}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight">{part.name}</h1>
          <p className="mt-2 text-sm text-muted">
            Артикул: {part.sku}
            {part.oemNumbers.length > 0 && <> · OEM: {part.oemNumbers.join(", ")}</>}
          </p>

          {/* Блок покупки */}
          <div className="mt-6 rounded-2xl border bg-surface p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="font-display text-4xl font-bold">{money(price)}</p>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  inStock ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad"
                }`}
              >
                {inStock ? `В наличии: ${part.stock} шт.` : "Нет в наличии"}
              </span>
            </div>

            {inStock ? (
              <form action={addToCart} className="mt-5 flex gap-3">
                <input type="hidden" name="partId" value={part.id} />
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  max={part.stock}
                  defaultValue={1}
                  className="input w-24"
                />
                <button type="submit" className="btn btn-primary flex-1">
                  Добавить в корзину
                </button>
              </form>
            ) : (
              <p className="mt-5 text-sm text-muted">Эта запчасть временно закончилась.</p>
            )}

            <ul className="mt-6 grid gap-3 border-t pt-5 text-sm text-muted">
              <li>🚚 Доставка 1–3 дня{price >= SITE.freeShippingFrom ? ", бесплатно" : ""}</li>
              <li>🛡️ Гарантия 1 год</li>
              <li>↩️ Возврат в течение 14 дней</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Описание, характеристики, применимость */}
      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        <section className="rounded-2xl border bg-surface p-6 lg:col-span-2">
          {part.description && (
            <>
              <h2 className="mb-3 font-display text-xl font-bold">Описание</h2>
              <p className="text-muted">{part.description}</p>
            </>
          )}
          {specs.length > 0 && (
            <>
              <h2 className="mt-8 mb-3 font-display text-xl font-bold">Характеристики</h2>
              <table className="w-full text-left text-sm">
                <tbody>
                  {specs.map(([name, value]) => (
                    <tr key={name} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-muted">{name}</td>
                      <td className="py-3 font-medium">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {!part.description && specs.length === 0 && (
            <p className="text-muted">Подробное описание скоро появится.</p>
          )}
        </section>

        <section className="rounded-2xl border bg-surface p-6">
          <h2 className="mb-3 font-display text-xl font-bold">Подходит к авто</h2>
          {part.fitments.length === 0 ? (
            <p className="text-sm text-muted">Список автомобилей уточняется.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {part.fitments.map(({ vehicle }) => (
                <li key={vehicle.id}>
                  <Link
                    href={`/catalog?vehicle=${vehicle.id}`}
                    className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2 transition hover:text-accent"
                  >
                    <span>
                      {vehicle.make} {vehicle.model}
                    </span>
                    <span className="text-muted">
                      {vehicle.yearFrom}–{vehicle.yearTo ?? "н.в."}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">Похожие запчасти</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <PartCard key={p.id} part={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

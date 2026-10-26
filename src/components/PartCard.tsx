import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { addToCart } from "@/app/cart/actions";
import { money } from "@/lib/format";
import PartVisual from "./PartVisual";

export type CardPart = Prisma.PartGetPayload<{
  include: { brand: true; category: true; images: true };
}>;

// Карточка запчасти: используется в каталоге, на главной и в «похожих»
export default function PartCard({ part }: { part: CardPart }) {
  const inStock = part.stock > 0;
  const low = inStock && part.stock <= 5;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_16px_40px_-16px_var(--color-accent)]">
      <Link href={`/parts/${part.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <PartVisual src={part.images[0]?.url} slug={part.category.slug} alt={part.name} />
        <div className="absolute left-3 top-3 flex gap-2 text-xs font-semibold">
          {!inStock && (
            <span className="rounded-full bg-black/70 px-2.5 py-1 text-bad backdrop-blur">
              Нет в наличии
            </span>
          )}
          {low && (
            <span className="rounded-full bg-accent-2 px-2.5 py-1 text-black">
              Осталось {part.stock}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wider text-muted">{part.brand.name}</p>
        <Link
          href={`/parts/${part.slug}`}
          className="line-clamp-2 font-semibold leading-snug transition hover:text-accent"
        >
          {part.name}
        </Link>
        <p className="text-xs text-muted">Арт. {part.sku}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <p className="font-display text-lg font-bold sm:text-xl">{money(part.price)}</p>
          <form action={addToCart}>
            <input type="hidden" name="partId" value={part.id} />
            <input type="hidden" name="quantity" value="1" />
            <button
              type="submit"
              disabled={!inStock}
              className="btn btn-primary btn-sm disabled:opacity-40"
            >
              В корзину
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

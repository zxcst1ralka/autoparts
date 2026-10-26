import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import PartVisual from "@/components/PartVisual";
import DeleteButton from "./DeleteButton";
import { deletePart } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPartsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const where: Prisma.PartWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const parts = await prisma.part.findMany({
    where,
    include: { brand: true, category: true, images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Запчасти ({parts.length})</h1>
        <Link href="/admin/parts/new" className="btn btn-primary">+ Добавить</Link>
      </div>

      <form method="GET" className="mb-6 flex gap-3">
        <input name="q" defaultValue={query} placeholder="Поиск по названию или артикулу" className="input max-w-md" />
        <button type="submit" className="btn btn-ghost">Найти</button>
        {query && <Link href="/admin/parts" className="self-center text-sm text-muted underline">Сбросить</Link>}
      </form>

      {parts.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-muted">Ничего не найдено.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-muted">
              <tr>
                <th className="px-4 py-3">Запчасть</th>
                <th className="px-4 py-3">Категория</th>
                <th className="px-4 py-3">Цена</th>
                <th className="px-4 py-3">Остаток</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id} className="border-b last:border-0 transition hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="group h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <PartVisual src={part.images[0]?.url} slug={part.category.slug} alt="" />
                      </div>
                      <div>
                        <p className="font-semibold">{part.name}</p>
                        <p className="text-xs text-muted">{part.sku} · {part.brand.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{part.category.name}</td>
                  <td className="px-4 py-3 font-semibold">{money(part.price)}</td>
                  <td className="px-4 py-3">
                    <span className={part.stock === 0 ? "text-bad" : part.stock <= 5 ? "text-accent-2" : ""}>{part.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${part.isActive ? "bg-ok/15 text-ok" : "bg-surface-2 text-muted"}`}>
                      {part.isActive ? "В каталоге" : "Скрыта"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link href={`/admin/parts/${part.id}`} className="text-accent underline">Изменить</Link>
                      <form action={deletePart}>
                        <input type="hidden" name="id" value={part.id} />
                        <DeleteButton />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

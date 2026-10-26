import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PartForm from "../PartForm";

export const dynamic = "force-dynamic";

export default async function EditPartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [part, brands, categories, vehicles] = await Promise.all([
    prisma.part.findUnique({
      where: { id },
      include: { fitments: true, images: { orderBy: { position: "asc" } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ orderBy: [{ make: "asc" }, { model: "asc" }] }),
  ]);

  if (!part) notFound();

  // Превращаем характеристики обратно в текст «Название: значение» по строкам
  const specsText = Object.entries((part.specs ?? {}) as Record<string, string>)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return (
    <main>
      <Link href="/admin/parts" className="text-sm text-gray-500 underline">
        ← К списку запчастей
      </Link>
      <h1 className="mt-4 mb-6 text-3xl font-bold">Редактирование: {part.name}</h1>

      <PartForm
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        vehicles={vehicles.map((v) => ({
          id: v.id,
          label: `${v.make} ${v.model} (${v.yearFrom}–${v.yearTo ?? "н.в."})`,
        }))}
        part={{
          id: part.id,
          sku: part.sku,
          name: part.name,
          description: part.description ?? "",
          price: Number(part.price), // Decimal нельзя передавать в форму, переводим в число
          stock: part.stock,
          brandId: part.brandId,
          categoryId: part.categoryId,
          oemNumbers: part.oemNumbers.join(", "),
          specs: specsText,
          isActive: part.isActive,
          vehicleIds: part.fitments.map((f) => f.vehicleId),
          images: part.images.map((i) => i.url),
        }}
      />
    </main>
  );
}

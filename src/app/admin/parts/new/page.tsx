import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PartForm from "../PartForm";

export const dynamic = "force-dynamic";

export default async function NewPartPage() {
  const [brands, categories, vehicles] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ orderBy: [{ make: "asc" }, { model: "asc" }] }),
  ]);

  return (
    <main>
      <Link href="/admin/parts" className="text-sm text-gray-500 underline">
        ← К списку запчастей
      </Link>
      <h1 className="mt-4 mb-6 text-3xl font-bold">Новая запчасть</h1>

      <PartForm
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        vehicles={vehicles.map((v) => ({
          id: v.id,
          label: `${v.make} ${v.model} (${v.yearFrom}–${v.yearTo ?? "н.в."})`,
        }))}
      />
    </main>
  );
}

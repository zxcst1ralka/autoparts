import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ВАЖНО: все данные ниже тестовые, артикулы выдуманные.
// Скрипт можно запускать повторно: дубликаты не создаются.

// Иллюстрации лежат в папке public/demo
const DEMO_IMAGES: Record<string, string> = {
  "BRK-0001": "/demo/brake-pads.svg",
  "BRK-0002": "/demo/brake-disc.svg",
  "FLT-0001": "/demo/oil-filter.svg",
  "FLT-0002": "/demo/air-filter.svg",
  "SUS-0001": "/demo/shock-absorber.svg",
  "IGN-0001": "/demo/spark-plug.svg",
};

async function main() {
  // ── Производители ──
  const brandData = [
    { name: "Brembo", slug: "brembo" },
    { name: "Mann-Filter", slug: "mann-filter" },
    { name: "Sachs", slug: "sachs" },
    { name: "Bosch", slug: "bosch" },
  ];
  const brands: Record<string, string> = {};
  for (const b of brandData) {
    const row = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brands[b.slug] = row.id;
  }

  // ── Категории ──
  const categoryData = [
    { name: "Тормозная система", slug: "brakes" },
    { name: "Фильтры", slug: "filters" },
    { name: "Подвеска", slug: "suspension" },
    { name: "Зажигание", slug: "ignition" },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories[c.slug] = row.id;
  }

  // ── Автомобили ──
  const vehicleData = [
    { make: "Toyota", model: "Camry", yearFrom: 2012, yearTo: 2017, engine: "2.5" },
    { make: "Volkswagen", model: "Polo", yearFrom: 2010, yearTo: 2020, engine: "1.6" },
    { make: "Skoda", model: "Octavia", yearFrom: 2013, yearTo: 2020, engine: "1.4 TSI" },
  ];
  const vehicleIds: string[] = [];
  for (const v of vehicleData) {
    const found = await prisma.vehicle.findFirst({
      where: { make: v.make, model: v.model, yearFrom: v.yearFrom },
    });
    const row = found ?? (await prisma.vehicle.create({ data: v }));
    vehicleIds.push(row.id);
  }

  // ── Запчасти ──
  // fits: номера автомобилей из списка выше (0 = Camry, 1 = Polo, 2 = Octavia)
  const partData = [
    {
      sku: "BRK-0001",
      slug: "brake-pads-front-brk0001",
      name: "Колодки тормозные передние",
      description: "Комплект передних дисковых колодок. Тестовые данные.",
      oemNumbers: ["TEST-OEM-1001"],
      price: 4290,
      stock: 12,
      brand: "brembo",
      category: "brakes",
      specs: { Позиция: "Передняя", Тип: "Дисковые" },
      fits: [0, 1],
    },
    {
      sku: "BRK-0002",
      slug: "brake-disc-front-brk0002",
      name: "Диск тормозной передний",
      description: "Вентилируемый тормозной диск, продаётся поштучно. Тестовые данные.",
      oemNumbers: ["TEST-OEM-1002"],
      price: 5890,
      stock: 6,
      brand: "brembo",
      category: "brakes",
      specs: { Диаметр: "280 мм", Тип: "Вентилируемый" },
      fits: [0, 2],
    },
    {
      sku: "FLT-0001",
      slug: "oil-filter-flt0001",
      name: "Фильтр масляный",
      description: "Масляный фильтр для бензиновых двигателей. Тестовые данные.",
      oemNumbers: ["TEST-OEM-2001"],
      price: 690,
      stock: 40,
      brand: "mann-filter",
      category: "filters",
      specs: { Тип: "Накручиваемый" },
      fits: [0, 1, 2],
    },
    {
      sku: "FLT-0002",
      slug: "air-filter-flt0002",
      name: "Фильтр воздушный",
      description: "Воздушный фильтр двигателя. Тестовые данные.",
      oemNumbers: ["TEST-OEM-2002"],
      price: 980,
      stock: 25,
      brand: "mann-filter",
      category: "filters",
      specs: { Тип: "Панельный" },
      fits: [1, 2],
    },
    {
      sku: "SUS-0001",
      slug: "shock-absorber-rear-sus0001",
      name: "Амортизатор задний",
      description: "Газомасляный задний амортизатор. Тестовые данные.",
      oemNumbers: ["TEST-OEM-3001"],
      price: 3590,
      stock: 0,
      brand: "sachs",
      category: "suspension",
      specs: { Позиция: "Задняя", Тип: "Газомасляный" },
      fits: [0],
    },
    {
      sku: "IGN-0001",
      slug: "spark-plug-ign0001",
      name: "Свеча зажигания",
      description: "Свеча зажигания, продаётся поштучно. Тестовые данные.",
      oemNumbers: ["TEST-OEM-4001"],
      price: 450,
      stock: 100,
      brand: "bosch",
      category: "ignition",
      specs: { Резьба: "M14x1.25" },
      fits: [0, 1, 2],
    },
  ];

  for (const p of partData) {
    const part = await prisma.part.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        description: p.description,
        oemNumbers: p.oemNumbers,
        price: p.price,
        stock: p.stock,
        specs: p.specs,
        brandId: brands[p.brand],
        categoryId: categories[p.category],
      },
    });

    await prisma.fitment.createMany({
      data: p.fits.map((i) => ({ partId: part.id, vehicleId: vehicleIds[i] })),
      skipDuplicates: true,
    });

    // Фото добавляем, только если у запчасти их ещё нет
    const demo = DEMO_IMAGES[p.sku];
    if (demo && (await prisma.partImage.count({ where: { partId: part.id } })) === 0) {
      await prisma.partImage.create({
        data: { partId: part.id, url: demo, position: 0, isMain: true },
      });
    }
  }

  console.log("Готово: тестовые данные добавлены.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

// Добавляет в каталог ещё 14 запчастей (вместе с первыми шестью получится 20),
// новые категории, производителей и автомобили.
// Можно запускать повторно: ничего не задвоится.

type PartSeed = {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  category: string;
  specs: Record<string, string>;
  image: string;
  fits: string[]; // «Марка Модель»
};

const ALL = [
  "Toyota Camry",
  "Volkswagen Polo",
  "Skoda Octavia",
  "Hyundai Solaris",
  "Kia Rio",
  "Lada Vesta",
  "Lada Granta",
];

const PARTS: PartSeed[] = [
  {
    sku: "ENG-0001",
    name: "Ремень ГРМ",
    description: "Зубчатый ремень привода газораспределительного механизма с кордом из стекловолокна. Заменяется комплектом с роликами.",
    price: 2190,
    stock: 18,
    brand: "Gates",
    category: "Двигатель",
    specs: { "Количество зубьев": "114", Ширина: "25 мм", Материал: "Резина с кордом" },
    image: "/demo/timing-belt.svg",
    fits: ["Volkswagen Polo", "Skoda Octavia", "Hyundai Solaris", "Kia Rio", "Lada Vesta"],
  },
  {
    sku: "ENG-0002",
    name: "Насос водяной (помпа)",
    description: "Водяной насос системы охлаждения с металлической крыльчаткой и надёжным сальником.",
    price: 3490,
    stock: 9,
    brand: "Bosch",
    category: "Двигатель",
    specs: { Крыльчатка: "Металлическая", Привод: "Ремень ГРМ", Гарантия: "12 месяцев" },
    image: "/demo/water-pump.svg",
    fits: ["Volkswagen Polo", "Skoda Octavia", "Lada Vesta", "Lada Granta"],
  },
  {
    sku: "ELE-0001",
    name: "Аккумулятор 60 А·ч",
    description: "Стартерная аккумуляторная батарея, необслуживаемая, с повышенным пусковым током для холодных зим.",
    price: 7890,
    stock: 7,
    brand: "Varta",
    category: "Электрика",
    specs: { Ёмкость: "60 А·ч", "Пусковой ток": "540 А", Напряжение: "12 В", Полярность: "Обратная" },
    image: "/demo/battery.svg",
    fits: ALL,
  },
  {
    sku: "ELE-0002",
    name: "Лампа галогенная H7 (комплект 2 шт.)",
    description: "Галогенные лампы ближнего света с увеличенной яркостью и более белым светом.",
    price: 890,
    stock: 60,
    brand: "Osram",
    category: "Электрика",
    specs: { Цоколь: "PX26d", Мощность: "55 Вт", Напряжение: "12 В", "В комплекте": "2 шт." },
    image: "/demo/bulb-h7.svg",
    fits: ["Toyota Camry", "Volkswagen Polo", "Skoda Octavia", "Hyundai Solaris", "Kia Rio"],
  },
  {
    sku: "ELE-0003",
    name: "Щётки стеклоочистителя (комплект)",
    description: "Каркасные щётки с графитовым покрытием, работают тихо и не оставляют полос.",
    price: 1490,
    stock: 22,
    brand: "Bosch",
    category: "Электрика",
    specs: { Размеры: "600 и 450 мм", Тип: "Каркасные", "В комплекте": "2 шт." },
    image: "/demo/wipers.svg",
    fits: ALL,
  },
  {
    sku: "FLD-0001",
    name: "Масло моторное 5W-30, 4 л",
    description: "Синтетическое моторное масло для современных бензиновых и дизельных двигателей.",
    price: 3890,
    stock: 31,
    brand: "Castrol",
    category: "Масла и жидкости",
    specs: { Вязкость: "5W-30", Основа: "Синтетика", Объём: "4 л" },
    image: "/demo/motor-oil.svg",
    fits: ALL,
  },
  {
    sku: "FLD-0002",
    name: "Тормозная жидкость DOT 4, 0,5 л",
    description: "Тормозная жидкость с высокой температурой кипения для дисковых и барабанных систем.",
    price: 390,
    stock: 4,
    brand: "Liqui Moly",
    category: "Масла и жидкости",
    specs: { Класс: "DOT 4", Объём: "0,5 л", "Температура кипения": "от 260 °C" },
    image: "/demo/brake-fluid.svg",
    fits: ALL,
  },
  {
    sku: "FLD-0003",
    name: "Антифриз G12, 5 кг",
    description: "Готовая к применению охлаждающая жидкость, защищает систему от коррозии и накипи.",
    price: 1290,
    stock: 26,
    brand: "Liqui Moly",
    category: "Масла и жидкости",
    specs: { Класс: "G12", Масса: "5 кг", "Защита от замерзания": "до −40 °C" },
    image: "/demo/antifreeze.svg",
    fits: ALL,
  },
  {
    sku: "SUS-0002",
    name: "Стойка стабилизатора передняя",
    description: "Тяга стабилизатора поперечной устойчивости с шарнирами на усиленных пыльниках.",
    price: 1190,
    stock: 14,
    brand: "Lemförder",
    category: "Подвеска",
    specs: { Позиция: "Передняя", Материал: "Сталь", Пыльник: "Усиленный" },
    image: "/demo/stabilizer-link.svg",
    fits: ["Toyota Camry", "Hyundai Solaris", "Kia Rio", "Volkswagen Polo"],
  },
  {
    sku: "SUS-0003",
    name: "Подшипник ступицы передний",
    description: "Ступичный подшипник в сборе, не требует регулировки. Поставляется со смазкой на весь срок службы.",
    price: 2790,
    stock: 5,
    brand: "SKF",
    category: "Подвеска",
    specs: { Позиция: "Передний", Тип: "Шариковый, двухрядный", Обслуживание: "Не требуется" },
    image: "/demo/wheel-bearing.svg",
    fits: ["Hyundai Solaris", "Kia Rio", "Lada Vesta", "Lada Granta", "Volkswagen Polo"],
  },
  {
    sku: "SUS-0004",
    name: "Шаровая опора",
    description: "Шаровая опора рычага подвески с кованым корпусом и защитным чехлом.",
    price: 1650,
    stock: 0,
    brand: "Lemförder",
    category: "Подвеска",
    specs: { Позиция: "Нижняя", Корпус: "Кованый", Пыльник: "Резиновый" },
    image: "/demo/ball-joint.svg",
    fits: ["Toyota Camry", "Skoda Octavia", "Volkswagen Polo"],
  },
  {
    sku: "TRN-0001",
    name: "Диск сцепления",
    description: "Ведомый диск сцепления с демпфером крутильных колебаний для плавного включения.",
    price: 4590,
    stock: 6,
    brand: "Valeo",
    category: "Трансмиссия",
    specs: { Диаметр: "228 мм", "Количество шлицев": "20", Демпфер: "Да" },
    image: "/demo/clutch-disc.svg",
    fits: ["Volkswagen Polo", "Skoda Octavia", "Lada Vesta", "Lada Granta"],
  },
  {
    sku: "FLT-0003",
    name: "Фильтр салонный угольный",
    description: "Салонный фильтр с активированным углём: задерживает пыль, пыльцу и неприятные запахи.",
    price: 750,
    stock: 45,
    brand: "Mann-Filter",
    category: "Фильтры",
    specs: { Тип: "Угольный", Материал: "Нетканый, с активированным углём" },
    image: "/demo/cabin-filter.svg",
    fits: ["Toyota Camry", "Volkswagen Polo", "Skoda Octavia", "Hyundai Solaris", "Kia Rio"],
  },
  {
    sku: "IGN-0002",
    name: "Катушка зажигания",
    description: "Индивидуальная катушка зажигания с наконечником, обеспечивает стабильную искру и экономию топлива.",
    price: 2390,
    stock: 12,
    brand: "Bosch",
    category: "Зажигание",
    specs: { Тип: "Индивидуальная", Напряжение: "12 В", Контактов: "3" },
    image: "/demo/ignition-coil.svg",
    fits: ["Volkswagen Polo", "Skoda Octavia", "Hyundai Solaris", "Kia Rio"],
  },
];

const NEW_VEHICLES = [
  { make: "Hyundai", model: "Solaris", yearFrom: 2017, yearTo: 2021, engine: "1.6" },
  { make: "Kia", model: "Rio", yearFrom: 2017, yearTo: 2021, engine: "1.6" },
  { make: "Lada", model: "Vesta", yearFrom: 2015, yearTo: null, engine: "1.6" },
  { make: "Lada", model: "Granta", yearFrom: 2018, yearTo: null, engine: "1.6" },
];

// Если «адрес» (slug) занят, добавляем -2, -3...
async function freeSlug(base: string, taken: (s: string) => Promise<unknown>) {
  let slug = base;
  let i = 2;
  while (await taken(slug)) slug = `${base}-${i++}`;
  return slug;
}

async function brandId(name: string) {
  const found = await prisma.brand.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (found) return found.id;
  const slug = await freeSlug(slugify(name), (s) => prisma.brand.findUnique({ where: { slug: s } }));
  return (await prisma.brand.create({ data: { name, slug } })).id;
}

async function categoryId(name: string) {
  const found = await prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (found) return found.id;
  const slug = await freeSlug(slugify(name), (s) => prisma.category.findUnique({ where: { slug: s } }));
  return (await prisma.category.create({ data: { name, slug } })).id;
}

async function main() {
  // Автомобили
  for (const v of NEW_VEHICLES) {
    const found = await prisma.vehicle.findFirst({
      where: { make: v.make, model: v.model, yearFrom: v.yearFrom },
    });
    if (!found) await prisma.vehicle.create({ data: v });
  }

  // «Марка Модель» -> id автомобиля
  const vehicles = await prisma.vehicle.findMany();
  const vehicleByName = new Map<string, string>();
  for (const v of vehicles) {
    const key = `${v.make} ${v.model}`;
    if (!vehicleByName.has(key)) vehicleByName.set(key, v.id);
  }

  let added = 0;
  for (const p of PARTS) {
    const part = await prisma.part.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        slug: `${slugify(p.name)}-${p.sku.toLowerCase()}`,
        name: p.name,
        description: p.description,
        oemNumbers: [`TEST-OEM-${p.sku}`],
        price: p.price,
        stock: p.stock,
        specs: p.specs,
        brandId: await brandId(p.brand),
        categoryId: await categoryId(p.category),
      },
    });

    const vehicleIds = p.fits
      .map((name) => vehicleByName.get(name))
      .filter((id): id is string => Boolean(id));
    await prisma.fitment.createMany({
      data: vehicleIds.map((vehicleId) => ({ partId: part.id, vehicleId })),
      skipDuplicates: true,
    });

    if ((await prisma.partImage.count({ where: { partId: part.id } })) === 0) {
      await prisma.partImage.create({
        data: { partId: part.id, url: p.image, position: 0, isMain: true },
      });
      added++;
    }
  }

  const total = await prisma.part.count();
  console.log(`Готово. Запчастей в каталоге: ${total}. Новых иллюстраций привязано: ${added}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

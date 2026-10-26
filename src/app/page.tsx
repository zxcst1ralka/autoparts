import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { plural } from "@/lib/format";
import Hero from "@/components/Hero";
import PartCard from "@/components/PartCard";
import PartIcon from "@/components/PartIcon";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

const BENEFITS = [
  { icon: "🛡️", title: "Гарантия 1 год", text: "На всю продукцию. Если что-то не так, заменим или вернём деньги." },
  { icon: "🚚", title: "Быстрая доставка", text: "От 1 до 3 дней по России. Бесплатно при заказе от 5 000 ₽." },
  { icon: "🎯", title: "Точный подбор", text: "Отмечаем, к каким автомобилям подходит каждая запчасть." },
  { icon: "↩️", title: "Возврат 14 дней", text: "Не подошло? Вернём без лишних вопросов, пока деталь не установлена." },
];

const STEPS = [
  { n: "01", title: "Выберите авто", text: "Марка, модель и год: так мы покажем только подходящее." },
  { n: "02", title: "Найдите деталь", text: "Фильтры, поиск по артикулу и OEM-номеру, сравнение цен." },
  { n: "03", title: "Получите заказ", text: "Оплата онлайн, доставка до двери или самовывоз." },
];

// Плитки категорий разной величины: первая большая, вторая широкая
const spanFor = (i: number) =>
  i === 0 ? "md:col-span-2 md:row-span-2" : i === 1 ? "md:col-span-2" : "";

export default async function Home() {
  const [vehicles, brands, categories, newest, partsTotal, vehiclesTotal] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: [{ make: "asc" }, { model: "asc" }] }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { parts: { where: { isActive: true } } } } },
    }),
    prisma.part.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { brand: true, category: true, images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.part.count({ where: { isActive: true } }),
    prisma.vehicle.count(),
  ]);

  const stats = [
    { value: partsTotal, label: plural(partsTotal, ["запчасть", "запчасти", "запчастей"]) },
    { value: brands.length, label: plural(brands.length, ["производитель", "производителя", "производителей"]) },
    { value: vehiclesTotal, label: plural(vehiclesTotal, ["модель авто", "модели авто", "моделей авто"]) },
  ];

  return (
    <main>
      <Hero
        vehicles={vehicles.map((v) => ({
          id: v.id,
          label: `${v.make} ${v.model} (${v.yearFrom}–${v.yearTo ?? "н.в."})`,
        }))}
        popular={categories.slice(0, 4).map((c) => ({ slug: c.slug, name: c.name }))}
        stats={stats}
      />

      {/* Категории: плитки разного размера */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-20">
          <Reveal>
            <h2 className="font-display text-3xl font-bold">Что ищете?</h2>
            <p className="mt-2 text-muted">Выберите раздел каталога</p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:auto-rows-[170px] md:grid-cols-4">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={i * 70} className={spanFor(i)}>
                <Link
                  href={`/catalog?category=${c.slug}`}
                  className="group relative flex h-full min-h-40 flex-col justify-between overflow-hidden rounded-3xl border bg-surface p-6 transition duration-300 hover:border-accent/60"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-transparent to-accent/10 opacity-0 transition duration-500 group-hover:opacity-100" />
                  <PartIcon
                    slug={c.slug}
                    className={`absolute -bottom-4 -right-4 text-line transition duration-700 group-hover:rotate-12 group-hover:text-accent/40 ${
                      i === 0 ? "h-56 w-56" : "h-28 w-28"
                    }`}
                  />
                  <p className="relative text-sm text-muted">
                    {c._count.parts} {plural(c._count.parts, ["товар", "товара", "товаров"])}
                  </p>
                  <div className="relative flex items-end justify-between gap-3">
                    <p className={`font-display font-bold ${i === 0 ? "text-3xl" : "text-xl"}`}>{c.name}</p>
                    <span className="text-xl text-muted transition group-hover:translate-x-1 group-hover:text-accent">→</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Новинки */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">Новинки</h2>
            <p className="mt-2 text-muted">Свежие поступления в каталог</p>
          </div>
          <Link href="/catalog?sort=new" className="text-sm text-muted transition hover:text-accent">
            Смотреть все →
          </Link>
        </Reveal>

        {newest.length === 0 ? (
          <p className="mt-8 text-muted">Пока в каталоге ничего нет.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {newest.map((part, i) => (
              <Reveal key={part.id} delay={(i % 4) * 80}>
                <PartCard part={part} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Преимущества */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <Reveal>
          <h2 className="font-display text-3xl font-bold">Почему мы</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 80}>
              <div className="h-full rounded-2xl border bg-surface p-6 transition hover:border-accent/60">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-2xl">
                  {b.icon}
                </div>
                <p className="font-semibold">{b.title}</p>
                <p className="mt-2 text-sm text-muted">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Бренды: облако ссылок вместо бегущей строки */}
      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-20">
          <Reveal>
            <div className="rounded-3xl border bg-surface p-8">
              <h2 className="font-display text-2xl font-bold">Работаем с проверенными брендами</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/catalog?brand=${b.slug}`}
                    className="rounded-full border bg-surface-2 px-5 py-2 font-semibold transition hover:border-accent hover:text-accent"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Как это работает */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <Reveal>
          <h2 className="font-display text-3xl font-bold">Как это работает</h2>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="relative overflow-hidden rounded-2xl border bg-surface p-6">
                <span className="font-display text-7xl font-bold text-surface-2">{s.n}</span>
                <p className="mt-2 text-lg font-semibold">{s.title}</p>
                <p className="mt-2 text-sm text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Призыв к действию */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent to-accent-2 p-10 text-on-accent sm:p-14">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
            <h2 className="relative font-display text-3xl font-bold sm:text-4xl">Не знаете, что нужно?</h2>
            <p className="relative mt-3 max-w-xl opacity-80">
              Начните с выбора автомобиля: мы отфильтруем каталог и покажем только подходящие запчасти.
            </p>
            <Link href="/catalog" className="btn relative mt-6 bg-black text-white hover:bg-black/80">
              Открыть каталог →
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

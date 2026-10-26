import Link from "next/link";
import { SITE } from "@/lib/site";
import BrakeDisc from "./BrakeDisc";
import Caliper from "./Caliper";
import Tachometer from "./Tachometer";

type Props = {
  vehicles: { id: string; label: string }[];
  popular: { slug: string; name: string }[];
  stats: { value: number; label: string }[];
};

// Заставка: видео (если подключено), сетка, линии скорости, а справа колесо
// с суппортом и тахометром, стрелка которого «газует»
export default function Hero({ vehicles, popular, stats }: Props) {
  return (
    <section className="relative isolate overflow-hidden">
      {SITE.heroVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 -z-30 h-full w-full object-cover opacity-40"
        >
          <source src={SITE.heroVideo} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-bg via-bg/85 to-bg/30" />
      <div className="bg-grid hero-mask absolute inset-0 -z-20 opacity-40" />
      <div className="absolute -right-32 top-1/2 -z-10 h-[620px] w-[620px] -translate-y-1/2 animate-glow rounded-full bg-accent/25 blur-[130px]" />

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {[10, 24, 38, 52, 66, 80, 92].map((top, i) => (
          <span
            key={top}
            className="absolute left-full h-px w-56 animate-speed bg-gradient-to-l from-accent to-transparent"
            style={{
              top: `${top}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${1.5 + (i % 4) * 0.35}s`,
            }}
          />
        ))}
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-surface/70 px-3 py-1 text-xs text-muted backdrop-blur">
            <span className="h-2 w-2 animate-glow rounded-full bg-ok" />
            Подбор по автомобилю за 10 секунд
          </p>

          <h1 className="font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
            Запчасти, которые <span className="text-accent">точно подойдут</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Выберите свой автомобиль, и мы покажем только то, что встанет без
            переделок. Оригинал и проверенные аналоги, быстрая доставка.
          </p>

          <div className="mt-8 max-w-xl rounded-2xl border bg-surface/80 p-4 backdrop-blur">
            <form action="/catalog" method="GET" className="flex flex-col gap-3 sm:flex-row">
              <select name="vehicle" defaultValue="" className="input flex-1">
                <option value="">Выберите автомобиль</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary">
                Подобрать
              </button>
            </form>
            <form action="/catalog" method="GET" className="mt-3 flex gap-3">
              <input name="q" placeholder="или артикул, OEM-номер, название" className="input flex-1" />
              <button type="submit" className="btn btn-ghost">
                Найти
              </button>
            </form>
          </div>

          {popular.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Популярное:</span>
              {popular.map((c) => (
                <Link
                  key={c.slug}
                  href={`/catalog?category=${c.slug}`}
                  className="rounded-full border px-3 py-1 text-muted transition hover:border-accent hover:text-accent"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {/* Цифры прямо на заставке, без отдельной полосы */}
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-display text-3xl font-bold text-accent">{s.value}</dd>
                <dt className="text-sm text-muted">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Колесо: вращающийся диск, поверх него шкала тахометра со стрелкой и суппорт */}
        <div className="relative mx-auto aspect-square w-full max-w-xs sm:max-w-md lg:max-w-lg">
          <div className="absolute inset-[15%] animate-spin-slow">
            <BrakeDisc />
          </div>
          <div className="pointer-events-none absolute inset-0">
            <Tachometer />
          </div>
          <div className="absolute inset-[15%]">
            <Caliper />
          </div>

          <div className="absolute -left-4 top-6 hidden animate-float rounded-2xl border bg-surface/90 px-4 py-3 text-sm backdrop-blur lg:block">
            <p className="font-semibold">Гарантия 1 год</p>
            <p className="text-muted">на всё в каталоге</p>
          </div>
          <div className="absolute -right-2 bottom-10 hidden animate-float rounded-2xl border bg-surface/90 px-4 py-3 text-sm backdrop-blur [animation-delay:1.5s] lg:block">
            <p className="font-semibold">Доставка 1–3 дня</p>
            <p className="text-muted">по всей России</p>
          </div>
        </div>
      </div>
    </section>
  );
}

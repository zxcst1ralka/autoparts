import Link from "next/link";
import { SITE } from "@/lib/site";
import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-lg font-bold">{SITE.name}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted">{SITE.tagline}. Подбор по автомобилю, оригинал и аналоги, доставка по всей России.</p>
        </div>

        <div>
          <p className="mb-3 font-semibold">Магазин</p>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            <li><Link href="/catalog" className="transition hover:text-accent">Каталог</Link></li>
            <li><Link href="/cart" className="transition hover:text-accent">Корзина</Link></li>
            <li><Link href="/account" className="transition hover:text-accent">Личный кабинет</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-semibold">Контакты</p>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            <li>{SITE.phone}</li>
            <li>{SITE.email}</li>
            <li>Ежедневно 9:00–21:00</li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted">
          Учебный демо-проект: товары, цены и заказы тестовые. © {new Date().getFullYear()} {SITE.name}
        </p>
      </div>
    </footer>
  );
}

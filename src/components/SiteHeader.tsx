import Link from "next/link";
import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";
import Logo from "./Logo";

export default async function SiteHeader() {
  const [session, cart, categories] = await Promise.all([
    auth(),
    getCart(),
    prisma.category.findMany({ orderBy: { name: "asc" }, take: 8 }),
  ]);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const search = (
    <form action="/catalog" method="GET" className="flex w-full">
      <input
        name="q"
        placeholder="Поиск: название, артикул, OEM..."
        className="input rounded-r-none border-r-0 py-2.5"
      />
      <button type="submit" className="btn btn-primary rounded-l-none px-5 py-2.5" aria-label="Найти">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo />
          <span className="font-display text-lg font-bold tracking-tight">{SITE.name}</span>
        </Link>

        <div className="mx-auto hidden max-w-xl flex-1 md:block">{search}</div>

        <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className="hidden whitespace-nowrap text-sm text-muted transition hover:text-accent xl:block">
          {SITE.phone}
        </a>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href={session?.user ? "/account" : "/login"}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-surface-2"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
            <span className="hidden sm:inline">{session?.user ? "Кабинет" : "Войти"}</span>
          </Link>

          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm transition hover:text-accent"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2.4 11h10.2L20 7H6.2" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="17" cy="19" r="1.5" />
            </svg>
            <span className="hidden sm:inline">Корзина</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-on-accent">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">{search}</div>

      <nav className="border-t">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-2 text-sm text-muted">
          <Link href="/catalog" className="whitespace-nowrap font-semibold text-ink transition hover:text-accent">
            Все запчасти
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalog?category=${c.slug}`}
              className="whitespace-nowrap transition hover:text-accent"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Дашборд", exact: true },
  { href: "/admin/orders", label: "Заказы", badge: true },
  { href: "/admin/parts", label: "Запчасти" },
  { href: "/admin/directories", label: "Справочники" },
];

export default function AdminNav({ newOrders }: { newOrders: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
              active ? "bg-accent text-on-accent" : "text-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {item.label}
            {item.badge && newOrders > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-white text-accent" : "bg-accent text-on-accent"}`}>
                {newOrders}
              </span>
            )}
          </Link>
        );
      })}
      <Link href="/" className="whitespace-nowrap rounded-xl px-4 py-3 text-sm text-muted transition hover:text-accent lg:mt-4">
        ← На сайт
      </Link>
    </nav>
  );
}

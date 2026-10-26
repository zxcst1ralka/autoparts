import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addAddress, deleteAddress, setDefaultAddress } from "../actions";

export const dynamic = "force-dynamic";

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { error } = await searchParams;

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-bold">Адреса доставки</h1>

      {error && (
        <p className="rounded-xl border border-bad/50 bg-bad/10 p-3 text-sm text-bad">{error}</p>
      )}

      {addresses.length === 0 ? (
        <p className="text-muted">Адресов пока нет. Добавьте первый, и он подставится при оформлении заказа.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="flex flex-col rounded-2xl border bg-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{a.label || "Адрес"}</p>
                {a.isDefault && (
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                    Основной
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted">
                {a.city}, {a.street}
                {a.postalCode ? `, ${a.postalCode}` : ""}
              </p>
              <div className="mt-4 flex gap-4 text-sm">
                {!a.isDefault && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="underline transition hover:text-accent">Сделать основным</button>
                  </form>
                )}
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="text-bad underline">Удалить</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-3xl border bg-surface p-6 sm:p-8">
        <h2 className="mb-4 font-display text-xl font-bold">Добавить адрес</h2>
        <form action={addAddress} className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-muted">
            Название (необязательно)
            <input name="label" placeholder="Дом, Работа..." className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            Город
            <input name="city" required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted sm:col-span-2">
            Улица, дом, квартира
            <input name="street" required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted">
            Индекс (необязательно)
            <input name="postalCode" className="input" />
          </label>
          <label className="flex items-center gap-2 self-end pb-3 text-sm">
            <input type="checkbox" name="isDefault" className="accent-accent" />
            Сделать основным
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary">Добавить</button>
          </div>
        </form>
      </section>
    </div>
  );
}

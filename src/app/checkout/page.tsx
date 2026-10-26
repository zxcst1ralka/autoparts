import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCartItems } from "@/lib/cart";
import CheckoutSteps from "@/components/CheckoutSteps";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { items, total } = await getCartItems();
  if (items.length === 0) redirect("/cart");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { addresses: { where: { isDefault: true }, take: 1 } },
  });
  const addr = user?.addresses[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <CheckoutSteps current={2} />
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Оформление заказа</h1>
        <Link href="/cart" className="text-sm text-muted underline transition hover:text-accent">
          ← Назад в корзину
        </Link>
      </div>

      <CheckoutForm
        defaultName={user?.name ?? ""}
        defaultPhone={user?.phone ?? ""}
        defaultCity={addr?.city ?? ""}
        defaultStreet={addr?.street ?? ""}
        defaultPostal={addr?.postalCode ?? ""}
        subtotal={total}
        items={items.map(({ part, quantity, sum }) => ({
          id: part.id,
          name: part.name,
          quantity,
          sum,
          image: part.images[0]?.url ?? null,
          slug: part.category.slug,
        }))}
      />
    </main>
  );
}

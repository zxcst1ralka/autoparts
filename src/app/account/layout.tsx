import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import AccountNav from "@/components/AccountNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[230px_1fr]">
      <aside className="h-fit lg:sticky lg:top-28">
        <AccountNav />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
          className="mt-3"
        >
          <button
            type="submit"
            className="w-full rounded-xl px-4 py-3 text-left text-sm text-muted transition hover:bg-bad/10 hover:text-bad"
          >
            Выйти
          </button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AuthedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/sign-in");

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/sign-in" });
  }

  return (
    <div className="grid min-h-screen grid-cols-[208px_1fr]">
      {/* Sidebar */}
      <aside className="border-r border-structural/10 bg-canvas">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex items-center gap-2.5 px-5 py-4">
            <span
              aria-hidden
              className="grid h-6 w-6 place-items-center rounded-full bg-primary text-canvas font-mono text-[10px] font-semibold"
            >
              W
            </span>
            <div className="flex flex-col leading-tight">
              <p className="font-sans text-sm font-semibold text-structural">
                WSB
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-structural/55">
                ADMIN · v1.0
              </p>
            </div>
          </div>

          <AdminNav />

          <div className="border-t border-structural/10 px-5 py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-structural/55">
              SIGNED IN
            </p>
            <p className="mt-1 truncate text-xs text-structural/75">
              {session.user.email}
            </p>
            <form action={doSignOut} className="mt-2.5">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs text-structural/65 hover:text-primary"
              >
                <LogOut size={12} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="overflow-x-hidden bg-canvas">{children}</main>
    </div>
  );
}

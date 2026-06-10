import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", code: "00" },
  { href: "/admin/news", label: "News", code: "01" },
  { href: "/admin/inquiries", label: "Inquiries", code: "02" },
  { href: "/admin/files", label: "Files", code: "03" },
  { href: "/admin/settings", label: "Settings", code: "04" },
] as const;

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
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="border-r border-structural/10 bg-canvas">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-6">
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-full bg-primary text-canvas font-mono text-[10px] font-semibold"
            >
              W
            </span>
            <div className="flex flex-col">
              <p className="font-sans text-sm font-semibold text-structural">
                WSB
              </p>
              <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-structural/55">
                ADMIN · v1.0
              </p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-2">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-3 rounded-sm px-3 py-2 transition-colors hover:bg-primary/[0.06]"
                  >
                    <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-structural/55 group-hover:text-primary">
                      {item.code}
                    </span>
                    <span className="text-sm text-structural/80 group-hover:text-structural">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-structural/10 px-6 py-5">
            <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-structural/55">
              SIGNED IN
            </p>
            <p className="mt-1 truncate text-sm text-structural/75">
              {session.user.email}
            </p>
            <form action={doSignOut} className="mt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-xs text-structural/60 hover:text-primary"
              >
                <LogOut size={12} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="bg-canvas overflow-x-hidden">{children}</main>
    </div>
  );
}

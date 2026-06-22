"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", code: "00" },
  { href: "/admin/news", label: "News", code: "01" },
  { href: "/admin/inquiries", label: "Inquiries", code: "02" },
  { href: "/admin/files", label: "Files", code: "03" },
  { href: "/admin/settings", label: "Settings", code: "04" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-3">
      <ul className="space-y-0.5">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 transition-colors ${
                  active ? "bg-primary/[0.08]" : "hover:bg-primary/[0.06]"
                }`}
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.08em] ${
                    active
                      ? "text-primary"
                      : "text-structural/55 group-hover:text-primary"
                  }`}
                >
                  {item.code}
                </span>
                <span
                  className={`text-sm ${
                    active
                      ? "font-medium text-primary"
                      : "text-structural/80 group-hover:text-structural"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

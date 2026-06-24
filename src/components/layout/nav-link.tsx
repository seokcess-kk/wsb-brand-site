"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Desktop GNB link with an active state (matches the mobile nav). Uses the
 * locale-aware pathname so the current section is marked for both sighted users
 * and assistive tech (aria-current).
 */
export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative inline-flex items-center text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-structural/70",
      )}
    >
      {label}
      {/* Underline scan: grows from the left on hover, stays full when active. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-1.5 left-0 h-px bg-primary transition-all duration-300 ease-out",
          isActive ? "w-full" : "w-0 group-hover:w-full",
        )}
      />
    </Link>
  );
}

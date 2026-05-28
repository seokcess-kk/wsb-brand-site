"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { cn } from "@/lib/utils";

export type MobileNavItem = { key: string; href: string; label: string };

type Props = {
  items: MobileNavItem[];
  openLabel: string;
  closeLabel: string;
};

/**
 * Hamburger menu for sub-md viewports. Locks body scroll while open and
 * closes when a nav link is tapped (each Link handles its own setOpen call
 * so we avoid a setState-in-effect cascade on route changes).
 */
export function MobileNav({ items, openLabel, closeLabel }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduced = useSafeReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center text-structural transition-colors hover:text-primary md:hidden"
      >
        {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
            className="fixed inset-0 top-[57px] z-30 bg-structural/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
        )}
        {open && (
          <motion.nav
            key="panel"
            id="mobile-nav-panel"
            aria-label="Mobile primary"
            initial={{ opacity: 0, y: reduced ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration: reduced ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-[57px] z-40 border-b border-structural/10 bg-canvas md:hidden"
          >
            <ul className="mx-auto flex max-w-7xl flex-col px-6 py-4">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between py-4 text-base font-medium transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-structural hover:text-primary",
                      )}
                    >
                      <span>{item.label}</span>
                      <span
                        aria-hidden
                        className={cn(
                          "mono-label text-[10px]",
                          isActive ? "text-primary/70" : "text-structural/35",
                        )}
                      >
                        {String(items.indexOf(item) + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { type ReactNode } from "react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

// True once the page has scrolled past the threshold. SSR/first render is false
// so the markup matches hydration, then it flips on the first scroll.
function useScrolled(threshold = 8): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false,
  );
}

/**
 * Scroll-aware sticky header chrome. At the top of the page it stays light and
 * borderless so it sits cleanly over the hero; once scrolled it becomes a solid
 * canvas bar with a divider and a soft shadow so it reads as a deliberate,
 * elevated bar over any section (including the dark ones) rather than a floating
 * translucent band. The background is always present so the dark nav text keeps
 * its contrast on both light and dark heroes.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const scrolled = useScrolled();

  return (
    <header
      data-scrolled={scrolled}
      className={[
        "sticky top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-b border-structural/10 bg-canvas/95 backdrop-blur shadow-[0_6px_24px_-16px_rgba(15,81,50,0.35)]"
          : "border-b border-transparent bg-canvas/60 backdrop-blur-sm",
      ].join(" ")}
    >
      {children}
    </header>
  );
}

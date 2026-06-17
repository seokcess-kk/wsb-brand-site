"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Accessible term tooltip. Reveals on hover and keyboard focus; the trigger's
 * accessible name is the explanation itself (aria-label), so the visual bubble
 * is marked aria-hidden to avoid a double read for screen readers.
 */
export function Tooltip({
  content,
  children,
  className,
}: {
  content: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={content}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={cn(
          "inline-flex cursor-help items-center rounded-full text-structural/40 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          className,
        )}
      >
        {children}
      </button>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-[15rem] -translate-x-1/2 whitespace-normal border border-structural/15 bg-structural px-3 py-2 text-left text-xs leading-relaxed text-canvas shadow-sm transition-opacity duration-150",
          open ? "opacity-100" : "opacity-0",
        )}
      >
        {content}
      </span>
    </span>
  );
}

"use client";

import { motion } from "motion/react";
import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: ReactNode;
  count?: number;
};

type Props = {
  items: TabItem[];
  /** Uncontrolled initial selection. */
  defaultId?: string;
  /** Controlled selection. */
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
  /** Accessible name for the tablist. */
  ariaLabel?: string;
  /** Visual density. `pill` = rounded background; `underline` = active line. */
  variant?: "underline" | "pill";
};

/**
 * Horizontal filter tabs with an animated active indicator. The indicator
 * uses `layoutId` so it slides smoothly between active items via the shared
 * layout system. Supports both controlled and uncontrolled modes; on small
 * screens the row scrolls horizontally without a visible scrollbar.
 *
 * Note on a11y: arrow / home / end keys move selection, matching the WAI-ARIA
 * APG manual-activation tabs pattern.
 */
export function TabFilter({
  items,
  defaultId,
  value,
  onChange,
  className,
  ariaLabel = "Filter",
  variant = "underline",
}: Props) {
  const baseId = useId();
  const [internal, setInternal] = useState<string>(
    defaultId ?? items[0]?.id ?? "",
  );
  const active = value ?? internal;
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = items.findIndex((x) => x.id === active);
    if (i < 0) return;
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    select(items[next].id);
    buttonsRef.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "flex flex-nowrap items-center gap-1 overflow-x-auto",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        variant === "underline" && "border-b border-structural/10",
        className,
      )}
    >
      {items.map((item, idx) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            ref={(el) => {
              buttonsRef.current[idx] = el;
            }}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            id={`${baseId}-tab-${item.id}`}
            onClick={() => select(item.id)}
            className={cn(
              "group relative flex-none cursor-pointer whitespace-nowrap",
              "text-sm font-medium transition-colors duration-200",
              variant === "underline" && "px-4 py-3",
              variant === "pill" && "px-4 py-2 rounded-full",
              isActive
                ? "text-primary"
                : "text-structural/55 hover:text-structural",
            )}
          >
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {item.label}
              {typeof item.count === "number" && (
                <span
                  className={cn(
                    "mono-label text-[10px] transition-colors",
                    isActive ? "text-primary/70" : "text-structural/55",
                  )}
                >
                  {item.count}
                </span>
              )}
            </span>

            {isActive && variant === "underline" && (
              <motion.span
                layoutId={`${baseId}-tab-underline`}
                aria-hidden
                className="absolute inset-x-3 -bottom-px h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {isActive && variant === "pill" && (
              <motion.span
                layoutId={`${baseId}-tab-pill`}
                aria-hidden
                className="absolute inset-0 -z-0 rounded-full bg-primary/10"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

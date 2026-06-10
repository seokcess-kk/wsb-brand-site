"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { canObserveViewport, useHasMounted } from "@/hooks/use-has-mounted";

type Row = { label: string; fda: string; wsb: string };

export function FdaTable({
  rows,
  headerNo,
  headerFda,
  headerWsb,
}: {
  rows: Row[];
  headerNo: string;
  headerFda: string;
  headerWsb: string;
}) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="mt-14 hidden gap-px bg-canvas/10 md:grid">
        <div className="grid grid-cols-[3rem_1fr_1fr] bg-structural">
          <div className="px-4 py-3 mono-label text-canvas/45">{headerNo}</div>
          <div className="px-4 py-3 mono-label text-canvas/45">{headerFda}</div>
          <div className="px-4 py-3 mono-label text-primary">{headerWsb}</div>
        </div>
        {rows.map((r, i) => (
          <FdaRow key={r.label} index={i} {...r} />
        ))}
      </div>

      {/* Mobile accordion */}
      <div className="mt-10 grid gap-2 md:hidden">
        {rows.map((r, i) => (
          <FdaCard key={r.label} index={i} {...r} headerWsb={headerWsb} />
        ))}
      </div>
    </>
  );
}

function FdaRow({
  index,
  label,
  fda,
  wsb,
}: Row & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useSafeReducedMotion();
  const mounted = useHasMounted();
  const [hovered, setHovered] = useState(false);
  // Stay visible until mounted and able to observe the viewport, so the row
  // (and its copy) renders without client JS instead of being gated behind the
  // opacity:0 reveal. Only then does inView drive the scroll reveal.
  const canReveal = mounted && canObserveViewport();
  const shown = reduced || !canReveal || inView;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: 0.55,
        delay: 0.08 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative grid grid-cols-[3rem_1fr_1fr] bg-structural transition-colors hover:bg-structural/95"
    >
      <motion.span
        aria-hidden
        initial={false}
        animate={{ scaleY: hovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary origin-top"
      />

      <div className="flex items-center px-4 py-6">
        <span className="mono-label tabular-nums text-primary/80">{label}</span>
      </div>

      <div className="flex items-center px-4 py-6 text-sm md:text-base text-canvas/85">
        {fda}
      </div>

      <div className="flex items-start gap-3 px-4 py-6 text-sm md:text-base text-canvas">
        <motion.span
          aria-hidden
          initial={false}
          animate={shown ? { scale: 1 } : { scale: 0 }}
          transition={{
            duration: 0.35,
            delay: 0.08 * index + 0.2,
            ease: [0.22, 1.4, 0.36, 1],
          }}
          className="mt-[0.15em] grid h-5 w-5 flex-none place-items-center rounded-full bg-primary text-canvas"
        >
          <Check size={12} strokeWidth={3} />
        </motion.span>
        <span>{wsb}</span>
      </div>
    </motion.div>
  );
}

/**
 * Mobile-only card showing one FDA row. Collapsed by default — tap to reveal
 * the WSB response. The first row opens initially so the pattern is obvious.
 */
function FdaCard({
  index,
  label,
  fda,
  wsb,
  headerWsb,
}: Row & { index: number; headerWsb: string }) {
  const reduced = useSafeReducedMotion();
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="border border-canvas/10 bg-structural">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-start gap-3">
          <span className="mono-label tabular-nums text-primary/80">{label}</span>
          <span className="text-sm text-canvas/85">{fda}</span>
        </div>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          className="text-canvas/55"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-canvas/10 px-5 py-4">
              <p className="mono-label text-[10px] text-primary">{headerWsb}</p>
              <div className="mt-3 flex items-start gap-3 text-sm text-canvas">
                <span
                  aria-hidden
                  className="mt-[0.15em] grid h-5 w-5 flex-none place-items-center rounded-full bg-primary text-canvas"
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <span>{wsb}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";

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
    <div className="mt-14 grid gap-px bg-canvas/10">
      {/* Header row */}
      <div className="grid grid-cols-[3rem_1fr_1fr] bg-structural">
        <div className="px-4 py-3 mono-label text-canvas/45">{headerNo}</div>
        <div className="px-4 py-3 mono-label text-canvas/45">{headerFda}</div>
        <div className="px-4 py-3 mono-label text-primary">{headerWsb}</div>
      </div>
      {rows.map((r, i) => (
        <FdaRow key={r.label} index={i} {...r} />
      ))}
    </div>
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
  const [hovered, setHovered] = useState(false);
  const shown = reduced || inView;

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 16 }}
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
        <span className="mono-label text-primary/80">{label}</span>
      </div>

      <div className="flex items-center px-4 py-6 text-sm md:text-base text-canvas/85">
        {fda}
      </div>

      <div className="flex items-start gap-3 px-4 py-6 text-sm md:text-base text-canvas">
        <motion.span
          aria-hidden
          initial={reduced ? false : { scale: 0 }}
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

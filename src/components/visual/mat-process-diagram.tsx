"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { canObserveViewport, useHasMounted } from "@/hooks/use-has-mounted";

type Props = {
  plantLabel: string;
  outputLabel: string;
  controlLabel: string;
  controlValue: string;
  wsbLabel: string;
  wsbValue: string;
  /** Small basis/source line so the figures read as a measured result. */
  note?: string;
};

/**
 * MAT result comparison. The four stress inputs already live in the stressor
 * grid above, so this diagram drops the duplicate input column and focuses on
 * the outcome: control group vs WSB smart-farm cultivation, drawn as two
 * API-yield bars at their true 1× : 8× scale so the gap is read, not just
 * stated. Palette carries the meaning (gray = control, green = WSB).
 */
export function MatProcessDiagram({
  plantLabel,
  outputLabel,
  controlLabel,
  controlValue,
  wsbLabel,
  wsbValue,
  note,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduced = useSafeReducedMotion();
  const mounted = useHasMounted();
  // Render the diagram in its final state until mounted and able to observe the
  // viewport (so it shows without client JS); only then gate on inView to
  // animate on scroll. initial={false} keeps opacity:0 out of the SSR markup.
  const show = reduced || !(mounted && canObserveViewport()) || inView;

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden border border-structural/10 bg-canvas px-6 py-8 md:px-8 md:py-10"
    >
      {/* subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(26,31,27,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,31,27,0.04) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Header: what is grown (subject) + which metric is compared */}
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative grid h-10 w-10 flex-none place-items-center">
            {!reduced && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-full border border-primary/35"
                style={{ animation: "matPulse 2.4s ease-out infinite" }}
              />
            )}
            <svg viewBox="0 0 80 80" className="relative h-full w-full">
              <g transform="translate(40 64)">
                <path
                  d="M0 0 L0 -34 M0 -18 L-13 -28 M0 -18 L13 -28"
                  stroke="#0F5132"
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                  fill="none"
                  strokeLinecap="round"
                />
                <ellipse cx="0" cy="-38" rx="4.5" ry="15" fill="#0F5132" opacity="0.9" />
                <ellipse
                  cx="-15"
                  cy="-32"
                  rx="4"
                  ry="12"
                  fill="#0F5132"
                  opacity="0.78"
                  transform="rotate(-40 -15 -32)"
                />
                <ellipse
                  cx="15"
                  cy="-32"
                  rx="4"
                  ry="12"
                  fill="#0F5132"
                  opacity="0.78"
                  transform="rotate(40 15 -32)"
                />
                <circle cx="0" cy="0" r="3" fill="#0F5132" />
              </g>
            </svg>
          </span>
          <p className="mono-label text-[11px] text-structural/65">{plantLabel}</p>
        </div>
        <p className="mono-label text-[11px] text-primary whitespace-nowrap">
          {outputLabel}
        </p>
      </div>

      {/* Comparison bars. One grid so both rows share label and value columns,
          keeping the bar tracks left-aligned and the figures right-aligned. */}
      <div className="relative mt-8 grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-6 sm:mt-10 sm:gap-x-6">
        <BarRow
          label={controlLabel}
          value={controlValue}
          fraction={1 / 8}
          tone="muted"
          show={show}
          index={0}
        />
        <BarRow
          label={wsbLabel}
          value={wsbValue}
          fraction={1}
          tone="primary"
          show={show}
          index={1}
        />
      </div>

      {note && (
        <p className="relative mt-8 flex items-center gap-1.5 border-t border-structural/10 pt-4 mono-label text-[10px] text-structural/65">
          <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-primary/50" />
          {note}
        </p>
      )}

      <style>{`
        @keyframes matPulse {
          0%   { transform: scale(0.85); opacity: 0.5; }
          70%  { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/**
 * One comparison row. Returns three grid cells (label, bar track, figure) as a
 * fragment so the parent grid aligns columns across both rows.
 */
function BarRow({
  label,
  value,
  fraction,
  tone,
  show,
  index,
}: {
  label: string;
  value: string;
  fraction: number;
  tone: "muted" | "primary";
  show: boolean;
  index: number;
}) {
  const isPrimary = tone === "primary";
  return (
    <>
      <p className="mono-label text-[11px] text-structural/70">{label}</p>
      <div className="relative h-3.5 w-full overflow-hidden bg-structural/[0.06]">
        <motion.div
          initial={false}
          animate={show ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.2 + index * 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`h-full origin-left ${
            isPrimary ? "bg-primary" : "bg-structural/30"
          }`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <p
        className={`text-right font-sans font-extrabold leading-none tabular-nums ${
          isPrimary ? "text-primary" : "text-structural/45"
        }`}
        style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.5rem)" }}
      >
        {value}
      </p>
    </>
  );
}

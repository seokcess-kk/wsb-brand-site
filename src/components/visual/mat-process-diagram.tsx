"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { canObserveViewport, useHasMounted } from "@/hooks/use-has-mounted";

type Props = {
  stressLabel: string;
  plantLabel: string;
  outputLabel: string;
  outputValue: string;
  /** Small basis/source line so the +8× figure reads as a measured result. */
  note?: string;
};

const STRESSORS = [
  "UV-B  ·  285nm",
  "ΔT  ·  thermal",
  "−40%  ·  H₂O",
  "EC 1.4  ·  minerals",
];

/**
 * MAT process diagram. Horizontal flow: 4 stress inputs → plant (with pulse)
 * → big +8× output. Reads as a control panel rather than a chart.
 */
export function MatProcessDiagram({
  stressLabel,
  plantLabel,
  outputLabel,
  outputValue,
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

      <div className="relative grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {/* STRESS INPUTS */}
        <div className="space-y-3">
          <p className="mono-label text-[11px] text-structural/65">
            {stressLabel}
          </p>
          <ul className="space-y-2">
            {STRESSORS.map((l, i) => (
              <motion.li
                key={l}
                initial={false}
                animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{
                  duration: 0.45,
                  delay: 0.1 + 0.08 * i,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center gap-2"
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-primary/70"
                />
                <span className="font-mono text-[11px] tracking-wide text-structural/80">
                  {l}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Arrow 1 */}
        <FlowArrow show={show} delay={0.5} />

        {/* PLANT center */}
        <div className="flex flex-col items-center gap-3 justify-self-center">
          <motion.div
            initial={false}
            animate={
              show ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }
            }
            transition={{
              duration: 0.6,
              delay: 0.6,
              ease: [0.22, 1.3, 0.36, 1],
            }}
            className="relative grid h-24 w-24 place-items-center"
          >
            {!reduced && (
              <>
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-primary/40"
                  style={{ animation: "matPulse 2.4s ease-out infinite" }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-primary/25"
                  style={{
                    animation: "matPulse 2.4s ease-out infinite",
                    animationDelay: "1.2s",
                  }}
                />
              </>
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
                <ellipse
                  cx="0"
                  cy="-38"
                  rx="4.5"
                  ry="15"
                  fill="#0F5132"
                  opacity="0.9"
                />
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
          </motion.div>
          <p className="mono-label text-[11px] text-structural/65 whitespace-nowrap">
            {plantLabel}
          </p>
        </div>

        {/* Arrow 2 */}
        <FlowArrow show={show} delay={1.05} />

        {/* OUTPUT */}
        <motion.div
          initial={false}
          animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{
            duration: 0.55,
            delay: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="space-y-2 text-right"
        >
          <p className="mono-label text-[11px] text-primary">{outputLabel}</p>
          <p
            className="font-sans font-extrabold tracking-tight text-primary leading-none"
            style={{ fontSize: "clamp(2.25rem, 4vw, 3rem)" }}
          >
            {outputValue}
          </p>
          <p className="mono-label text-[11px] text-structural/65">
            vs. CONTROL GROUP
          </p>
        </motion.div>
      </div>

      {note && (
        <p className="relative mt-8 flex items-center gap-1.5 border-t border-structural/10 pt-4 mono-label text-[10px] text-structural/65">
          <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-primary/50" />
          {note}
        </p>
      )}

      <style>{`
        @keyframes matPulse {
          0%   { transform: scale(0.85); opacity: 0.55; }
          70%  { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function FlowArrow({
  show,
  delay,
}: {
  show: boolean;
  delay: number;
}) {
  return (
    <motion.div
      aria-hidden
      initial={false}
      animate={show ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="hidden h-px w-10 origin-left bg-primary/45 sm:block relative"
    >
      <span
        aria-hidden
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1 h-2 w-2 rotate-45 border-r border-t border-primary/60"
      />
    </motion.div>
  );
}

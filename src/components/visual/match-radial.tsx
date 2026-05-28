"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";

type Props = {
  filled: number;
  total: number;
  label: string;
};

/**
 * Radial 5/5 indicator. SVG ring fills from 0 to filled/total when the
 * element scrolls into view. Honors reduced motion (renders final state).
 */
export function MatchRadial({ filled, total, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useSafeReducedMotion();
  const show = reduced || inView;

  const size = 180;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = filled / total;

  return (
    <div ref={ref} className="relative inline-flex flex-col items-center gap-4">
      <p className="mono-label text-[11px] text-canvas/55">{label}</p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgba(250,251,249,0.15)"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Fill */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="#0F5132"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={reduced ? false : { strokeDashoffset: c }}
            animate={{ strokeDashoffset: show ? c * (1 - ratio) : c }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
          {/* Tick marks (5 evenly spaced) */}
          {Array.from({ length: total }).map((_, i) => {
            const angle = (i / total) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const x1 = size / 2 + Math.cos(rad) * (r - stroke / 2 - 2);
            const y1 = size / 2 + Math.sin(rad) * (r - stroke / 2 - 2);
            const x2 = size / 2 + Math.cos(rad) * (r + stroke / 2 + 2);
            const y2 = size / 2 + Math.sin(rad) * (r + stroke / 2 + 2);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(250,251,249,0.25)"
                strokeWidth="0.75"
                transform={`rotate(90 ${size / 2} ${size / 2})`}
              />
            );
          })}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-sans font-extrabold tracking-tight text-primary leading-none"
            style={{ fontSize: "3rem" }}
          >
            {filled}
            <span className="text-canvas/35">/{total}</span>
          </span>
          <span className="mono-label mt-2 text-[11px] text-canvas/50">
            REQUIREMENTS
          </span>
        </div>
      </div>
    </div>
  );
}

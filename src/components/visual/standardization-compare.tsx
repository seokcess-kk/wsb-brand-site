"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";

/**
 * Standardization comparison for the left (WSB technology) card. Two sample
 * groups share one pharma-spec band: conventional cultivation (left, muted)
 * scatters far outside the band, while WSB's controlled production (right,
 * brand green) clusters inside it. Reads as "same target, only WSB lands it"
 * at a glance. The palette carries the meaning (gray = conventional spread,
 * green = WSB standard) instead of an off-brand warning color.
 *
 * Coordinate note: viewBox y grows downward. The spec band sits at y 22..28;
 * conventional points are placed outside it (y < 22 or y > 28), WSB points
 * inside it (22..28). Positions are deterministic so SSR and client agree.
 */

// x 9..39, spread across the chart, every point outside the 22..28 band.
const CONVENTIONAL = [
  { x: 9, y: 11 },
  { x: 9, y: 40 },
  { x: 15, y: 34 },
  { x: 15, y: 8 },
  { x: 21, y: 15 },
  { x: 21, y: 31 },
  { x: 27, y: 42 },
  { x: 27, y: 36 },
  { x: 33, y: 9 },
  { x: 33, y: 19 },
  { x: 39, y: 37 },
  { x: 39, y: 13 },
];

// x 59..89, tightly clustered inside the 22..28 band.
const WSB = [
  { x: 59, y: 24 },
  { x: 59, y: 26 },
  { x: 65, y: 25 },
  { x: 65, y: 27 },
  { x: 71, y: 24 },
  { x: 71, y: 25 },
  { x: 77, y: 26 },
  { x: 77, y: 23 },
  { x: 83, y: 23 },
  { x: 83, y: 26 },
  { x: 89, y: 25 },
  { x: 89, y: 24 },
];

export function StandardizationCompare({
  axisLabel = "API CONTENT",
  specLabel = "PHARMA SPEC",
  conventionalLabel = "CONVENTIONAL",
  wsbLabel = "WSB",
}: {
  axisLabel?: string;
  specLabel?: string;
  conventionalLabel?: string;
  wsbLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useSafeReducedMotion();
  const show = reduced || inView;

  return (
    <div
      ref={ref}
      className="relative aspect-[2/1] w-full overflow-hidden bg-structural/[0.02]"
    >
      <svg
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="성분 분포 비교 산점도. 관행 재배는 의약품 기준 구간 밖으로 넓게 산포하고 WSB는 기준 구간 안에 밀집한다."
      >
        {/* Pharma-spec band (target zone), shared by both groups */}
        <rect x="0" y="22" width="100" height="6" fill="#0F5132" fillOpacity="0.10" />
        <line
          x1="0"
          y1="22"
          x2="100"
          y2="22"
          stroke="#0F5132"
          strokeOpacity="0.30"
          strokeDasharray="1.5 2"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="0"
          y1="28"
          x2="100"
          y2="28"
          stroke="#0F5132"
          strokeOpacity="0.30"
          strokeDasharray="1.5 2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Center divider between the two groups */}
        <line
          x1="50"
          y1="4"
          x2="50"
          y2="42"
          stroke="#1A1F1B"
          strokeOpacity="0.12"
          strokeDasharray="1 2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Conventional cultivation: muted, scattered outside the band */}
        {CONVENTIONAL.map((p, i) => (
          <motion.circle
            key={`c-${i}`}
            cx={p.x}
            cy={p.y}
            r={1.4}
            fill="#1A1F1B"
            fillOpacity={0.4}
            initial={reduced ? false : { opacity: 0, scale: 0 }}
            animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{
              duration: 0.4,
              delay: i * 0.04,
              ease: [0.22, 1.4, 0.36, 1],
            }}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* WSB: brand green, clustered inside the band. Animates in after the
            conventional spread so the "chaos then order" beat reads. */}
        {WSB.map((p, i) => (
          <motion.circle
            key={`w-${i}`}
            cx={p.x}
            cy={p.y}
            r={1.7}
            fill="#0F5132"
            fillOpacity={0.95}
            initial={reduced ? false : { opacity: 0, scale: 0 }}
            animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.5 + i * 0.04,
              ease: [0.22, 1.4, 0.36, 1],
            }}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Axis label (top-left) and spec-band chip (rides the band) */}
      <div className="absolute left-2 top-2 mono-label text-[11px] text-structural/65">
        {axisLabel}
      </div>
      <div className="absolute left-2 top-[38%] bg-canvas/90 px-1.5 py-0.5 mono-label text-[10px] leading-none text-primary">
        {specLabel}
      </div>

      {/* Group labels along the bottom, one per half */}
      <div className="absolute bottom-1.5 left-[24%] -translate-x-1/2 mono-label text-[10px] text-structural/45">
        {conventionalLabel}
      </div>
      <div className="absolute bottom-1.5 left-[74%] -translate-x-1/2 mono-label text-[10px] text-primary">
        {wsbLabel}
      </div>
    </div>
  );
}

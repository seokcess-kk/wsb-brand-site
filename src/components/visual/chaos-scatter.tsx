"use client";

import { motion, useInView } from "motion/react";
import { useMemo, useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";

/**
 * "Same plant, different batches" visualization for the PROBLEM card.
 * Shows that conventional cultivation produces wildly different active-compound
 * content across batches. X axis = batch number (1..5), each batch has 4 sample
 * measurements clustered around a wandering mean. The center line marks the
 * pharmaceutical-grade tolerance band, which the points constantly miss.
 */
export function ChaosScatter({
  yLabel = "API CONTENT",
  xLabel = "BATCH 1 ~ 5",
  toleranceLabel = "PHARMA SPEC",
}: {
  yLabel?: string;
  xLabel?: string;
  toleranceLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useSafeReducedMotion();
  const show = reduced || inView;

  // Deterministic per-batch sample positions
  const batches = useMemo(
    () => [
      { x: 12, samples: [18, 28, 41, 22] },
      { x: 30, samples: [62, 70, 55, 78] },
      { x: 50, samples: [10, 25, 18, 32] },
      { x: 70, samples: [80, 65, 88, 74] },
      { x: 88, samples: [38, 50, 28, 44] },
    ],
    [],
  );

  // Map "0..100" sample to chart y
  const yOf = (v: number) => 6 + (1 - v / 100) * 38; // 6..44

  return (
    <div ref={ref} className="relative aspect-[2/1] w-full overflow-hidden bg-structural/[0.02]">
      <svg
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* Tolerance band (pharma spec) */}
        <rect
          x="0"
          y="22"
          width="100"
          height="6"
          fill="#0F5132"
          fillOpacity="0.06"
        />
        <line
          x1="0"
          y1="25"
          x2="100"
          y2="25"
          stroke="#0F5132"
          strokeOpacity="0.45"
          strokeDasharray="1.5 2"
          vectorEffect="non-scaling-stroke"
        />

        {/* Per-batch sample points */}
        {batches.map((b, bi) =>
          b.samples.map((s, si) => (
            <motion.circle
              key={`${bi}-${si}`}
              cx={b.x + (si - 1.5) * 1.6}
              cy={yOf(s)}
              r="1.4"
              fill="#1A1F1B"
              fillOpacity="0.55"
              initial={reduced ? false : { opacity: 0, scale: 0 }}
              animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{
                duration: 0.4,
                delay: bi * 0.12 + si * 0.04,
                ease: [0.22, 1.4, 0.36, 1],
              }}
              vectorEffect="non-scaling-stroke"
            />
          )),
        )}

        {/* Batch tick labels */}
        {batches.map((b, bi) => (
          <text
            key={bi}
            x={b.x}
            y="48"
            fontSize="2.2"
            fill="#1A1F1B"
            fillOpacity="0.4"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            style={{ letterSpacing: "0.06em" }}
          >
            {`B${bi + 1}`}
          </text>
        ))}
      </svg>

      {/* Axis labels (overlay) */}
      <div className="absolute left-2 top-2 mono-label text-[11px] text-structural/55">
        {yLabel}
      </div>
      <div className="absolute right-2 top-[42%] mono-label text-[11px] text-primary/80">
        {toleranceLabel}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 mono-label text-[11px] text-structural/45 whitespace-nowrap">
        {xLabel}
      </div>
    </div>
  );
}

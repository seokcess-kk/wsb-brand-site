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
  toleranceLabel = "PHARMA SPEC",
}: {
  yLabel?: string;
  toleranceLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useSafeReducedMotion();
  const show = reduced || inView;

  // Deterministic per-batch sample positions. Every sample sits OUTSIDE the
  // pharma-spec band (42..58) on purpose, so no point renders on-spec and the
  // scatter agrees with the "0/5 reliable match" footer. The on-spec green
  // coloring below stays in code for when real data eventually lands a hit.
  const batches = useMemo(
    () => [
      { x: 12, samples: [18, 28, 41, 22] },
      { x: 30, samples: [62, 70, 38, 78] },
      { x: 50, samples: [10, 25, 18, 32] },
      { x: 70, samples: [80, 65, 88, 74] },
      { x: 88, samples: [38, 62, 28, 40] },
    ],
    [],
  );

  // Map "0..100" sample to chart y
  const yOf = (v: number) => 6 + (1 - v / 100) * 38; // 6..44
  // Pharma-spec band spans values ~42..58 (chart y 22..28). A sample inside it
  // is on-spec; everything else misses. Coloring the few hits in brand green
  // against muted misses makes "0/5 reliable match" read at a glance, using the
  // palette as meaning (green = our standard / gray = conventional chaos)
  // rather than introducing an off-brand warning color.
  const SPEC_MIN = 42;
  const SPEC_MAX = 58;

  return (
    <div ref={ref} className="relative aspect-[2/1] w-full overflow-hidden bg-structural/[0.02]">
      <svg
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="배치별 유효성분 함량 산점도. 5개 배치 모두 의약품 기준 구간을 벗어나 적중 0/5."
      >
        {/* Tolerance band (pharma spec) — the target zone */}
        <rect
          x="0"
          y="22"
          width="100"
          height="6"
          fill="#0F5132"
          fillOpacity="0.10"
        />
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

        {/* Per-batch sample points. On-spec hits (inside the band) read in brand
            green; misses stay muted so the scatter away from target dominates. */}
        {batches.map((b, bi) =>
          b.samples.map((s, si) => {
            const onSpec = s >= SPEC_MIN && s <= SPEC_MAX;
            return (
              <motion.circle
                key={`${bi}-${si}`}
                cx={b.x + (si - 1.5) * 1.6}
                cy={yOf(s)}
                r={onSpec ? 1.7 : 1.4}
                fill={onSpec ? "#0F5132" : "#1A1F1B"}
                fillOpacity={onSpec ? 0.95 : 0.4}
                initial={reduced ? false : { opacity: 0, scale: 0 }}
                animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{
                  duration: 0.4,
                  delay: bi * 0.12 + si * 0.04,
                  ease: [0.22, 1.4, 0.36, 1],
                }}
                vectorEffect="non-scaling-stroke"
              />
            );
          }),
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

      {/* Axis labels (overlay). The y-axis label sits top-left clear of the
          scatter; the spec-band label rides the band on a canvas chip so it
          stays legible even where sample points fall behind it. The x-axis is
          read directly from the B1~B5 ticks, so no separate batch label. */}
      <div className="absolute left-2 top-2 mono-label text-[11px] text-structural/65">
        {yLabel}
      </div>
      <div className="absolute left-2 top-[38%] bg-canvas/90 px-1.5 py-0.5 mono-label text-[10px] leading-none text-primary">
        {toleranceLabel}
      </div>
    </div>
  );
}

"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { canObserveViewport, useHasMounted } from "@/hooks/use-has-mounted";

type Props = {
  startYear: string;
  endYear: string;
  startValue: string;
  endValue: string;
  cagrLabel: string;
};

/**
 * Market growth curve for the OPPORTUNITY card.
 * Start and end values are pinned to their data points so the chart reads
 * without external legend. Includes axis ticks for years.
 */
export function GrowthCurve({
  startYear,
  endYear,
  startValue,
  endValue,
  cagrLabel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useSafeReducedMotion();
  const mounted = useHasMounted();
  // Render the chart fully drawn until mounted and able to observe the viewport
  // (so it shows without client JS); only then gate on inView to animate the
  // draw on scroll. initial={false} keeps opacity:0 out of the SSR markup.
  const show = reduced || !(mounted && canObserveViewport()) || inView;

  // 10 points (CAGR ~6.7%)
  const values = Array.from({ length: 10 }, (_, i) =>
    Math.round(60 * Math.pow(1.067, i)),
  );
  const min = Math.min(...values);
  const max = Math.max(...values);
  const W = 100;
  const H = 50;
  const padTop = 8;
  const padBottom = 8;
  const px = (i: number) => (i / (values.length - 1)) * W;
  const py = (v: number) =>
    H - padBottom - ((v - min) / (max - min)) * (H - padTop - padBottom);
  const linePath = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${px(i)} ${py(v)}`)
    .join(" ");
  const areaPath = `${linePath} L${W} ${H} L0 ${H} Z`;

  const startPt = { x: 0, y: py(values[0]) };
  const endPt = { x: W, y: py(values[values.length - 1]) };

  return (
    <div ref={ref} className="relative aspect-[2/1] w-full overflow-hidden bg-structural/[0.02]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="growthArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F5132" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0F5132" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1="0"
            y1={padTop + (H - padTop - padBottom) * p}
            x2={W}
            y2={padTop + (H - padTop - padBottom) * p}
            stroke="#1A1F1B"
            strokeOpacity="0.05"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <motion.path
          d={areaPath}
          fill="url(#growthArea)"
          initial={false}
          animate={show ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke="#0F5132"
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={show ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Endpoint markers */}
        <motion.circle
          cx={startPt.x + 0.6}
          cy={startPt.y}
          r="1.3"
          fill="#0F5132"
          fillOpacity="0.55"
          initial={false}
          animate={show ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          vectorEffect="non-scaling-stroke"
        />
        <motion.circle
          cx={endPt.x - 0.6}
          cy={endPt.y}
          r="1.8"
          fill="#0F5132"
          initial={false}
          animate={show ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: 1.4, ease: [0.22, 1.4, 0.36, 1] }}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Pinned start label (top-left, near start point) */}
      <motion.div
        initial={false}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="absolute left-2 top-2 text-left"
      >
        <p className="mono-label text-[11px] text-structural/55">{startYear}</p>
        <p className="font-mono text-[11px] font-semibold text-structural/70">
          {startValue}
        </p>
      </motion.div>

      {/* Pinned end label (top-right, near end point) */}
      <motion.div
        initial={false}
        animate={show ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 1.5 }}
        className="absolute right-2 top-2 text-right"
      >
        <p className="mono-label text-[11px] text-primary">{endYear}</p>
        <p className="font-mono text-[13px] font-bold text-primary">
          {endValue}
        </p>
      </motion.div>

      {/* CAGR label (bottom center) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 mono-label text-[11px] text-structural/55 whitespace-nowrap">
        {cagrLabel}
      </div>
    </div>
  );
}

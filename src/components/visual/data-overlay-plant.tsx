"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useHasMounted } from "@/hooks/use-has-mounted";

type Labels = {
  overlay1: string;
  overlay2: string;
  overlay3: string;
  batchPrefix: string;
};

const BATCH_IDS = ["001", "002", "003", "004", "005"] as const;

/**
 * Hero right-hand visual. Brand-guide Data Overlay metaphor.
 * Plant silhouette with crosshair coordinate plane, sequentially revealed
 * data points, ambient label pulses, and a rolling batch ID. Subtle mouse
 * parallax adds depth without distracting.
 */
export function DataOverlayPlant({ labels }: { labels: Labels }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax (subtle, max 8px shift)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const plantTx = useTransform(sx, [-1, 1], [-6, 6]);
  const plantTy = useTransform(sy, [-1, 1], [-6, 6]);
  const overlayTx = useTransform(sx, [-1, 1], [4, -4]);
  const overlayTy = useTransform(sy, [-1, 1], [4, -4]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handle = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mx.set(Math.max(-1, Math.min(1, nx)));
      my.set(Math.max(-1, Math.min(1, ny)));
    };
    const leave = () => {
      mx.set(0);
      my.set(0);
    };
    el.addEventListener("pointermove", handle);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", handle);
      el.removeEventListener("pointerleave", leave);
    };
  }, [mx, my]);

  // Rolling batch ID
  const [batchIdx, setBatchIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setBatchIdx((i) => (i + 1) % BATCH_IDS.length),
      3600,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full max-w-[520px] mx-auto"
    >
      <div className="absolute inset-0 rounded-sm border border-structural/15 bg-canvas overflow-hidden">
        {/* Grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(26,31,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,31,27,0.05) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Plant (with parallax) */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ x: plantTx, y: plantTy }}
        >
          <PlantSvg />
        </motion.div>

        {/* Crosshair + data points (with inverse parallax for depth) */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ x: overlayTx, y: overlayTy }}
        >
          <OverlaySvg />
        </motion.div>

        {/* Floating labels */}
        <PulseLabel
          className="absolute top-[15%] left-[7%] text-primary"
          delay={0.4}
        >
          {labels.overlay1}
        </PulseLabel>
        <PulseLabel
          className="absolute top-[27%] right-[6%] text-primary"
          delay={0.7}
        >
          {labels.overlay2}
        </PulseLabel>
        <PulseLabel
          className="absolute top-[10%] left-1/2 -translate-x-1/2 text-structural/70"
          delay={1.0}
        >
          {labels.overlay3}
        </PulseLabel>

        {/* Batch ID (rolling) */}
        <div className="absolute bottom-3 right-3 mono-label text-[10px] tracking-widest text-structural/65 flex items-baseline gap-1.5">
          <span>{labels.batchPrefix}</span>
          <RollingDigits idx={batchIdx} />
        </div>

        {/* Corner brackets */}
        {(
          ["tl", "tr", "bl", "br"] as const
        ).map((c) => (
          <CornerBracket key={c} corner={c} />
        ))}

        <div className="absolute bottom-3 left-3 mono-label text-[11px] text-structural/35">
          OBSERVED · CONTROLLED PLANT
        </div>
      </div>
    </div>
  );
}

function PulseLabel({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
}) {
  // Render the label visible until mounted, then start the ambient pulse. This
  // keeps the readout legible without client JS instead of leaving it stuck at
  // opacity 0. initial={false} keeps opacity:0 out of the SSR markup.
  const mounted = useHasMounted();
  return (
    <motion.div
      initial={false}
      animate={mounted ? { opacity: [0, 1, 0.7, 1] } : { opacity: 1 }}
      transition={
        mounted
          ? {
              opacity: {
                delay,
                duration: 3.2,
                times: [0, 0.18, 0.6, 1],
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 1.2,
                ease: "easeInOut",
              },
            }
          : { duration: 0 }
      }
      className={`mono-label text-[11px] tracking-widest pointer-events-none ${className}`}
    >
      {children}
    </motion.div>
  );
}

function RollingDigits({ idx }: { idx: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[2.4em] overflow-hidden align-baseline">
      {BATCH_IDS.map((id, i) => (
        <motion.span
          key={id}
          aria-hidden={i !== idx}
          initial={false}
          animate={{
            y: i === idx ? 0 : i < idx ? "-100%" : "100%",
            opacity: i === idx ? 1 : 0,
          }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 block"
        >
          {id}
        </motion.span>
      ))}
    </span>
  );
}

function CornerBracket({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: "top-2 left-2 border-l border-t",
    tr: "top-2 right-2 border-r border-t",
    bl: "bottom-2 left-2 border-l border-b",
    br: "bottom-2 right-2 border-r border-b",
  } as const;
  return (
    <div
      aria-hidden
      className={`absolute h-4 w-4 border-primary ${map[corner]}`}
    />
  );
}

function PlantSvg() {
  return (
    <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F5132" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0F5132" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <g transform="translate(260 320)">
        <path
          d="M0 0 L0 -160 M0 -80 L-90 -150 M0 -80 L90 -150 M0 -40 L-130 -110 M0 -40 L130 -110"
          stroke="#0F5132"
          strokeWidth="1.5"
          strokeOpacity="0.65"
          fill="none"
          strokeLinecap="round"
        />
        {[
          { x: 0, y: -200, r: -10, sway: 1.2 },
          { x: -120, y: -180, r: -45, sway: -1.5 },
          { x: 120, y: -180, r: 45, sway: 1.5 },
          { x: -170, y: -140, r: -70, sway: -1.0 },
          { x: 170, y: -140, r: 70, sway: 1.0 },
        ].map((leaf, i) => (
          <motion.g
            key={i}
            transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r})`}
            animate={{ rotate: [leaf.r, leaf.r + leaf.sway, leaf.r] }}
            transition={{
              duration: 6 + i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <ellipse cx="0" cy="0" rx="14" ry="55" fill="url(#leafGrad)" />
            <path
              d="M0 -50 L0 50"
              stroke="#FAFBF9"
              strokeOpacity="0.4"
              strokeWidth="1"
            />
          </motion.g>
        ))}
        <circle cx="0" cy="0" r="6" fill="#0F5132" opacity="0.7" />
      </g>
    </svg>
  );
}

function OverlaySvg() {
  return (
    <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full">
      {/* Crosshair lines fade in first */}
      <motion.line
        x1="0"
        y1="260"
        x2="520"
        y2="260"
        stroke="#1A1F1B"
        strokeOpacity="0.25"
        strokeDasharray="2 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.25 }}
        transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.line
        x1="260"
        y1="0"
        x2="260"
        y2="520"
        stroke="#1A1F1B"
        strokeOpacity="0.25"
        strokeDasharray="2 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.25 }}
        transition={{ duration: 1.0, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Sequential data points */}
      {[
        { cx: 140, cy: 180, delay: 0.6 },
        { cx: 380, cy: 180, delay: 0.85 },
        { cx: 260, cy: 100, delay: 1.1 },
      ].map((pt, i) => (
        <g key={i}>
          <motion.circle
            cx={pt.cx}
            cy={pt.cy}
            r="4"
            fill="none"
            stroke="#0F5132"
            strokeWidth="1.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: pt.delay,
              ease: [0.22, 1.5, 0.36, 1],
            }}
            style={{ transformOrigin: `${pt.cx}px ${pt.cy}px` }}
          />
          <motion.circle
            cx={pt.cx}
            cy={pt.cy}
            r="1.5"
            fill="#0F5132"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1] }}
            transition={{
              opacity: {
                delay: pt.delay + 0.3,
                duration: 2.4,
                times: [0, 0.2, 0.6, 1],
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        </g>
      ))}
    </svg>
  );
}

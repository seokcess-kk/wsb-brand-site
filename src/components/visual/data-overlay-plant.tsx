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

// Dark halo behind the bright HUD text so it stays legible wherever the photo
// underneath turns light. A faint outer blur reads as a screen-like glow.
const HUD_TEXT_SHADOW =
  "0 1px 10px rgba(10,18,12,0.6), 0 0 2px rgba(10,18,12,0.55)";

/**
 * Hero right-hand visual. Brand-guide Data Overlay metaphor.
 *
 * Per the 2026-06 client feedback this reads as a transparent instrument HUD
 * laid directly over the facility photo (no white card, no plant illustration):
 * just a crosshair coordinate plane, sequentially revealed data points, the
 * ambient measurement labels (SAPONIN, PH ...) and a rolling batch ID, all in
 * the bright canvas tone with a faint glow so they float like a hologram over
 * the real smart-farm behind them. Subtle mouse parallax adds depth.
 */
export function DataOverlayPlant({ labels }: { labels: Labels }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax (subtle) drifts the whole HUD over the photo for depth.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const overlayTx = useTransform(sx, [-1, 1], [6, -6]);
  const overlayTy = useTransform(sy, [-1, 1], [6, -6]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Desktop only: the mobile strip renders instead, so skip parallax wiring.
    if (window.matchMedia("(max-width: 1023px)").matches) return;
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
    if (window.matchMedia("(max-width: 1023px)").matches) return;
    const id = setInterval(
      () => setBatchIdx((i) => (i + 1) % BATCH_IDS.length),
      3600,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="relative hidden aspect-square w-full max-w-[520px] mx-auto lg:block"
      >
      {/* Transparent HUD frame: the white card fill is gone so the facility
          photo shows through; only a hairline bright border keeps the readout
          framed like an instrument screen. */}
      <div className="absolute inset-0 rounded-sm border border-canvas/20 overflow-hidden">
        {/* Faint bright measurement grid (reads over the dark photo) */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--overlay-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--overlay-grid) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Crosshair + data points (parallax drift for depth) */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ x: overlayTx, y: overlayTy }}
        >
          <OverlaySvg />
        </motion.div>

        {/* Floating labels. One key mark in Bioactive Lime (data accent),
            the rest in the bright canvas tone so they float over the photo. */}
        <PulseLabel
          className="absolute top-[15%] left-[7%] text-[color:var(--color-data)]"
          delay={0.4}
        >
          {labels.overlay1}
        </PulseLabel>
        <PulseLabel
          className="absolute top-[27%] right-[6%] text-canvas"
          delay={0.7}
        >
          {labels.overlay2}
        </PulseLabel>
        <PulseLabel
          className="absolute top-[10%] left-1/2 -translate-x-1/2 text-canvas/75"
          delay={1.0}
        >
          {labels.overlay3}
        </PulseLabel>

        {/* Batch ID (rolling) */}
        <div
          className="absolute bottom-3 right-3 mono-label text-[10px] tracking-widest text-canvas/70 flex items-baseline gap-1.5"
          style={{ textShadow: HUD_TEXT_SHADOW }}
        >
          <span>{labels.batchPrefix}</span>
          <RollingDigits idx={batchIdx} />
        </div>

        {/* Corner brackets */}
        {(
          ["tl", "tr", "bl", "br"] as const
        ).map((c) => (
          <CornerBracket key={c} corner={c} />
        ))}

        <div
          className="absolute bottom-3 left-3 mono-label text-[11px] text-canvas/45"
          style={{ textShadow: HUD_TEXT_SHADOW }}
        >
          OBSERVED · CONTROLLED PLANT
        </div>
        </div>
      </div>
      <DataStripMobile labels={labels} />
    </>
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
      style={{ textShadow: HUD_TEXT_SHADOW }}
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
      className={`absolute h-4 w-4 border-canvas/55 ${map[corner]}`}
      style={{ filter: "drop-shadow(0 0 4px rgba(10,18,12,0.5))" }}
    />
  );
}

function OverlaySvg() {
  return (
    <svg
      viewBox="0 0 520 520"
      className="absolute inset-0 h-full w-full"
      style={{ filter: "drop-shadow(0 0 6px rgba(10,18,12,0.55))" }}
    >
      {/* Crosshair lines fade in first (bright, so they read over the photo) */}
      <motion.line
        x1="0"
        y1="260"
        x2="520"
        y2="260"
        stroke="var(--color-canvas)"
        strokeOpacity="0.45"
        strokeDasharray="2 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.45 }}
        transition={{ duration: 1.0, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.line
        x1="260"
        y1="0"
        x2="260"
        y2="520"
        stroke="var(--color-canvas)"
        strokeOpacity="0.45"
        strokeDasharray="2 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.45 }}
        transition={{ duration: 1.0, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Sequential data points. Bioactive Lime marks (the key data accent). */}
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
            stroke="var(--color-data)"
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
            fill="var(--color-data)"
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

/**
 * Mobile counterpart to the square HUD. A compact, static data strip (no
 * parallax, no rolling interval) that keeps only the key readouts over the
 * facility photo, so 390px never has to shrink the full desktop instrument.
 */
function DataStripMobile({ labels }: { labels: Labels }) {
  const corners = {
    tl: "top-1.5 left-1.5 border-l border-t",
    tr: "top-1.5 right-1.5 border-r border-t",
    bl: "bottom-1.5 left-1.5 border-l border-b",
    br: "bottom-1.5 right-1.5 border-r border-b",
  } as const;
  return (
    <div className="relative overflow-hidden rounded-sm border border-canvas/20 p-4 lg:hidden">
      {/* Faint measurement grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--overlay-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--overlay-grid) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div
        className="relative flex items-center justify-between mono-label text-[10px] text-canvas/55"
        style={{ textShadow: HUD_TEXT_SHADOW }}
      >
        <span>OBSERVED</span>
        <span className="tabular-nums">{labels.batchPrefix}001</span>
      </div>
      <div
        className="relative mt-3 grid grid-cols-3 gap-2"
        style={{ textShadow: HUD_TEXT_SHADOW }}
      >
        <DataCell label={labels.overlay1} tone="data" />
        <DataCell label={labels.overlay2} tone="canvas" />
        <DataCell label={labels.overlay3} tone="muted" />
      </div>
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <span
          key={c}
          aria-hidden
          className={`pointer-events-none absolute h-2.5 w-2.5 border-canvas/45 ${corners[c]}`}
        />
      ))}
    </div>
  );
}

function DataCell({
  label,
  tone,
}: {
  label: string;
  tone: "data" | "canvas" | "muted";
}) {
  const text =
    tone === "data"
      ? "text-[color:var(--color-data)]"
      : tone === "canvas"
        ? "text-canvas"
        : "text-canvas/70";
  const dot = tone === "data" ? "bg-[color:var(--color-data)]" : "bg-canvas/70";
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span aria-hidden className={`h-1 w-1 flex-none rounded-full ${dot}`} />
      <span className={`mono-label truncate text-[10px] ${text}`}>{label}</span>
    </div>
  );
}

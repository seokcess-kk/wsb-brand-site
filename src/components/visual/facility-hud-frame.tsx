"use client";

import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { canObserveViewport, useHasMounted } from "@/hooks/use-has-mounted";

export type HudFocus = { x: number; y: number; metric: string };

export type FacilityHudFrameProps = {
  /** Real facility photo. Undefined renders the blueprint placeholder. */
  src?: string;
  /** Image alt + placeholder line. */
  alt: string;
  /** Top-left mono tag. */
  tag: string;
  /** Top-right mono readout (lime). */
  readout: string;
  /** Bottom-right data id (decorative). */
  dataId?: string;
  /** Bottom-left caption. */
  caption?: string;
  /** CSS aspect-ratio, e.g. "16 / 9", "21 / 9". Fixed so swaps never shift layout. */
  aspectRatio?: string;
  /** object-position to art-direct the crop. */
  focal?: string;
  /** Crosshair focus point + lime measurement readout, in % of the frame. */
  focus: HudFocus;
  sizes?: string;
  className?: string;
  /** Fill the parent's height instead of using aspectRatio (for split cells). */
  fill?: boolean;
};

/**
 * Reusable "precisely observed" facility frame: a real photo under a deep-green
 * grade with a thin HUD overlay (crosshair, single lime measurement mark, mono
 * tag / readout / caption, corner brackets). Renders a blueprint placeholder
 * until a real `src` arrives so layout never shifts. SSR-safe and reduced-motion
 * safe: the photo always renders without client JS; only the pulse is gated on
 * mount + inView. Shared by the business pillars, the MAT anchor, and the FDA
 * banner so the instrument language stays identical across the site.
 */
export function FacilityHudFrame({
  src,
  alt,
  tag,
  readout,
  dataId,
  caption,
  aspectRatio = "16 / 9",
  focal = "center",
  focus,
  sizes = "100vw",
  className,
  fill = false,
}: FacilityHudFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useSafeReducedMotion();
  const mounted = useHasMounted();
  const show = reduced || !(mounted && canObserveViewport()) || inView;
  const tick = src ? "border-canvas/35" : "border-structural/20";

  return (
    <div
      ref={ref}
      className={`group/vis relative w-full overflow-hidden bg-structural/[0.04] ${fill ? "h-full" : ""} ${className ?? ""}`}
      style={fill ? undefined : { aspectRatio }}
    >
      {src ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            style={{ objectPosition: focal }}
            className="object-cover photo-grade-green transition-transform duration-700 group-hover/vis:scale-[1.04]"
          />
          {/* Deep-green tone unify (mixed-source photos pull toward primary) */}
          <div aria-hidden className="absolute inset-0 bg-primary/25 mix-blend-multiply" />
          {/* Readability + instrument darkening */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-structural/80 via-structural/15 to-structural/35"
          />
          <Hud focus={focus} show={show} reduced={reduced} />
        </>
      ) : (
        <>
          <div aria-hidden className="absolute inset-0 bg-grid opacity-70" />
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="mono-label text-[11px] text-structural/55">{alt}</p>
          </div>
        </>
      )}

      {/* Readout labels */}
      <span
        className={`absolute left-4 top-3 mono-label text-[10px] ${src ? "text-canvas/80" : "text-structural/55"}`}
        style={src ? { textShadow: "0 1px 6px rgba(10,18,12,0.55)" } : undefined}
      >
        {tag}
      </span>
      <span className="absolute right-4 top-3 mono-label text-[10px] text-[color:var(--color-data)]">
        {readout}
      </span>

      {/* Caption + data id */}
      {src && (caption || dataId) && (
        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between gap-3">
          {caption ? (
            <p
              className="mono-label text-[10px] text-canvas/85"
              style={{ textShadow: "0 1px 6px rgba(10,18,12,0.55)" }}
            >
              {caption}
            </p>
          ) : (
            <span />
          )}
          {dataId && <p className="mono-label text-[10px] text-canvas/55">{dataId}</p>}
        </div>
      )}

      {/* Corner brackets */}
      {[
        "left-2 top-2 border-l border-t",
        "right-2 top-2 border-r border-t",
        "bottom-2 left-2 border-l border-b",
        "bottom-2 right-2 border-r border-b",
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`absolute h-3 w-3 ${tick} transition-colors duration-500 group-hover/vis:border-primary/60 ${pos}`}
        />
      ))}
    </div>
  );
}

/** Thin crosshair through the focus point with a single lime measurement mark. */
function Hud({
  focus,
  show,
  reduced,
}: {
  focus: HudFocus;
  show: boolean;
  reduced: boolean | null;
}) {
  return (
    <div aria-hidden className="absolute inset-0">
      <span
        className="absolute top-0 bottom-0 w-px bg-canvas/20"
        style={{ left: `${focus.x}%` }}
      />
      <span
        className="absolute left-0 right-0 h-px bg-canvas/20"
        style={{ top: `${focus.y}%` }}
      />
      <div
        className="absolute"
        style={{
          left: `${focus.x}%`,
          top: `${focus.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {!reduced && (
          <motion.span
            className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--color-data)]"
            initial={false}
            animate={show ? { scale: [0.7, 1.7], opacity: [0.7, 0] } : { opacity: 0 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <span className="block h-2 w-2 rounded-full bg-[color:var(--color-data)] shadow-[0_0_10px_2px] shadow-[color:var(--color-data)]/50" />
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2 whitespace-nowrap mono-label text-[9px] text-[color:var(--color-data)]"
          style={{ textShadow: "0 1px 6px rgba(10,18,12,0.7)" }}
        >
          {focus.metric}
        </span>
      </div>
    </div>
  );
}

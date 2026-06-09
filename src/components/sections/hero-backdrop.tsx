"use client";

import Image from "next/image";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Animated hero background (item 1 of the 2026-06 client feedback: an
 * "overwhelming, technical" first impression that feels alive on entry).
 *
 * One orchestrated moment over the facility photo:
 *  A. Cinematic depth — a slow Ken Burns zoom plus a mouse parallax, so the
 *     corridor reads as deep and weighty.
 *  B. Live observation — a sweeping scan line and a drifting grid, so the
 *     facility reads as actively measured (the brand Data Overlay metaphor,
 *     on the photo). The pinned data readout stays the DataOverlayPlant card's
 *     job, so we do not duplicate it here.
 *
 * Reduced-motion: by deliberate product decision this hero plays its motion for
 * everyone. A large share of visitors (notably Windows with animation effects
 * off) report prefers-reduced-motion, and the client wants the dynamic first
 * impression to reach them too. So the zoom and scan are CSS animations (not
 * gated by the media query) and the parallax runs inside MotionConfig
 * reducedMotion="never". The rest of the site still respects reduced motion.
 *
 * The layer is decorative (aria-hidden) and pointer-events-none, and parallax
 * listens on window so it never blocks the hero CTAs. Motion is transform/
 * opacity only.
 */
export function HeroBackdrop({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse parallax (gentle, slow spring)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 22 });
  const sy = useSpring(my, { stiffness: 90, damping: 22 });
  const imgX = useTransform(sx, [-1, 1], [-28, 28]);
  const imgY = useTransform(sy, [-1, 1], [-20, 20]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      mx.set(Math.max(-1, Math.min(1, nx)));
      my.set(Math.max(-1, Math.min(1, ny)));
    };
    window.addEventListener("pointermove", handle, { passive: true });
    return () => window.removeEventListener("pointermove", handle);
  }, [mx, my]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="absolute inset-0 -z-10 overflow-hidden bg-structural"
    >
      {/* A. Photo — mouse parallax wraps a slow CSS zoom. Overscan (-inset)
          keeps edges off-screen through both transforms. */}
      <MotionConfig reducedMotion="never">
        <motion.div
          className="absolute -inset-[8%]"
          style={{ x: imgX, y: imgY }}
        >
          <div className="absolute inset-0 hero-kenburns">
            <Image
              src={src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center photo-grade-green-strong"
            />
          </div>
        </motion.div>
      </MotionConfig>

      {/* B. Drifting measurement grid (light, so it reads over the dark photo) */}
      <div
        className="absolute inset-0 opacity-50 animate-grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(250,251,249,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(250,251,249,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* B. Scan line sweeping the facility (CSS, plays for everyone) */}
      <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-primary/70 to-transparent shadow-[0_0_24px_4px] shadow-primary/30 hero-scan" />

      {/* Legibility gradient (keeps the left-aligned hero copy readable) */}
      <div className="absolute inset-0 bg-gradient-to-r from-structural/95 via-structural/70 to-structural/30" />
    </div>
  );
}

"use client";

import { motion, useInView } from "motion/react";
import { type ReactNode, useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { canObserveViewport, useHasMounted } from "@/hooks/use-has-mounted";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  amount?: number;
  duration?: number;
};

/**
 * Fades in once scrolled into view. The reveal is a progressive enhancement:
 * the content renders visible on the server and during the first client render,
 * and only gets hidden + animated after the component has mounted (and only
 * when IntersectionObserver is available). Visitors without working client JS
 * therefore see the copy instead of a permanently hidden (opacity 0) block.
 *
 * Reduced-motion visitors still get the fade (opacity is not a vestibular
 * trigger and motion/react keeps it under reduced motion); the rise + blur are
 * added only when motion is allowed.
 */
export function RevealOnView({
  children,
  delay = 0,
  y = 18,
  className,
  amount = 0.25,
  duration = 0.7,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduced = useSafeReducedMotion();
  const mounted = useHasMounted();

  // Reduced motion fades opacity only; the rise + blur are added only when
  // motion is allowed.
  const hidden = reduced
    ? { opacity: 0, y: 0, filter: "blur(0px)" }
    : { opacity: 0, y, filter: "blur(4px)" };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };

  // Only drive the reveal once mounted and able to observe the viewport. Until
  // then (SSR, first render, or environments without IntersectionObserver) the
  // element stays shown, so the copy is never gated behind JS. Off-screen
  // elements flip to `hidden` after mount without a visible flash, then reveal
  // on scroll. initial={false} keeps motion from emitting opacity:0 into SSR.
  const canReveal = mounted && canObserveViewport();
  const animate = canReveal ? (inView ? shown : hidden) : shown;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={animate}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

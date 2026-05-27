"use client";

import { motion, useInView } from "motion/react";
import { type ReactNode, useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  amount?: number;
  duration?: number;
};

/**
 * Fades in and rises once scrolled into view. When the user prefers reduced
 * motion the content renders in its final state without animation. This also
 * keeps automated screenshots usable.
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

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: "blur(4px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y, filter: "blur(4px)" }
      }
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

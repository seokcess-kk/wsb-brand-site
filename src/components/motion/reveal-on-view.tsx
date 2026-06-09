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
 * Fades in once scrolled into view. Reduced-motion visitors still get the
 * fade (opacity is not a vestibular trigger and motion/react keeps it under
 * reduced motion); the rise + blur are added only when motion is allowed.
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

  const hidden = reduced
    ? { opacity: 0 }
    : { opacity: 0, y, filter: "blur(4px)" };
  const shown = reduced
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={inView ? shown : hidden}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

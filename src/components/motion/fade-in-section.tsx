"use client";

import { motion, useInView, type Variants } from "motion/react";
import { type ReactNode, useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

type SectionProps = {
  children: ReactNode;
  className?: string;
  /** Viewport fraction required to trigger. */
  amount?: number;
  /** Delay between each FadeInItem child. */
  staggerChildren?: number;
  /** Delay before the first child animates. */
  delayChildren?: number;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/**
 * Stagger container. Wraps a group of `FadeInItem` children and reveals them
 * in sequence when the container enters the viewport. Renders as a `<div>`
 * (use a semantic child like `<ul>` inside if you need list semantics).
 *
 * For a single block, prefer `RevealOnView`.
 */
export function FadeInSection({
  children,
  className,
  amount = 0.35,
  staggerChildren = 0.08,
  delayChildren = 0.05,
  id,
  ...aria
}: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Negative bottom margin pulls the trigger zone toward viewport center,
  // so the animation kicks in only after the section has actually scrolled
  // into the reader's field of view — not the moment its top edge clips
  // the lower viewport boundary.
  const inView = useInView(ref, {
    once: true,
    amount,
    margin: "0px 0px -15% 0px",
  });
  const reduced = useSafeReducedMotion();

  if (reduced) {
    return (
      <div ref={ref} id={id} className={className} {...aria}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      id={id}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren, delayChildren } },
      }}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
      {...aria}
    >
      {children}
    </motion.div>
  );
}

type ItemProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Child item inside `FadeInSection`. Inherits parent stagger timing via
 * motion variants — no per-item delay needed.
 */
export function FadeInItem({ children, className }: ItemProps) {
  const reduced = useSafeReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

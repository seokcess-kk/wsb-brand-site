"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Props = HTMLMotionProps<"div"> & {
  /** Disable hover lift / shadow. Default true. */
  interactive?: boolean;
  /** Lift distance in px on hover. */
  lift?: number;
  /** Rendered tag. `article` for independent content units. */
  as?: "div" | "article";
};

/**
 * Card wrapper with brand-aligned hover treatment: a small upward lift, a soft
 * primary-tinted shadow, and border emphasis. Carries the `group` class so
 * inner elements (image, arrow) can react via group-hover utilities.
 *
 * Linking is intentionally left to the consumer: place a stretched-link
 * (`<Link className="absolute inset-0" />`) inside when needed, so internal
 * navigation flows through Next's router without compromising semantics.
 */
export function MotionCard({
  children,
  className,
  interactive = true,
  lift = 3,
  as = "div",
  ...rest
}: Props) {
  const reduced = useSafeReducedMotion();
  const enabled = interactive && !reduced;
  const motionProps = {
    whileHover: enabled ? { y: -lift } : undefined,
    transition: { duration: 0.3, ease: EASE_OUT },
    className: cn(
      "group relative isolate overflow-hidden bg-canvas",
      "border border-structural/10 transition-[box-shadow,border-color] duration-300",
      interactive &&
        "hover:border-structural/20 hover:shadow-[0_18px_40px_-22px_rgba(15,81,50,0.28)]",
      className,
    ),
    ...rest,
  };

  if (as === "article") {
    return (
      <motion.article {...(motionProps as HTMLMotionProps<"article">)}>
        {children}
      </motion.article>
    );
  }
  return <motion.div {...motionProps}>{children}</motion.div>;
}

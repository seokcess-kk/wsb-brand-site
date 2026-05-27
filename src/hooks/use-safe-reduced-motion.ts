"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Hydration-safe wrapper around motion's useReducedMotion.
 *
 * Why: useReducedMotion reads window.matchMedia, which only exists on the
 * client. During SSR it returns null (treated as false), but on the first
 * client render the real value may be true. That divergence causes React
 * hydration mismatches. We force false until after mount, then switch to the
 * real value, so server output and the first client render always agree.
 */
export function useSafeReducedMotion(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  const reduced = useReducedMotion();
  return hydrated ? Boolean(reduced) : false;
}

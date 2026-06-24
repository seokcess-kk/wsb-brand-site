"use client";

import {
  animate,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { useHasMounted } from "@/hooks/use-has-mounted";

type Props = {
  /** The displayed value pattern. Numeric tokens are interpolated. */
  value: string;
  duration?: number;
  className?: string;
};

/**
 * Counts up the first numeric run inside `value` from 0 to target when the
 * element scrolls into view. Preserves non-numeric prefix and suffix
 * (e.g. "+8×", "<10%", "₩100억+", "5/5", "$7M+").
 */
export function CountUp({ value, duration = 1.4, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useSafeReducedMotion();
  const mounted = useHasMounted();

  // Parse value once
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const prefix = match?.[1] ?? "";
  const targetNum = match ? parseFloat(match[2]) : 0;
  const suffix = match?.[3] ?? "";
  const isInteger = !value.includes(".");
  // Final formatted numeral. Rendered as the base text so SSR, no-JS, and the
  // accessibility tree always carry the real value (never 0). The count is a
  // visual layer that only runs once mounted and scrolled into view.
  const targetStr = isInteger
    ? Math.round(targetNum).toString()
    : targetNum.toFixed(1);

  const mv = useMotionValue(targetNum);
  const rounded = useTransform(mv, (latest) =>
    isInteger ? Math.round(latest).toString() : latest.toFixed(1),
  );

  useEffect(() => {
    if (reduced || !mounted || !inView || !match) return;
    // Drop to 0 on view entry, then count back up to the target.
    mv.set(0);
    const controls = animate(mv, targetNum, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, mounted, mv, targetNum, duration, match, reduced]);

  if (!match) {
    return <span className={className}>{value}</span>;
  }

  if (reduced) {
    return (
      <span className={className} aria-label={value}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden>
        {prefix && (
          <span className="text-primary/90">{prefix}</span>
        )}
        <NumeralDisplay rounded={rounded} initial={targetStr} />
        {suffix}
      </span>
    </span>
  );
}

function NumeralDisplay({
  rounded,
  initial,
}: {
  rounded: ReturnType<typeof useTransform<number, string>>;
  initial: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [rounded]);

  return <span ref={ref}>{initial}</span>;
}

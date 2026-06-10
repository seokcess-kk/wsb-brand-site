"use client";

import { motion, useInView } from "motion/react";
import { Fragment, useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";
import { canObserveViewport, useHasMounted } from "@/hooks/use-has-mounted";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /**
   * If true, animation triggers when the element scrolls into view rather
   * than on mount. Use for section headings; leave false (default) for the
   * hero, where the entrance should fire as soon as the page paints.
   */
  triggerOnView?: boolean;
};

/**
 * Splits text by whitespace and animates each word with a small fade + rise.
 * Preserves manual line breaks contained in the text.
 *
 * The entrance is a progressive enhancement: text renders visible on the server
 * and during the first client render, so visitors without working client JS
 * still see the copy rather than a permanently hidden (opacity 0) block.
 */
export function RevealWords({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  triggerOnView = false,
}: Props) {
  const reduced = useSafeReducedMotion();
  const mounted = useHasMounted();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.4,
    margin: "0px 0px -15% 0px",
  });
  const lines = text.split("\n");

  // Mount-trigger case (hero): no scroll dependency. Render the text visible
  // and let a pure-CSS fade-up handle the entrance. CSS runs and completes even
  // without JS, so the headline is never gated behind a JS reveal. Reduced
  // motion skips the animation entirely.
  if (!triggerOnView) {
    return (
      <span ref={ref} className={className} aria-label={text}>
        {lines.map((line, lineIdx) => (
          <Fragment key={lineIdx}>
            {lineIdx > 0 && <br aria-hidden />}
            <span
              className="inline-block"
              style={
                reduced
                  ? undefined
                  : {
                      animation: `reveal-fade-up 0.7s ${delay + lineIdx * 0.12}s both cubic-bezier(0.22, 1, 0.36, 1)`,
                    }
              }
            >
              {line}
            </span>
          </Fragment>
        ))}
      </span>
    );
  }

  // Scroll-trigger case (section headings). Stay visible until mounted and able
  // to observe the viewport; only then gate on inView so the reveal can fire on
  // scroll. initial={false} keeps opacity:0 out of the SSR markup, and an
  // off-screen heading flips to hidden after mount without a visible flash.
  const canReveal = mounted && canObserveViewport();
  const active = canReveal ? inView : true;

  if (reduced) {
    // Fade the whole block in (opacity only, no per-word rise/blur).
    return (
      <motion.span
        ref={ref}
        className={className}
        aria-label={text}
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {lines.map((line, lineIdx) => (
          <Fragment key={lineIdx}>
            {lineIdx > 0 && <br aria-hidden />}
            {line}
          </Fragment>
        ))}
      </motion.span>
    );
  }

  return (
    <span ref={ref} className={className} aria-label={text}>
      {lines.map((line, lineIdx) => {
        const words = line.split(" ");
        return (
          <Fragment key={lineIdx}>
            {lineIdx > 0 && <br aria-hidden />}
            <span className="inline">
              {words.map((word, i) => (
                <Fragment key={`${lineIdx}-${i}`}>
                  <motion.span
                    initial={false}
                    animate={
                      active
                        ? { opacity: 1, y: 0, filter: "blur(0px)" }
                        : { opacity: 0, y: 14, filter: "blur(6px)" }
                    }
                    transition={{
                      duration: 0.55,
                      delay: delay + (lineIdx * words.length + i) * stagger,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-block will-change-transform"
                  >
                    {word}
                  </motion.span>
                  {i < words.length - 1 && " "}
                </Fragment>
              ))}
            </span>
          </Fragment>
        );
      })}
    </span>
  );
}

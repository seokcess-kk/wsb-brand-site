"use client";

import { motion, useInView } from "motion/react";
import { Fragment, useRef } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";

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
 */
export function RevealWords({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  triggerOnView = false,
}: Props) {
  const reduced = useSafeReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.4,
    margin: "0px 0px -15% 0px",
  });
  const lines = text.split("\n");
  const active = triggerOnView ? inView : true;

  if (reduced) {
    // Fade the whole block in (opacity only — no per-word rise/blur). Honors
    // triggerOnView so headings fade on scroll and the hero fades on mount.
    return (
      <motion.span
        ref={ref}
        className={className}
        aria-label={text}
        initial={{ opacity: 0 }}
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
                    initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
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

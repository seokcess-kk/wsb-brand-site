"use client";

import { motion } from "motion/react";
import { Fragment } from "react";
import { useSafeReducedMotion } from "@/hooks/use-safe-reduced-motion";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
};

/**
 * Splits text by whitespace and animates each word with a small fade + rise.
 * Use for Hero headlines. Preserves manual line breaks when text contains <br/>.
 */
export function RevealWords({
  text,
  className,
  delay = 0,
  stagger = 0.06,
}: Props) {
  const reduced = useSafeReducedMotion();
  const lines = text.split("\n");

  if (reduced) {
    return (
      <span className={className} aria-label={text}>
        {text}
      </span>
    );
  }

  return (
    <span className={className} aria-label={text}>
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
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
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

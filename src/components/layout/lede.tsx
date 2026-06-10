import { cn } from "@/lib/utils";

type Props = {
  /** Full lede text. First sentence is rendered with stronger emphasis. */
  text: string;
  /** Use inverse palette for dark backgrounds. */
  inverse?: boolean;
  className?: string;
};

const SENTENCE_BOUNDARY = /([.!?。！？])(\s+|$)/;

/**
 * Splits a lede on its first sentence boundary and renders the lead sentence
 * with a darker tone and slightly heavier weight; the remainder picks up a
 * softer secondary tone. If no boundary is detected the whole text falls
 * back to the secondary tone, preserving readability.
 */
export function Lede({ text, inverse = false, className }: Props) {
  const trimmed = text.trim();
  const match = trimmed.match(SENTENCE_BOUNDARY);

  const primaryTone = inverse ? "text-canvas" : "text-structural";
  const secondaryTone = inverse ? "text-canvas/65" : "text-structural/65";

  if (!match || match.index === undefined) {
    return (
      <p
        className={cn(
          "text-pretty text-base leading-relaxed md:text-lg",
          secondaryTone,
          className,
        )}
      >
        {trimmed}
      </p>
    );
  }

  const headEnd = match.index + match[1].length;
  const head = trimmed.slice(0, headEnd);
  const rest = trimmed.slice(headEnd).trimStart();

  return (
    <p
      className={cn(
        "max-w-2xl text-pretty text-base leading-relaxed md:text-lg",
        secondaryTone,
        className,
      )}
    >
      <span className={cn("font-medium", primaryTone)}>{head}</span>
      {rest && <span>{" " + rest}</span>}
    </p>
  );
}

import { cn } from "@/lib/utils";

type Props = {
  /** Section ordinal (e.g. 1..9). Rendered as 2-digit zero-padded. */
  number?: number;
  /** Total section count, for the "of N" denominator. */
  total?: number;
  /** Uppercase mono section tag (e.g. "BUSINESS MODEL"). */
  tag: string;
  /** Use the inverse palette for dark-background sections. */
  inverse?: boolean;
  className?: string;
};

/**
 * Section eyebrow: zero-padded ordinal · primary line · tag.
 *
 * Reinforces the "precisely observed composition" tone by making each
 * section's place in the overall sequence visible without relying on the
 * sectionMeta string in the upper-right corner.
 */
export function SectionEyebrow({
  number,
  total,
  tag,
  inverse = false,
  className,
}: Props) {
  const showNumber = typeof number === "number";
  const numberText = showNumber ? String(number).padStart(2, "0") : null;
  const denominator =
    showNumber && typeof total === "number"
      ? ` / ${String(total).padStart(2, "0")}`
      : "";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {numberText && (
        <span
          className={cn(
            "mono-label tabular-nums",
            inverse ? "text-canvas/45" : "text-structural/45",
          )}
        >
          {numberText}
          <span
            className={cn(
              "ml-0.5",
              inverse ? "text-canvas/30" : "text-structural/30",
            )}
          >
            {denominator}
          </span>
        </span>
      )}
      <span
        aria-hidden
        className="relative inline-flex h-2.5 w-2.5 flex-none items-center justify-center"
      >
        <span className="absolute h-px w-2.5 bg-primary" />
        <span className="absolute h-2.5 w-px bg-primary" />
      </span>
      <span aria-hidden className={cn("h-px w-6", inverse ? "bg-canvas/40" : "bg-structural/30")} />
      <p className={cn("mono-label", inverse ? "text-canvas/70" : "text-primary")}>
        {tag}
      </p>
    </div>
  );
}

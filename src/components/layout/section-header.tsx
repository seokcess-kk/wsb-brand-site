import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";
import { cn } from "@/lib/utils";

type Props = {
  /** Section ordinal. Omit for connector bands that should stay unnumbered. */
  number?: number;
  total?: number;
  tag: string;
  /** Upper-right meta string (e.g. "05 / 3 PILLARS"). */
  meta?: string;
  heading: string;
  headingId?: string;
  lede?: string;
  /** Optional kicker shown directly above the heading (e.g. a section subtitle). */
  subtitle?: string;
  inverse?: boolean;
};

/**
 * Standard section header: an eyebrow + meta row over a heading + lede grid.
 * Consolidates the block that was hand-rolled in the scale, business, pipeline,
 * and roadmap sections so the rhythm stays identical from one source.
 */
export function SectionHeader({
  number,
  total = 8,
  tag,
  meta,
  heading,
  headingId,
  lede,
  subtitle,
  inverse,
}: Props) {
  return (
    <>
      <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <RevealOnView>
          <SectionEyebrow
            number={number}
            total={number != null ? total : undefined}
            tag={tag}
            inverse={inverse}
          />
        </RevealOnView>
        {meta && (
          <RevealOnView delay={0.05}>
            <p
              className={cn(
                "mono-label",
                inverse ? "text-canvas/55" : "text-structural/65",
              )}
            >
              {meta}
            </p>
          </RevealOnView>
        )}
      </div>

      <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div>
          {subtitle && (
            <RevealOnView>
              <p
                className={cn(
                  "mb-3 text-sm font-medium tracking-tight",
                  inverse ? "text-canvas/70" : "text-primary",
                )}
              >
                {subtitle}
              </p>
            </RevealOnView>
          )}
          <h2
            id={headingId}
            className={cn(
              "font-sans font-bold leading-[1.25] tracking-[-0.015em]",
              inverse ? "text-canvas" : "text-structural",
            )}
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
          >
            <RevealWords text={heading} triggerOnView />
          </h2>
        </div>
        {lede && (
          <RevealOnView delay={0.2}>
            <Lede text={lede} inverse={inverse} />
          </RevealOnView>
        )}
      </div>
    </>
  );
}

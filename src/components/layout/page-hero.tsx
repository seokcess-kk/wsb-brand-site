import { RevealOnView } from "@/components/motion/reveal-on-view";

type Props = {
  tag: string;
  title: string;
  lede?: string;
  meta?: string;
  /**
   * Optional right-rail visual (e.g. a stat block or KPI list).
   * When omitted the lede sits in the right column for a balanced two-up.
   */
  rightRail?: React.ReactNode;
};

/**
 * Page-level hero used by every subpage. Smaller than the homepage Hero,
 * but uses the same brand grammar: short mono tag · big title · lede ·
 * subtle grid background · two-column 1.4 : 1 ratio.
 */
export function PageHero({ tag, title, lede, meta, rightRail }: Props) {
  return (
    <section
      id="main"
      aria-labelledby="page-hero-heading"
      className="relative isolate overflow-hidden bg-canvas border-b border-structural/10"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-50 animate-grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(26,31,27,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,31,27,0.035) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-6 bg-primary" />
              <p className="mono-label text-primary">{tag}</p>
            </div>
          </RevealOnView>
          {meta && (
            <RevealOnView delay={0.05}>
              <p className="mono-label text-structural/50">{meta}</p>
            </RevealOnView>
          )}
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <RevealOnView delay={0.1}>
            <h1
              id="page-hero-heading"
              className="whitespace-pre-line font-sans font-bold leading-[1.1] tracking-tight text-structural"
              style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
            >
              {title}
            </h1>
          </RevealOnView>
          <RevealOnView delay={0.2}>
            {rightRail ?? (
              <p className="max-w-xl text-base leading-relaxed text-structural/75">
                {lede}
              </p>
            )}
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}

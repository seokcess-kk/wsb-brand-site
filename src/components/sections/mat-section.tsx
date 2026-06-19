import { getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";
import { Tooltip } from "@/components/ui/tooltip";
import { MatProcessDiagram } from "@/components/visual/mat-process-diagram";

const STRESSOR_KEYS = [0, 1, 2, 3] as const;

export async function MatSection() {
  const t = await getTranslations("home.mat");
  const stressors = t.raw("stressors") as {
    label: string;
    title: string;
    value: string;
    caption: string;
    tooltip: string;
  }[];

  return (
    <section
      id="mat"
      aria-labelledby="mat-heading"
      className="relative isolate scroll-mt-24 bg-canvas"
    >
      {/* Subtle dotted grid background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(15,81,50,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow number={2} total={8} tag={t("sectionTag")} />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/65">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        {/* ROW 1: Heading + body  |  2x2 stressor grid (equal heights) */}
        <div className="grid items-stretch gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT */}
          <div className="flex flex-col justify-between gap-10">
            <div className="space-y-7">
              <h2
                id="mat-heading"
                className="font-sans font-bold leading-[1.25] tracking-[-0.015em] text-structural"
                style={{ fontSize: "clamp(1.875rem, 3.4vw, 2.75rem)" }}
              >
                <RevealWords text={t("heading")} triggerOnView />
              </h2>
              <RevealOnView delay={0.16}>
                <p className="max-w-prose text-base font-medium leading-[1.6] text-structural md:text-lg">
                  {t("plain")}
                </p>
              </RevealOnView>
              <RevealOnView delay={0.22}>
                <Lede text={t("body")} className="max-w-prose" />
              </RevealOnView>
            </div>
            <RevealOnView delay={0.34}>
              <div className="border-t border-structural/10 pt-6">
                <p className="flex items-start gap-3 text-base font-medium leading-[1.6] text-structural">
                  <span aria-hidden className="mt-[0.4em] h-px w-4 flex-none bg-primary" />
                  <span>{t("value")}</span>
                </p>
                <p className="mono-label mt-4 pl-7 text-structural/65">
                  MAT · METABOLITE AGRICULTURE TECHNOLOGY
                </p>
              </div>
            </RevealOnView>
          </div>

          {/* RIGHT - Stressor grid 2x2 */}
          <div className="grid gap-px bg-structural/10 sm:grid-cols-2">
            {STRESSOR_KEYS.map((i) => {
              const s = stressors[i];
              return (
                <RevealOnView
                  key={i}
                  delay={0.18 + i * 0.08}
                  className="h-full"
                >
                  <StressorCard
                    label={s.label}
                    title={s.title}
                    value={s.value}
                    caption={s.caption}
                    tooltip={s.tooltip}
                  />
                </RevealOnView>
              );
            })}
          </div>
        </div>

        {/* ROW 2: Full-width process diagram */}
        <RevealOnView delay={0.4} className="mt-16">
          <MatProcessDiagram
            plantLabel={t("diagram.plantLabel")}
            outputLabel={t("diagram.outputLabel")}
            controlLabel={t("diagram.controlLabel")}
            controlValue={t("diagram.controlValue")}
            wsbLabel={t("diagram.wsbLabel")}
            wsbValue={t("diagram.wsbValue")}
            note={t("diagram.note")}
          />
        </RevealOnView>
      </div>
    </section>
  );
}

function StressorCard({
  label,
  title,
  value,
  caption,
  tooltip,
}: {
  label: string;
  title: string;
  value: string;
  caption: string;
  tooltip: string;
}) {
  return (
    <article className="group relative h-full bg-canvas p-6 md:p-8 transition-colors hover:bg-primary/[0.03]">
      <div className="flex items-center justify-between">
        <p className="mono-label text-structural/65">{label}</p>
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-primary/40 transition-all group-hover:bg-primary group-hover:scale-150"
        />
      </div>

      <div className="mt-5 flex items-center gap-1.5">
        <h3 className="font-mono text-lg font-semibold tracking-tight text-structural">
          {title}
        </h3>
        <Tooltip content={tooltip}>
          <Info size={13} aria-hidden />
        </Tooltip>
      </div>
      <p
        className="mt-2 font-mono font-semibold tracking-tight text-primary tabular-nums"
        style={{
          fontSize: "clamp(1.875rem, 3.2vw, 2.25rem)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>

      <p className="mt-4 text-sm leading-[1.6] text-structural/65 max-w-[28ch]">
        {caption}
      </p>

      <span
        aria-hidden
        className="absolute bottom-3 right-3 h-2 w-2 border-r border-b border-structural/20 transition-colors group-hover:border-primary"
      />
    </article>
  );
}

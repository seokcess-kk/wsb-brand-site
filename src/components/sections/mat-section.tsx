import { getTranslations } from "next-intl/server";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { MatProcessDiagram } from "@/components/visual/mat-process-diagram";

const STRESSOR_KEYS = [0, 1, 2, 3] as const;

export async function MatSection() {
  const t = await getTranslations("home.mat");
  const stressors = t.raw("stressors") as {
    label: string;
    title: string;
    value: string;
    caption: string;
  }[];

  return (
    <section
      aria-labelledby="mat-heading"
      className="relative isolate bg-canvas"
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

      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-6 bg-primary" />
              <p className="mono-label text-primary">{t("sectionTag")}</p>
            </div>
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/50">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        {/* ROW 1: Heading + body  |  2x2 stressor grid (equal heights) */}
        <div className="grid items-stretch gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT */}
          <div className="flex flex-col justify-between gap-10">
            <div className="space-y-7">
              <RevealOnView delay={0.1}>
                <h2
                  id="mat-heading"
                  className="whitespace-pre-line font-sans font-bold leading-[1.2] tracking-tight text-structural"
                  style={{ fontSize: "clamp(1.875rem, 3.4vw, 2.75rem)" }}
                >
                  {t("heading")}
                </h2>
              </RevealOnView>
              <RevealOnView delay={0.22}>
                <p className="text-base leading-relaxed text-structural/75 max-w-prose">
                  {t("body")}
                </p>
              </RevealOnView>
            </div>
            <RevealOnView delay={0.34}>
              <div className="flex items-center gap-3 border-t border-structural/10 pt-6">
                <span aria-hidden className="h-px w-4 bg-primary" />
                <p className="mono-label text-structural/60">
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
                  />
                </RevealOnView>
              );
            })}
          </div>
        </div>

        {/* ROW 2: Full-width process diagram */}
        <RevealOnView delay={0.4} className="mt-16">
          <MatProcessDiagram
            stressLabel={t("diagram.stressLabel")}
            plantLabel={t("diagram.plantLabel")}
            outputLabel={t("diagram.outputLabel")}
            outputValue={t("diagram.outputValue")}
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
}: {
  label: string;
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <article className="group relative h-full bg-canvas p-6 md:p-8 transition-colors hover:bg-primary/[0.03]">
      <div className="flex items-center justify-between">
        <p className="mono-label text-structural/55">{label}</p>
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-primary/40 transition-all group-hover:bg-primary group-hover:scale-150"
        />
      </div>

      <h3 className="mt-5 font-sans text-lg font-semibold text-structural">
        {title}
      </h3>
      <p
        className="mt-2 font-mono font-semibold tracking-tight text-primary"
        style={{
          fontSize: "clamp(1.875rem, 3.2vw, 2.25rem)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>

      <p className="mt-4 text-sm leading-relaxed text-structural/65 max-w-[28ch]">
        {caption}
      </p>

      <span
        aria-hidden
        className="absolute bottom-3 right-3 h-2 w-2 border-r border-b border-structural/20 transition-colors group-hover:border-primary"
      />
    </article>
  );
}

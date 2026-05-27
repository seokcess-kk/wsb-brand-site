import { getTranslations } from "next-intl/server";
import { RevealOnView } from "@/components/motion/reveal-on-view";

type Phase = {
  label: string;
  period: string;
  title: string;
  bullets: string[];
};

export async function RoadmapSection() {
  const t = await getTranslations("home.roadmap");
  const phases = t.raw("phases") as Phase[];

  return (
    <section
      aria-labelledby="roadmap-heading"
      className="relative isolate bg-structural text-canvas overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] animate-grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(250,251,249,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(250,251,249,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-6 bg-primary" />
              <p className="mono-label text-canvas/65">{t("sectionTag")}</p>
            </div>
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-canvas/40">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <RevealOnView delay={0.1}>
            <h2
              id="roadmap-heading"
              className="whitespace-pre-line font-sans font-bold leading-[1.15] tracking-tight text-canvas"
              style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
            >
              {t("heading")}
            </h2>
          </RevealOnView>
          <RevealOnView delay={0.2}>
            <p className="max-w-2xl text-base leading-relaxed text-canvas/70">
              {t("lede")}
            </p>
          </RevealOnView>
        </div>

        {/* Timeline */}
        <div className="relative mt-20">
          {/* Horizontal connector line on lg+ */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[34px] hidden h-px bg-canvas/15 lg:block"
          />
          <div className="grid items-stretch gap-px bg-canvas/10 lg:grid-cols-3">
            {phases.map((p, i) => (
              <RevealOnView
                key={p.label}
                delay={0.12 + i * 0.1}
                className="h-full"
              >
                <PhaseCard phase={p} index={i} total={phases.length} />
              </RevealOnView>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PhaseCard({
  phase,
  index,
  total,
}: {
  phase: Phase;
  index: number;
  total: number;
}) {
  return (
    <article className="relative flex h-full flex-col gap-6 bg-structural p-8 md:p-10">
      {/* Phase number node (top-left, dotted timeline anchor) */}
      <div className="relative flex items-center gap-4">
        <span
          aria-hidden
          className={`grid h-8 w-8 flex-none place-items-center rounded-full font-mono text-[11px] font-bold ${
            index === total - 1
              ? "bg-canvas/10 text-canvas/55 ring-1 ring-canvas/25"
              : "bg-primary text-canvas"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex flex-col">
          <p className="mono-label text-canvas/55">{phase.label}</p>
          <p className="mono-label text-primary">{phase.period}</p>
        </div>
      </div>

      <h3 className="font-sans text-xl font-bold tracking-tight text-canvas">
        {phase.title}
      </h3>

      <ul className="mt-auto space-y-3 border-t border-canvas/10 pt-5">
        {phase.bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-3 text-sm leading-relaxed text-canvas/75"
          >
            <span
              aria-hidden
              className="mt-[0.5em] h-1 w-1 flex-none rounded-full bg-primary"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

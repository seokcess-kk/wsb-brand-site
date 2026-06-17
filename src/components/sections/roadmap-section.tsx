import { getTranslations } from "next-intl/server";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";
import { MotionCard } from "@/components/motion/motion-card";
import { SectionHeader } from "@/components/layout/section-header";

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
      id="roadmap"
      aria-labelledby="roadmap-heading"
      className="relative isolate scroll-mt-24 bg-structural text-canvas overflow-hidden"
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

      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        <SectionHeader
          number={7}
          inverse
          tag={t("sectionTag")}
          meta={t("sectionMeta")}
          heading={t("heading")}
          headingId="roadmap-heading"
          lede={t("lede")}
        />

        {/* Timeline */}
        <div className="relative mt-14">
          {/* Horizontal connector line on lg+ */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[26px] hidden h-px bg-canvas/15 lg:block"
          />
          <FadeInSection
            className="grid items-stretch gap-4 lg:grid-cols-3"
            delayChildren={0.12}
            staggerChildren={0.1}
          >
            {phases.map((p, i) => (
              <FadeInItem key={p.label} className="h-full">
                <PhaseCard phase={p} index={i} total={phases.length} />
              </FadeInItem>
            ))}
          </FadeInSection>
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
    <MotionCard
      as="article"
      className="flex h-full flex-col gap-4 bg-structural border-canvas/10 p-6 md:p-7 hover:border-canvas/30 hover:shadow-none"
    >
      {/* Phase number node (top-left, timeline anchor) */}
      <div className="relative flex items-center gap-3">
        <span
          aria-hidden
          className={`grid h-7 w-7 flex-none place-items-center rounded-full font-mono text-[11px] font-bold tabular-nums ${
            index === total - 1
              ? "bg-canvas/10 text-canvas/55 ring-1 ring-canvas/25"
              : "bg-primary text-canvas"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex flex-col leading-tight">
          <p className="mono-label text-canvas/55">{phase.label}</p>
          <p className="mono-label text-primary tabular-nums">{phase.period}</p>
        </div>
      </div>

      <h3 className="font-sans text-base font-bold tracking-tight text-canvas">
        {phase.title}
      </h3>

      <ul className="mt-auto space-y-1.5 border-t border-canvas/10 pt-4">
        {phase.bullets.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 text-xs leading-relaxed text-canvas/70"
          >
            <span
              aria-hidden
              className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-primary"
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </MotionCard>
  );
}

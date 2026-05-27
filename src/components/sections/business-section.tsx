import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { RevealOnView } from "@/components/motion/reveal-on-view";

type Pillar = {
  label: string;
  title: string;
  subtitle: string;
  body: string;
  metricLabel: string;
  metricValue: string;
  metricCaption: string;
  cases: string[];
  externalLabel?: string;
  externalHref?: string;
};

export async function BusinessSection() {
  const t = await getTranslations("home.business");
  const pillars = t.raw("pillars") as Pillar[];

  return (
    <section
      aria-labelledby="business-heading"
      className="relative isolate bg-canvas"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
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

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <RevealOnView delay={0.1}>
            <h2
              id="business-heading"
              className="whitespace-pre-line font-sans font-bold leading-[1.15] tracking-tight text-structural"
              style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
            >
              {t("heading")}
            </h2>
          </RevealOnView>
          <RevealOnView delay={0.2}>
            <p className="max-w-2xl text-base leading-relaxed text-structural/75">
              {t("lede")}
            </p>
          </RevealOnView>
        </div>

        {/* 3 pillar cards */}
        <div className="mt-16 grid items-stretch gap-px bg-structural/10 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <RevealOnView
              key={p.label}
              delay={0.12 + i * 0.08}
              className="h-full"
            >
              <PillarCard pillar={p} />
            </RevealOnView>
          ))}
        </div>
      </div>
    </section>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <article className="relative flex h-full flex-col gap-7 bg-canvas p-8 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="mono-label text-structural/55">{pillar.label}</p>
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
      </div>

      {/* Title block */}
      <div className="space-y-2">
        <h3 className="font-sans text-2xl font-bold tracking-tight text-structural">
          {pillar.title}
        </h3>
        <p className="mono-label text-primary">{pillar.subtitle}</p>
      </div>

      {/* Body */}
      <p className="min-h-[6.5rem] text-sm leading-relaxed text-structural/75">
        {pillar.body}
      </p>

      {/* Metric strip */}
      <div className="border-t border-structural/10 pt-5">
        <p className="mono-label text-[10px] text-structural/55">
          {pillar.metricLabel}
        </p>
        <p className="mt-2 font-sans text-3xl font-extrabold tracking-tight text-primary leading-none">
          {pillar.metricValue}
        </p>
        <p className="mt-2 text-xs text-structural/55">
          {pillar.metricCaption}
        </p>
      </div>

      {/* Cases */}
      <ul className="mt-auto space-y-2 border-t border-structural/10 pt-5">
        {pillar.cases.map((c) => (
          <li key={c} className="flex items-start gap-2 text-sm text-structural/70">
            <span
              aria-hidden
              className="mt-[0.5em] h-1 w-1 flex-none rounded-full bg-primary/70"
            />
            <span>{c}</span>
          </li>
        ))}
      </ul>

      {/* External link (only on Phytopresso) */}
      {pillar.externalLabel && pillar.externalHref && (
        <a
          href={pillar.externalHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
        >
          {pillar.externalLabel}
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      )}
    </article>
  );
}

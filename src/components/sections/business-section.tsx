import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";
import { MotionCard } from "@/components/motion/motion-card";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";

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
  cta?: string;
};

const PILLAR_TOPICS = ["solution", "material", "brand"] as const;

export async function BusinessSection() {
  const t = await getTranslations("home.business");
  const pillars = t.raw("pillars") as Pillar[];

  return (
    <section
      id="business"
      aria-labelledby="business-heading"
      className="relative isolate scroll-mt-24 bg-canvas"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow number={5} total={9} tag={t("sectionTag")} />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/65">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <h2
            id="business-heading"
            className="font-sans font-bold leading-[1.15] tracking-tight text-structural"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
          >
            <RevealWords text={t("heading")} triggerOnView />
          </h2>
          <RevealOnView delay={0.2}>
            <Lede text={t("lede")} />
          </RevealOnView>
        </div>

        {/* 3 pillar cards */}
        <FadeInSection
          className="mt-16 grid items-stretch gap-4 lg:grid-cols-3"
          delayChildren={0.12}
          staggerChildren={0.08}
        >
          {pillars.map((p, i) => (
            <FadeInItem key={p.label} className="h-full">
              <PillarCard pillar={p} index={i} />
            </FadeInItem>
          ))}
        </FadeInSection>
      </div>
    </section>
  );
}

function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  return (
    <MotionCard
      as="article"
      className="flex h-full flex-col gap-7 p-8 md:p-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="mono-label text-structural/65">{pillar.label}</p>
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150"
        />
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
        <p className="mono-label text-[10px] text-structural/65">
          {pillar.metricLabel}
        </p>
        <p className="mt-2 font-sans text-3xl font-extrabold tracking-tight text-primary leading-none tabular-nums">
          {pillar.metricValue}
        </p>
        <p className="mt-2 text-xs text-structural/65">
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
      {pillar.externalLabel &&
        pillar.externalHref &&
        pillar.externalHref !== "#" && (
          <a
            href={pillar.externalHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-70"
          >
            {pillar.externalLabel}
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        )}

      {pillar.cta && (
        <Link
          href={`/contact?topic=${PILLAR_TOPICS[index] ?? "material"}`}
          className="group/cta inline-flex items-center gap-2 border-t border-structural/10 pt-5 text-sm font-medium text-primary transition-opacity hover:opacity-70"
        >
          {pillar.cta}
          <ArrowRight
            size={14}
            className="transition-transform group-hover/cta:translate-x-0.5"
          />
        </Link>
      )}
    </MotionCard>
  );
}

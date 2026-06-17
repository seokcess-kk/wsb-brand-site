import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { buildPageMetadata } from "@/lib/page-metadata";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";
import { MotionCard } from "@/components/motion/motion-card";
import { cn } from "@/lib/utils";

type Component = { code: string; name: string; body: string };
type Segment = { name: string; body: string };
type LineupItem = { name: string; category: string; spec: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.business" });
  return buildPageMetadata({
    locale,
    path: "/business",
    title: locale === "ko" ? "사업 영역" : "Business",
    description: t("hero.lede"),
  });
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.business");
  const solComponents = t.raw("solution.components") as Component[];
  const solProcess = t.raw("solution.process") as string[];
  const matSegments = t.raw("material.segments") as Segment[];
  const lineup = t.raw("phytopresso.lineup") as LineupItem[];

  return (
    <>
      <PageHero
        tag={t("hero.tag")}
        meta={t("hero.meta")}
        title={t("hero.title")}
        lede={t("hero.lede")}
      />

      {/* PILLAR 01 — B2B Solution */}
      <PillarSection
        tag={t("solution.tag")}
        title={t("solution.title")}
        body={t("solution.body")}
        accent="light"
        ctaLabel={t("solution.cta")}
        ctaHref="/contact?topic=solution"
      >
        <FadeInSection
          className="mt-12 grid gap-4 md:grid-cols-3"
          staggerChildren={0.06}
        >
          {solComponents.map((c) => (
            <FadeInItem key={c.code} className="h-full">
              <MotionCard
                as="article"
                className="flex h-full flex-col gap-3 p-6 md:p-7"
              >
                <p className="mono-label text-primary">{c.code}</p>
                <h4 className="font-sans text-base font-semibold text-structural">
                  {c.name}
                </h4>
                <p className="text-sm leading-[1.6] text-structural/70">
                  {c.body}
                </p>
              </MotionCard>
            </FadeInItem>
          ))}
        </FadeInSection>

        <div className="mt-12 border-t border-structural/10 pt-8">
          <p className="mono-label mb-5 text-structural/65">
            {t("solution.processLabel")}
          </p>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {solProcess.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold tabular-nums text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-structural/75">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </PillarSection>

      {/* PILLAR 02 — B2B Material */}
      <PillarSection
        tag={t("material.tag")}
        title={t("material.title")}
        body={t("material.body")}
        accent="dark"
        ctaLabel={t("material.cta")}
        ctaHref="/contact?topic=material"
      >
        <FadeInSection
          className="mt-12 grid gap-4 md:grid-cols-3"
          staggerChildren={0.06}
        >
          {matSegments.map((s) => (
            <FadeInItem key={s.name} className="h-full">
              <MotionCard
                as="article"
                className="flex h-full flex-col gap-3 bg-structural border-canvas/10 p-6 md:p-7 hover:border-canvas/30 hover:shadow-none"
              >
                <h4 className="font-sans text-base font-semibold text-canvas">
                  {s.name}
                </h4>
                <p className="text-sm leading-[1.6] text-canvas/70">
                  {s.body}
                </p>
              </MotionCard>
            </FadeInItem>
          ))}
        </FadeInSection>

        <div className="mt-12 border-t border-canvas/10 pt-8">
          <p className="mono-label mb-3 text-canvas/55">
            {t("material.supplyLabel")}
          </p>
          <p className="max-w-3xl text-sm leading-[1.6] text-canvas/70">
            {t("material.supplyNote")}
          </p>
        </div>
      </PillarSection>

      {/* PILLAR 03 — Phytopresso */}
      <PillarSection
        tag={t("phytopresso.tag")}
        title={t("phytopresso.title")}
        body={t("phytopresso.body")}
        accent="light"
        ctaLabel={t("phytopresso.cta")}
        ctaHref="/contact?topic=brand"
      >
        <FadeInSection
          className="mt-12 grid items-stretch gap-4 md:grid-cols-3"
          staggerChildren={0.06}
        >
          {lineup.map((p) => (
            <FadeInItem key={p.name} className="h-full">
              <MotionCard
                as="article"
                className="flex h-full flex-col gap-5 p-6 md:p-8"
              >
                {/* Product placeholder — consistent 4:5 portrait so the lineup
                    reads as an aligned product catalog. */}
                <div
                  className="relative aspect-[4/5] overflow-hidden bg-structural/[0.04] transition-colors duration-500 group-hover:bg-structural/[0.07]"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="mono-label text-[10px] text-structural/35 text-center max-w-[18ch]">
                      {t("phytopresso.photoPlaceholder")}
                    </p>
                  </div>
                  {/* Card-play indicator: spins on hover */}
                  <span
                    aria-hidden
                    className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full border border-structural/15 bg-canvas/70 text-structural/65 backdrop-blur transition-all duration-500 group-hover:rotate-90 group-hover:border-primary/40 group-hover:text-primary"
                  >
                    <Plus size={12} strokeWidth={2.25} />
                  </span>
                  <span aria-hidden className="absolute top-2 left-2 h-2 w-2 border-l border-t border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
                  <span aria-hidden className="absolute top-2 right-2 h-2 w-2 border-r border-t border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
                  <span aria-hidden className="absolute bottom-2 left-2 h-2 w-2 border-l border-b border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
                  <span aria-hidden className="absolute bottom-2 right-2 h-2 w-2 border-r border-b border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
                </div>
                <div className="space-y-2">
                  <p className="mono-label text-primary">{p.category}</p>
                  <h4 className="font-sans text-base font-semibold text-structural">
                    {p.name}
                  </h4>
                  <p className="font-mono text-xs text-structural/65 tabular-nums">
                    {p.spec}
                  </p>
                </div>
              </MotionCard>
            </FadeInItem>
          ))}
        </FadeInSection>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-2xl text-sm text-structural/65">
            {t("phytopresso.distribution")}
          </p>
          {t("phytopresso.externalHref") !== "#" && (
            <a
              href={t("phytopresso.externalHref")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 border border-structural/20 px-5 py-3 text-sm font-medium text-structural transition-colors hover:border-primary hover:text-primary"
            >
              {t("phytopresso.externalCta")}
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          )}
        </div>
      </PillarSection>
    </>
  );
}

function PillarSection({
  tag,
  title,
  body,
  children,
  accent,
  ctaLabel,
  ctaHref,
}: {
  tag: string;
  title: string;
  body: string;
  children: React.ReactNode;
  accent: "light" | "dark";
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const isDark = accent === "dark";
  return (
    <section
      className={
        isDark
          ? "bg-structural text-canvas border-t border-canvas/10"
          : "bg-canvas border-t border-structural/10"
      }
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mb-10">
          <RevealOnView>
            <SectionEyebrow tag={tag} inverse={isDark} />
          </RevealOnView>
        </div>
        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <h2
            className={cn(
              "font-sans font-bold leading-[1.25] tracking-[-0.015em]",
              isDark ? "text-canvas" : "text-structural",
            )}
            style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.5rem)" }}
          >
            <RevealWords text={title} triggerOnView />
          </h2>
          <RevealOnView delay={0.15}>
            <Lede text={body} inverse={isDark} className="max-w-xl" />
          </RevealOnView>
        </div>
        {children}
        {ctaLabel && ctaHref && (
          <div className="mt-12">
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-3 bg-primary px-6 py-3.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
            >
              {ctaLabel}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

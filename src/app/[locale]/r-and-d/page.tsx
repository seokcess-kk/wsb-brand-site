import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/page-metadata";
import { PageHero } from "@/components/layout/page-hero";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";
import { MotionCard } from "@/components/motion/motion-card";
import { Lede } from "@/components/layout/lede";
import {
  PipelineTable,
  type PipelineItem,
} from "@/components/sections/pipeline-table";
import { CtaBand } from "@/components/sections/cta-band";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.rnd" });
  return buildPageMetadata({
    locale,
    path: "/r-and-d",
    title: locale === "ko" ? "R&D · 파이프라인" : "R&D",
    description: t("hero.lede"),
  });
}

export default async function RnDPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.rnd");
  const patents = t.raw("patents.items") as {
    no: string;
    title: string;
    year: string;
  }[];
  const certs = t.raw("cert.items") as {
    name: string;
    year: string;
    issuer: string;
  }[];
  const national = t.raw("national.items") as {
    name: string;
    agency: string;
    period: string;
    status: string;
  }[];

  // The full 6-botanical pipeline data (items, stages, tag, disclaimer) lives in
  // the page's own namespace so it no longer depends on the home pipeline copy.
  const pipelineStages = t.raw("pipeline.stages") as string[];
  const pipelineItems = [...(t.raw("pipeline.items") as PipelineItem[])].sort(
    (a, b) => b.stage - a.stage,
  );
  const pipelineTag = t("pipeline.investigationalTag");
  const pipelineDisclaimer = t("pipeline.disclaimer");

  return (
    <>
      <PageHero
        tag={t("hero.tag")}
        meta={t("hero.meta")}
        title={t("hero.title")}
        lede={t("hero.lede")}
      />

      {/* PIPELINE — all six botanicals (home "see all" lands here) */}
      <section id="pipeline" className="scroll-mt-24 bg-canvas">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12">
            <RevealOnView>
              <SectionEyebrow tag={t("pipeline.sectionTag")} />
            </RevealOnView>
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <h2
              className="font-sans font-bold leading-[1.25] tracking-[-0.015em] text-structural"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
            >
              <RevealWords text={t("pipeline.sectionTitle")} triggerOnView />
            </h2>
            <RevealOnView delay={0.15}>
              <Lede text={t("pipeline.lede")} className="max-w-xl" />
            </RevealOnView>
          </div>
          <div className="mt-12">
            <PipelineTable
              items={pipelineItems}
              stages={pipelineStages}
              investigationalTag={pipelineTag}
              disclaimer={pipelineDisclaimer}
            />
          </div>
        </div>
      </section>

      {/* PATENTS */}
      <section className="bg-canvas border-t border-structural/10">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <RevealOnView>
                <SectionEyebrow tag={t("patents.sectionTag")} />
              </RevealOnView>
              <h2
                className="font-sans font-bold tracking-tight text-structural"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
              >
                <RevealWords text={t("patents.sectionTitle")} triggerOnView />
              </h2>
            </div>
            <div className="flex flex-col items-start gap-1 md:items-end">
              <p className="mono-label text-structural/65">
                {t("patents.totalLabel")}
              </p>
              <p
                className="font-sans font-extrabold tracking-tight text-primary leading-none tabular-nums"
                style={{ fontSize: "3rem" }}
              >
                {t("patents.totalValue")}
              </p>
            </div>
          </div>

          {/* Desktop: table. Mobile: stacked patent cards. */}
          <div className="hidden overflow-hidden border border-structural/10 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-structural/[0.04] text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/65">
                  <th className="px-4 py-3 w-32">Reg. No.</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3 w-20 text-right">Year</th>
                </tr>
              </thead>
              <tbody>
                {patents.map((p) => (
                  <tr
                    key={p.no || p.title}
                    className="border-t border-structural/10 align-top even:bg-structural/[0.02]"
                  >
                    <td className="px-4 py-4 font-mono text-xs">
                      {p.no ? (
                        <span className="text-primary tabular-nums">{p.no}</span>
                      ) : (
                        <span className="text-structural/35">
                          {t("patents.pendingNo")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-structural">{p.title}</td>
                    <td className="px-4 py-4 font-mono text-xs text-structural/65 text-right tabular-nums">
                      {p.year}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {patents.map((p) => (
              <div
                key={p.no || p.title}
                className="border border-structural/10 p-4"
              >
                <p className="text-sm text-structural">{p.title}</p>
                <div className="mt-2 flex items-center gap-3 font-mono text-xs">
                  {p.no ? (
                    <span className="text-primary tabular-nums">{p.no}</span>
                  ) : (
                    <span className="text-structural/35">
                      {t("patents.pendingNo")}
                    </span>
                  )}
                  <span aria-hidden className="h-3 w-px bg-structural/20" />
                  <span className="tabular-nums text-structural/65">{p.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="bg-canvas border-t border-structural/10">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12">
            <RevealOnView>
              <SectionEyebrow tag={t("cert.sectionTag")} />
            </RevealOnView>
          </div>
          <FadeInSection className="grid gap-3" staggerChildren={0.06}>
            {certs.map((c) => (
              <FadeInItem key={c.name}>
                <MotionCard
                  as="article"
                  className="grid items-center gap-4 p-6 md:grid-cols-[1.6fr_1fr_100px] md:p-7"
                >
                  <h3 className="font-sans text-base font-semibold text-structural">
                    {c.name}
                  </h3>
                  <p className="text-sm text-structural/65">{c.issuer}</p>
                  <p className="font-mono text-xs text-primary md:text-right tabular-nums">
                    {c.year}
                  </p>
                </MotionCard>
              </FadeInItem>
            ))}
          </FadeInSection>
        </div>
      </section>

      {/* NATIONAL R&D */}
      <section className="relative isolate bg-structural text-canvas border-t border-canvas/10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12">
            <RevealOnView>
              <SectionEyebrow tag={t("national.sectionTag")} inverse />
            </RevealOnView>
          </div>
          <h2
            className="mb-10 max-w-3xl font-sans font-bold tracking-tight text-canvas"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            <RevealWords text={t("national.sectionTitle")} triggerOnView />
          </h2>
          <FadeInSection className="grid gap-3" staggerChildren={0.08}>
            {national.map((p) => (
              <FadeInItem key={p.name}>
                <MotionCard
                  as="article"
                  className="grid gap-6 bg-structural border-canvas/10 p-6 md:grid-cols-[1.4fr_1fr_140px_120px] md:p-8 md:items-center hover:border-canvas/30 hover:shadow-none"
                >
                  <h3 className="font-sans text-base font-semibold text-canvas leading-snug">
                    {p.name}
                  </h3>
                  <p className="text-sm text-canvas/65">{p.agency}</p>
                  <p className="font-mono text-xs text-canvas/55 tabular-nums">{p.period}</p>
                  <p
                    className={`font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
                      p.status === "수행 중" || p.status === "Ongoing"
                        ? "text-primary"
                        : "text-canvas/55"
                    }`}
                  >
                    {p.status}
                  </p>
                </MotionCard>
              </FadeInItem>
            ))}
          </FadeInSection>
        </div>
      </section>

      <CtaBand
        tone="light"
        eyebrow={t("cta.eyebrow")}
        heading={t("cta.heading")}
        body={t("cta.body")}
        primaryLabel={t("cta.primary")}
        primaryHref="/contact?topic=rnd"
        secondaryLabel={t("cta.secondary")}
        secondaryHref="/company"
      />
    </>
  );
}

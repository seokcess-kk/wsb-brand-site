import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight, Plus } from "lucide-react";
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

type Case = { name: string; body: string; metric: string };
type Component = { code: string; name: string; body: string };
type Segment = { name: string; body: string };
type LineupItem = { name: string; category: string; spec: string };

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.business");
  const solCases = t.raw("solution.cases") as Case[];
  const solComponents = t.raw("solution.components") as Component[];
  const matSegments = t.raw("material.segments") as Segment[];
  const matCases = t.raw("material.cases") as Case[];
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
                <p className="text-sm leading-relaxed text-structural/70">
                  {c.body}
                </p>
              </MotionCard>
            </FadeInItem>
          ))}
        </FadeInSection>

        <CaseRow cases={solCases} />
      </PillarSection>

      {/* PILLAR 02 — B2B Material */}
      <PillarSection
        tag={t("material.tag")}
        title={t("material.title")}
        body={t("material.body")}
        accent="dark"
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
                <p className="text-sm leading-relaxed text-canvas/70">
                  {s.body}
                </p>
              </MotionCard>
            </FadeInItem>
          ))}
        </FadeInSection>

        <CaseRow cases={matCases} accent="dark" />
      </PillarSection>

      {/* PILLAR 03 — Phytopresso */}
      <PillarSection
        tag={t("phytopresso.tag")}
        title={t("phytopresso.title")}
        body={t("phytopresso.body")}
        accent="light"
      >
        <FadeInSection
          className="mt-12 grid items-start gap-4 md:grid-cols-3"
          staggerChildren={0.06}
        >
          {lineup.map((p, i) => (
            <FadeInItem key={p.name}>
              <MotionCard
                as="article"
                className="flex h-full flex-col gap-5 p-6 md:p-8"
              >
                {/* Product placeholder — alternating aspect for bento rhythm */}
                <div
                  className={cn(
                    "relative overflow-hidden bg-structural/[0.04] transition-colors duration-500 group-hover:bg-structural/[0.07]",
                    i % 2 === 1 ? "aspect-square" : "aspect-[4/5]",
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="mono-label text-[10px] text-structural/35 text-center max-w-[18ch]">
                      {t("phytopresso.photoPlaceholder")}
                    </p>
                  </div>
                  {/* Card-play indicator: spins on hover */}
                  <span
                    aria-hidden
                    className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full border border-structural/15 bg-canvas/70 text-structural/40 backdrop-blur transition-all duration-500 group-hover:rotate-90 group-hover:border-primary/40 group-hover:text-primary"
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
                  <p className="font-mono text-xs text-structural/55">
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
}: {
  tag: string;
  title: string;
  body: string;
  children: React.ReactNode;
  accent: "light" | "dark";
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
              "font-sans font-bold leading-[1.18] tracking-tight",
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
      </div>
    </section>
  );
}

function CaseRow({
  cases,
  accent = "light",
}: {
  cases: Case[];
  accent?: "light" | "dark";
}) {
  const isDark = accent === "dark";
  return (
    <div className="mt-10">
      <p
        className={`mb-4 mono-label ${
          isDark ? "text-canvas/55" : "text-structural/55"
        }`}
      >
        CASE STUDIES
      </p>
      <FadeInSection
        className={cn(
          "grid gap-4",
          cases.length === 1 ? "md:grid-cols-1" : "md:grid-cols-2",
        )}
        staggerChildren={0.06}
      >
        {cases.map((c) => (
          <FadeInItem key={c.name}>
            <MotionCard
              as="article"
              className={cn(
                "flex flex-col gap-3 p-6 md:p-8",
                isDark &&
                  "bg-structural border-canvas/10 hover:border-canvas/30 hover:shadow-none",
              )}
            >
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    "font-sans text-base font-semibold",
                    isDark ? "text-canvas" : "text-structural",
                  )}
                >
                  {c.name}
                </h4>
                <p className="font-mono text-sm font-semibold text-primary">
                  {c.metric}
                </p>
              </div>
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  isDark ? "text-canvas/70" : "text-structural/70",
                )}
              >
                {c.body}
              </p>
            </MotionCard>
          </FadeInItem>
        ))}
      </FadeInSection>
    </div>
  );
}

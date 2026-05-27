import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { RevealOnView } from "@/components/motion/reveal-on-view";

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
        <div className="mt-12 grid gap-px bg-structural/10 md:grid-cols-3">
          {solComponents.map((c, i) => (
            <RevealOnView key={c.code} delay={0.06 * i} className="h-full">
              <article className="flex h-full flex-col gap-3 bg-canvas p-6 md:p-7">
                <p className="mono-label text-primary">{c.code}</p>
                <h4 className="font-sans text-base font-semibold text-structural">
                  {c.name}
                </h4>
                <p className="text-sm leading-relaxed text-structural/70">
                  {c.body}
                </p>
              </article>
            </RevealOnView>
          ))}
        </div>

        <CaseRow cases={solCases} />
      </PillarSection>

      {/* PILLAR 02 — B2B Material */}
      <PillarSection
        tag={t("material.tag")}
        title={t("material.title")}
        body={t("material.body")}
        accent="dark"
      >
        <div className="mt-12 grid gap-px bg-canvas/10 md:grid-cols-3">
          {matSegments.map((s, i) => (
            <RevealOnView key={s.name} delay={0.06 * i} className="h-full">
              <article className="flex h-full flex-col gap-3 bg-structural p-6 md:p-7">
                <h4 className="font-sans text-base font-semibold text-canvas">
                  {s.name}
                </h4>
                <p className="text-sm leading-relaxed text-canvas/70">
                  {s.body}
                </p>
              </article>
            </RevealOnView>
          ))}
        </div>

        <CaseRow cases={matCases} accent="dark" />
      </PillarSection>

      {/* PILLAR 03 — Phytopresso */}
      <PillarSection
        tag={t("phytopresso.tag")}
        title={t("phytopresso.title")}
        body={t("phytopresso.body")}
        accent="light"
      >
        <div className="mt-12 grid gap-px bg-structural/10 md:grid-cols-3">
          {lineup.map((p, i) => (
            <RevealOnView key={p.name} delay={0.06 * i} className="h-full">
              <article className="flex h-full flex-col gap-5 bg-canvas p-6 md:p-8">
                {/* Product placeholder */}
                <div className="relative aspect-[4/5] overflow-hidden bg-structural/[0.04]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="mono-label text-[10px] text-structural/35 text-center max-w-[18ch]">
                      {t("phytopresso.photoPlaceholder")}
                    </p>
                  </div>
                  <span aria-hidden className="absolute top-2 left-2 h-2 w-2 border-l border-t border-structural/20" />
                  <span aria-hidden className="absolute top-2 right-2 h-2 w-2 border-r border-t border-structural/20" />
                  <span aria-hidden className="absolute bottom-2 left-2 h-2 w-2 border-l border-b border-structural/20" />
                  <span aria-hidden className="absolute bottom-2 right-2 h-2 w-2 border-r border-b border-structural/20" />
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
              </article>
            </RevealOnView>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-2xl text-sm text-structural/65">
            {t("phytopresso.distribution")}
          </p>
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
        <div className="mb-10 flex items-center gap-3">
          <span aria-hidden className="h-px w-6 bg-primary" />
          <p className={`mono-label ${isDark ? "text-canvas/65" : "text-primary"}`}>
            {tag}
          </p>
        </div>
        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <RevealOnView delay={0.05}>
            <h2
              className={`whitespace-pre-line font-sans font-bold leading-[1.18] tracking-tight ${
                isDark ? "text-canvas" : "text-structural"
              }`}
              style={{ fontSize: "clamp(1.75rem, 3.4vw, 2.5rem)" }}
            >
              {title}
            </h2>
          </RevealOnView>
          <RevealOnView delay={0.15}>
            <p
              className={`max-w-xl text-base leading-relaxed ${
                isDark ? "text-canvas/70" : "text-structural/75"
              }`}
            >
              {body}
            </p>
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
      <div
        className={`grid gap-px ${
          isDark ? "bg-canvas/10" : "bg-structural/10"
        } md:grid-cols-${cases.length === 1 ? "1" : "2"}`}
      >
        {cases.map((c) => (
          <article
            key={c.name}
            className={`flex flex-col gap-3 p-6 md:p-8 ${
              isDark ? "bg-structural" : "bg-canvas"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4
                className={`font-sans text-base font-semibold ${
                  isDark ? "text-canvas" : "text-structural"
                }`}
              >
                {c.name}
              </h4>
              <p className="font-mono text-sm font-semibold text-primary">
                {c.metric}
              </p>
            </div>
            <p
              className={`text-sm leading-relaxed ${
                isDark ? "text-canvas/70" : "text-structural/70"
              }`}
            >
              {c.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

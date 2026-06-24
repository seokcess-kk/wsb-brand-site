import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/page-metadata";
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
import { MatSection } from "@/components/sections/mat-section";
import { FdaSection } from "@/components/sections/fda-section";
import { CtaBand } from "@/components/sections/cta-band";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.technology" });
  return buildPageMetadata({
    locale,
    path: "/technology",
    title: locale === "ko" ? "기술 · MAT" : "Technology",
    description: t("hero.lede"),
  });
}

export default async function TechnologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.technology");
  const stack = t.raw("stack.items") as {
    code: string;
    name: string;
    subtitle: string;
    body: string;
    metric: string;
    metricCaption: string;
  }[];
  const competition = t.raw("competition.rows") as {
    label: string;
    field: string;
    smartfarm: string;
    synthetic: string;
    wsb: string;
  }[];
  const compHeaders = t.raw("competition.headers") as {
    field: string;
    smartfarm: string;
    synthetic: string;
    wsb: string;
  };
  const layers = t.raw("moat.layers") as {
    code: string;
    name: string;
    type: string;
    body: string;
  }[];

  return (
    <>
      <PageHero
        tag={t("hero.tag")}
        meta={t("hero.meta")}
        title={t("hero.title")}
        lede={t("hero.lede")}
      />

      {/* STACK 3 cards */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12">
            <RevealOnView>
              <SectionEyebrow tag={t("stack.sectionTag")} />
            </RevealOnView>
          </div>
          <FadeInSection
            className="grid items-stretch gap-4 lg:grid-cols-3"
            staggerChildren={0.08}
          >
            {stack.map((it) => (
              <FadeInItem key={it.code} className="h-full">
                <MotionCard
                  as="article"
                  className="flex h-full flex-col gap-6 p-8 md:p-10"
                >
                  <div className="flex items-center justify-between">
                    <p className="mono-label text-structural/65">{it.code}</p>
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-sans text-2xl font-bold tracking-tight text-structural">
                      {it.name}
                    </h3>
                    <p className="mono-label text-primary">{it.subtitle}</p>
                  </div>
                  <p className="text-base leading-[1.6] text-structural/75">
                    {it.body}
                  </p>
                  <div className="mt-auto border-t border-structural/10 pt-5">
                    <p
                      className="font-mono font-bold tracking-tight text-primary leading-none tabular-nums"
                      style={{ fontSize: "clamp(2.75rem, 4.2vw, 3.5rem)" }}
                    >
                      {it.metric}
                    </p>
                    <p className="mt-2 text-xs text-structural/65">
                      {it.metricCaption}
                    </p>
                  </div>
                </MotionCard>
              </FadeInItem>
            ))}
          </FadeInSection>
        </div>
      </section>

      {/* Reuse MAT diagram and stressor grid */}
      <MatSection />

      {/* Reuse FDA 5/5 matching table */}
      <FdaSection />

      {/* COMPETITIVE LANDSCAPE */}
      <section className="relative isolate overflow-hidden bg-canvas">
        {/* Faint blueprint grid behind the comparison matrix (masked, ~2%) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid opacity-[0.5] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12">
            <RevealOnView>
              <SectionEyebrow tag={t("competition.sectionTag")} />
            </RevealOnView>
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <h2
              className="font-sans font-bold leading-[1.25] tracking-[-0.015em] text-structural"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
            >
              <RevealWords text={t("competition.sectionTitle")} triggerOnView />
            </h2>
            <RevealOnView delay={0.15}>
              <Lede text={t("competition.lede")} className="max-w-xl" />
            </RevealOnView>
          </div>

          {/* Desktop: a system-style comparison matrix. Competitor columns are
              muted with horizontal rules only (no spreadsheet gridlines); the
              WSB column is lifted into one solid deep-green pillar (white text,
              lime check, soft shadow) so the strength reads at a glance. */}
          <div className="mt-12 hidden overflow-x-auto px-1 pb-3 lg:block">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col className="w-[25%]" />
              </colgroup>
              <thead>
                <tr className="text-left align-bottom font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-structural/45">
                  <th className="px-4 pb-4 font-medium" />
                  <th className="px-4 pb-4 font-medium">{compHeaders.field}</th>
                  <th className="px-4 pb-4 font-medium">
                    {compHeaders.smartfarm}
                  </th>
                  <th className="px-4 pb-4 font-medium">
                    {compHeaders.synthetic}
                  </th>
                  <th className="rounded-t-lg bg-primary px-5 pb-4 pt-3 text-[11px] font-semibold tracking-[0.12em] text-canvas shadow-[0_-2px_24px_-8px_rgba(15,81,50,0.45)]">
                    {compHeaders.wsb}
                  </th>
                </tr>
              </thead>
              <tbody>
                {competition.map((r, idx) => {
                  const last = idx === competition.length - 1;
                  return (
                    <tr key={r.label} className="group">
                      <td className="border-t border-structural/10 px-4 py-5 align-top mono-label text-structural/55 whitespace-nowrap">
                        {r.label}
                      </td>
                      <td className="border-t border-structural/10 px-4 py-5 align-top text-structural/55 transition-colors group-hover:text-structural/75">
                        {r.field}
                      </td>
                      <td className="border-t border-structural/10 px-4 py-5 align-top text-structural/55 transition-colors group-hover:text-structural/75">
                        {r.smartfarm}
                      </td>
                      <td className="border-t border-structural/10 px-4 py-5 align-top text-structural/55 transition-colors group-hover:text-structural/75">
                        {r.synthetic}
                      </td>
                      <td
                        className={cn(
                          "bg-primary px-5 py-5 align-top text-canvas shadow-[0_0_24px_-10px_rgba(15,81,50,0.5)]",
                          last && "rounded-b-lg",
                        )}
                      >
                        <span className="flex items-start gap-2">
                          <Check
                            size={14}
                            aria-hidden
                            className="mt-0.5 flex-none text-[color:var(--color-data)]"
                          />
                          <span className="font-medium leading-snug">
                            {r.wsb}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-12 grid gap-3 lg:hidden">
            {competition.map((r) => (
              <div key={r.label} className="border border-structural/10">
                <p className="border-b border-structural/10 bg-structural/[0.04] px-4 py-3 mono-label text-structural/65">
                  {r.label}
                </p>
                <dl className="divide-y divide-structural/10">
                  <CompRow label={compHeaders.field} value={r.field} />
                  <CompRow label={compHeaders.smartfarm} value={r.smartfarm} />
                  <CompRow label={compHeaders.synthetic} value={r.synthetic} />
                  <CompRow label={compHeaders.wsb} value={r.wsb} highlight />
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECHNICAL MOAT */}
      <section className="relative isolate bg-structural text-canvas">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12">
            <RevealOnView>
              <SectionEyebrow tag={t("moat.sectionTag")} inverse />
            </RevealOnView>
          </div>
          <h2
            className="max-w-3xl font-sans font-bold leading-[1.25] tracking-[-0.015em] text-canvas"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
          >
            <RevealWords text={t("moat.sectionTitle")} triggerOnView />
          </h2>
          <FadeInSection
            className="mt-12 grid gap-4 md:grid-cols-3"
            staggerChildren={0.08}
          >
            {layers.map((l) => (
              <FadeInItem key={l.code} className="h-full">
                <MotionCard
                  as="article"
                  className="flex h-full flex-col gap-5 bg-structural border-canvas/10 p-8 md:p-10 hover:border-canvas/30 hover:shadow-none"
                >
                  <div className="flex items-center justify-between">
                    <p className="mono-label text-primary">{l.code}</p>
                    <p className="mono-label text-canvas/55">{l.type}</p>
                  </div>
                  <h3 className="font-sans text-xl font-bold tracking-tight text-canvas">
                    {l.name}
                  </h3>
                  <p className="text-base leading-[1.6] text-canvas/70">
                    {l.body}
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
        primaryHref="/contact?topic=solution"
        secondaryLabel={t("cta.secondary")}
        secondaryHref="/business"
      />
    </>
  );
}

function CompRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 px-4 py-3",
        highlight && "bg-primary text-canvas",
      )}
    >
      <dt
        className={cn(
          "mono-label text-[10px]",
          highlight ? "text-canvas/70" : "text-structural/55",
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "flex items-start gap-1.5 text-right text-sm",
          highlight ? "font-medium text-canvas" : "text-structural/75",
        )}
      >
        {highlight && (
          <Check
            size={13}
            aria-hidden
            className="mt-0.5 flex-none text-[color:var(--color-data)]"
          />
        )}
        <span>{value}</span>
      </dd>
    </div>
  );
}

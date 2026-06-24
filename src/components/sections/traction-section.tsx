import { getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { Cta } from "@/components/ui/cta";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import { CountUp } from "@/components/motion/count-up";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";
import { Tooltip } from "@/components/ui/tooltip";
import { ImageFrame } from "@/components/visual/image-frame";

type Metric = { label: string; value: string; caption: string };
type Photo = { caption: string; src?: string };

// Performance evidence (gains, consistency, supply record). Capacity and site
// figures come from the `metrics` array below so the old Scale band folds in
// here without duplicating the 2.52M annual-capacity number.
const KPI_KEYS = ["saponin", "batch", "clinical"] as const;

/**
 * Proven capability. Merges the former Production & R&D Scale band into this
 * section: performance KPIs and facility-scale figures share one metric grid,
 * the Yeoncheon facility imagery sits below, and the partner network closes it.
 * Real photography and some figures are pending, so media wells render as
 * captioned placeholders. See memory/project_wsb_asset_requests.md.
 */
export async function TractionSection() {
  const t = await getTranslations("home.traction");
  const metrics = t.raw("metrics") as Metric[];
  const photos = t.raw("photos") as Photo[];
  const pending = t("assetPending");
  const [lead, ...supporting] = photos;

  return (
    <section
      aria-labelledby="traction-heading"
      className="relative isolate overflow-hidden border-t border-structural/10 bg-canvas"
    >
      {/* Faint blueprint grid marks this as a data section. Masked to the top
          and bottom edges so metric cells and photos stay clean (~2% strength). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.55] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow number={4} total={8} tag={t("sectionTag")} />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/65">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <h2
            id="traction-heading"
            className="font-sans font-bold leading-[1.25] tracking-[-0.015em] text-structural"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
          >
            <RevealWords text={t("heading")} triggerOnView />
          </h2>
          <RevealOnView delay={0.2}>
            <Lede text={t("lede")} />
          </RevealOnView>
        </div>

        {/* Metric grid: performance KPIs (top row) then facility scale (bottom).
            One grid keeps both groups on a shared rhythm. */}
        <dl className="mt-16 grid gap-px bg-structural/10 sm:grid-cols-2 lg:grid-cols-3">
          {KPI_KEYS.map((key, i) => (
            <RevealOnView key={key} delay={0.1 + i * 0.06} className="h-full">
              <MetricCell
                label={t(`kpis.${key}.label`)}
                value={t(`kpis.${key}.value`)}
                caption={t(`kpis.${key}.caption`)}
                source={t(`kpis.${key}.source`)}
                asOf={t(`kpis.${key}.asOf`)}
              />
            </RevealOnView>
          ))}
          {metrics.map((m, i) => (
            <RevealOnView
              key={m.label}
              delay={0.1 + (i + 3) * 0.06}
              className="h-full"
            >
              {/* Capacity/area figures are precise multi-digit values, so render
                  verbatim (plain) rather than counting up. */}
              <MetricCell
                label={m.label}
                value={m.value}
                caption={m.caption}
                plain
              />
            </RevealOnView>
          ))}
        </dl>

        {/* Facility imagery — placeholders until photography arrives */}
        <FadeInSection
          className="mt-4 grid gap-4"
          delayChildren={0.1}
          staggerChildren={0.08}
        >
          {lead && (
            <FadeInItem>
              <ImageFrame
                caption={lead.caption}
                src={lead.src}
                pending={pending}
                ratio="21 / 9"
                sizes="(min-width: 1280px) 1216px, 100vw"
                index="01"
                dataId="IMG-FAC-01"
              />
            </FadeInItem>
          )}
          {supporting.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {supporting.map((p, i) => {
                const n = String(i + 2).padStart(2, "0");
                return (
                  <FadeInItem key={p.caption}>
                    <ImageFrame
                      caption={p.caption}
                      src={p.src}
                      pending={pending}
                      ratio="4 / 3"
                      sizes="(min-width: 768px) 600px, 100vw"
                      index={n}
                      dataId={`IMG-FAC-${n}`}
                    />
                  </FadeInItem>
                );
              })}
            </div>
          )}
        </FadeInSection>

        {/* Partner network — confirmed milestones are announced via News */}
        <div className="mt-20">
          <RevealOnView>
            <div className="mb-6 flex items-center gap-3">
              <span aria-hidden className="h-px w-6 bg-primary" />
              <p className="mono-label text-structural/50">{t("partnersTag")}</p>
            </div>
          </RevealOnView>
          <RevealOnView delay={0.06}>
            <div className="grid gap-8 border-t border-structural/10 pt-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
              <p className="max-w-2xl text-base leading-[1.6] text-structural/70">
                {t("networkNote")}
              </p>
              <div className="flex items-start lg:justify-end">
                <Cta
                  href="/news"
                  label={t("networkCta")}
                  variant="outline"
                  tone="light"
                  icon="up"
                  className="px-5 py-3"
                />
              </div>
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}

function MetricCell({
  label,
  value,
  caption,
  source,
  asOf,
  plain = false,
}: {
  label: string;
  value: string;
  caption: string;
  source?: string;
  asOf?: string;
  plain?: boolean;
}) {
  return (
    <div className="group relative h-full bg-canvas p-6 transition-colors hover:bg-primary/[0.03] md:p-7">
      <dt className="mono-label text-structural/65">{label}</dt>
      <dd
        className="mt-4 font-mono font-bold leading-none tracking-tight text-primary tabular-nums"
        style={{ fontSize: "clamp(1.875rem, 3.2vw, 2.5rem)" }}
      >
        {plain ? value : <CountUp value={value} />}
      </dd>
      <p className="mt-4 text-sm leading-[1.6] text-structural/65 max-w-[28ch]">
        {caption}
      </p>
      {(source || asOf) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 mono-label text-[10px] text-structural/55">
          {asOf && <span className="tabular-nums">{asOf}</span>}
          {source && (
            <Tooltip content={source} className="text-structural/40 hover:text-structural">
              <Info size={11} aria-hidden />
            </Tooltip>
          )}
        </div>
      )}
      <span
        aria-hidden
        className="absolute top-3 right-3 h-2 w-2 border-r border-t border-structural/20"
      />
    </div>
  );
}


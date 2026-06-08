import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import { CountUp } from "@/components/motion/count-up";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";

const KPI_KEYS = ["saponin", "batch", "traction", "clinical"] as const;

export async function TractionSection() {
  const t = await getTranslations("home.traction");

  return (
    <section
      aria-labelledby="traction-heading"
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

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow number={4} total={9} tag={t("sectionTag")} inverse />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-canvas/40">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <h2
            id="traction-heading"
            className="font-sans font-bold leading-[1.15] tracking-tight text-canvas"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
          >
            <RevealWords text={t("heading")} triggerOnView />
          </h2>
          <RevealOnView delay={0.2}>
            <Lede text={t("lede")} inverse />
          </RevealOnView>
        </div>

        {/* KPI grid — bento asymmetry: first KPI emphasised at 2× width on lg */}
        <dl className="mt-16 grid gap-px bg-canvas/10 sm:grid-cols-2 lg:grid-cols-5">
          {KPI_KEYS.map((key, i) => {
            const emphasis = i === 0;
            return (
              <RevealOnView
                key={key}
                delay={0.1 + i * 0.06}
                className={emphasis ? "h-full lg:col-span-2" : "h-full"}
              >
                <KpiCell
                  label={t(`kpis.${key}.label`)}
                  value={t(`kpis.${key}.value`)}
                  caption={t(`kpis.${key}.caption`)}
                  source={t(`kpis.${key}.source`)}
                  asOf={t(`kpis.${key}.asOf`)}
                  emphasis={emphasis}
                  // Capacity is a precise multi-digit figure; CountUp rounds to
                  // one decimal, so render it verbatim to keep 2.52M intact.
                  plain={key === "traction"}
                />
              </RevealOnView>
            );
          })}
        </dl>

        {/* Partner network — confirmed milestones are announced via News */}
        <div className="mt-20">
          <RevealOnView>
            <div className="mb-6 flex items-center gap-3">
              <span aria-hidden className="h-px w-6 bg-primary" />
              <p className="mono-label text-canvas/50">{t("partnersTag")}</p>
            </div>
          </RevealOnView>
          <RevealOnView delay={0.06}>
            <div className="grid gap-8 border-t border-canvas/10 pt-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
              <p className="max-w-2xl text-base leading-relaxed text-canvas/70">
                {t("networkNote")}
              </p>
              <div className="flex items-start lg:justify-end">
                <Link
                  href="/news"
                  className="group inline-flex items-center gap-2 border border-canvas/20 px-5 py-3 text-sm font-medium text-canvas transition-colors hover:border-primary hover:text-primary"
                >
                  {t("networkCta")}
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}

function KpiCell({
  label,
  value,
  caption,
  source,
  asOf,
  emphasis = false,
  plain = false,
}: {
  label: string;
  value: string;
  caption: string;
  source?: string;
  asOf?: string;
  emphasis?: boolean;
  plain?: boolean;
}) {
  return (
    <div className="group relative h-full bg-structural p-7 transition-colors hover:bg-structural/95">
      <div className="flex items-center gap-2">
        {emphasis && (
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
        )}
        <dt className="mono-label text-canvas/60">{label}</dt>
      </div>
      <dd
        className="mt-4 font-sans font-extrabold tracking-tight text-canvas leading-none tabular-nums"
        style={{
          fontSize: emphasis
            ? "clamp(3rem, 6vw, 4.75rem)"
            : "clamp(2.25rem, 4.5vw, 3.25rem)",
        }}
      >
        {plain ? value : <CountUp value={value} />}
      </dd>
      <p className="mt-5 text-sm leading-relaxed text-canvas/65 max-w-[28ch]">
        {caption}
      </p>
      {(source || asOf) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 mono-label text-[10px] text-canvas/40">
          {asOf && <span className="tabular-nums">{asOf}</span>}
          {asOf && source && <span aria-hidden>·</span>}
          {source && <span>{source}</span>}
        </div>
      )}
      <span
        aria-hidden
        className="absolute top-3 right-3 h-2 w-2 border-r border-t border-canvas/30"
      />
    </div>
  );
}

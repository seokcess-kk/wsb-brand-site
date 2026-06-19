import { getTranslations } from "next-intl/server";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import { CountUp } from "@/components/motion/count-up";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { StandardizationCompare } from "@/components/visual/standardization-compare";
import { GrowthCurve } from "@/components/visual/growth-curve";

export async function ProblemSection() {
  const t = await getTranslations("home.problem");
  const metrics = t.raw("opportunity.metrics") as {
    label: string;
    value: string;
  }[];

  return (
    <section
      aria-labelledby="problem-heading"
      className="relative isolate bg-surface"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow number={1} total={8} tag={t("sectionTag")} />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/65">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <h2
          id="problem-heading"
          className="max-w-4xl font-sans font-bold leading-[1.25] tracking-[-0.015em] text-structural"
          style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
        >
          <RevealWords text={t("heading")} triggerOnView responsiveBreak />
        </h2>

        {/* 2-column compare. items-stretch keeps both cards equal height. */}
        <div className="mt-16 grid items-stretch gap-px bg-structural/15 md:grid-cols-2">
          {/* STANDARDIZATION card */}
          <RevealOnView delay={0.2} className="h-full">
            <CompareCard
              accent="primary"
              label={t("problem.label")}
              title={t("problem.title")}
              body={t("problem.body")}
              chart={<StandardizationCompare />}
              heroLabel="CONVENTIONAL"
              heroValue="±35%"
              heroTone="muted"
              heroExtra={{ label: "WSB", value: "<10%", tone: "primary" }}
              source={t("problem.source")}
            />
          </RevealOnView>

          {/* OPPORTUNITY card */}
          <RevealOnView delay={0.32} className="h-full">
            <CompareCard
              accent="primary"
              label={t("opportunity.label")}
              title={t("opportunity.title")}
              body={t("opportunity.body")}
              chart={
                <GrowthCurve
                  startYear={metrics[0].label}
                  endYear={metrics[2].label}
                  startValue={metrics[0].value}
                  endValue={metrics[2].value}
                  cagrLabel={`CAGR  ${metrics[1].value}`}
                />
              }
              heroLabel={metrics[2].label}
              heroValue={<CountUp value={metrics[2].value} duration={1.2} />}
              heroExtra={{ label: metrics[1].label, value: metrics[1].value }}
            />
          </RevealOnView>
        </div>
      </div>
    </section>
  );
}

function CompareCard({
  accent,
  label,
  title,
  body,
  chart,
  heroLabel,
  heroValue,
  heroSub,
  heroTone,
  heroExtra,
  source,
}: {
  accent: "muted" | "primary";
  label: string;
  title: string;
  body: string;
  chart: React.ReactNode;
  /** Hero figure: the card's single largest, most quotable number. */
  heroLabel: string;
  heroValue: React.ReactNode;
  heroSub?: string;
  /** Color of the first hero figure. Defaults from accent. Set "muted" to read
      a value as a baseline being beaten (e.g. the conventional ±35%). */
  heroTone?: "primary" | "muted";
  /** Optional second hero figure shown beside the first at the same scale.
      Gives two headline numbers equal weight (market size + CAGR, or a
      before/after comparison). Each figure can set its own tone. */
  heroExtra?: { label: string; value: React.ReactNode; tone?: "primary" | "muted" };
  /** Small source / basis line so the figures read as evidence, not decoration. */
  source?: string;
}) {
  const figureToneClass = (tone: "primary" | "muted") =>
    tone === "muted" ? "text-structural/60" : "text-primary";
  const firstTone = heroTone ?? (accent === "primary" ? "primary" : "muted");
  const secondTone = heroExtra?.tone ?? "primary";
  return (
    <article className="relative flex h-full flex-col gap-7 overflow-hidden bg-canvas p-8 md:p-10">
      {accent === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-20 w-20"
          style={{
            background:
              "linear-gradient(225deg, rgba(15,81,50,0.10) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Header */}
      <div className="relative flex items-center gap-3">
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${
            accent === "primary" ? "bg-primary" : "bg-structural/40"
          }`}
        />
        <p
          className={`mono-label ${
            accent === "primary" ? "text-primary" : "text-structural/65"
          }`}
        >
          {label}
        </p>
      </div>

      {/* Title + Body. min-height keeps text block roughly equal across cards. */}
      <div className="relative space-y-5">
        <h3 className="font-sans text-2xl font-bold tracking-tight text-structural">
          {title}
        </h3>
        <p className="text-base leading-[1.6] text-structural/75">
          {body}
        </p>
      </div>

      {/* Chart fills available space */}
      <div className="relative mt-auto">{chart}</div>

      {/* Hero figure: one oversized number per card so the card's core evidence
          is graspable at a glance. heroSub carries the secondary metric so no
          data is lost from the old two-cell footer. */}
      <div className="relative border-t border-structural/10 pt-6">
        {heroExtra ? (
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <p className="mono-label text-[10px] text-structural/65">{heroLabel}</p>
              <p className={`mt-2.5 font-sans text-[2rem] font-extrabold leading-[0.95] tracking-tight tabular-nums md:text-[2.5rem] ${figureToneClass(firstTone)}`}>
                {heroValue}
              </p>
            </div>
            <div>
              <p className="mono-label text-[10px] text-structural/65">{heroExtra.label}</p>
              <p className={`mt-2.5 font-sans text-[2rem] font-extrabold leading-[0.95] tracking-tight tabular-nums md:text-[2.5rem] ${figureToneClass(secondTone)}`}>
                {heroExtra.value}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <p className="mono-label text-[10px] text-structural/65">{heroLabel}</p>
              {heroSub && (
                <p className="mono-label text-[10px] tabular-nums text-structural/55">
                  {heroSub}
                </p>
              )}
            </div>
            <p
              className={`mt-2.5 font-sans text-[2rem] font-extrabold leading-[0.95] tracking-tight tabular-nums md:text-[2.5rem] ${
                accent === "primary" ? "text-primary" : "text-structural"
              }`}
            >
              {heroValue}
            </p>
          </>
        )}
      </div>

      {/* Source row is always rendered (placeholder when empty) so cards that
          carry a source basis and cards that do not still bottom-align: the
          hero figures and card floors line up across the two-column compare. */}
      <p className="relative -mt-1 flex items-start gap-1.5 mono-label text-[10px] text-structural/65">
        {source ? (
          <>
            <span aria-hidden className="mt-[0.45em] inline-block h-1 w-1 flex-none rounded-full bg-structural/30" />
            <span>{source}</span>
          </>
        ) : (
          <span aria-hidden>&nbsp;</span>
        )}
      </p>
    </article>
  );
}

import { getTranslations } from "next-intl/server";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import { CountUp } from "@/components/motion/count-up";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { ChaosScatter } from "@/components/visual/chaos-scatter";
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
      className="relative isolate bg-canvas"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow number={1} total={9} tag={t("sectionTag")} />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/65">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <h2
          id="problem-heading"
          className="max-w-4xl font-sans font-bold leading-[1.18] tracking-tight text-structural"
          style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
        >
          <RevealWords text={t("heading")} triggerOnView />
        </h2>

        {/* 2-column compare. items-stretch keeps both cards equal height. */}
        <div className="mt-16 grid items-stretch gap-px bg-structural/15 md:grid-cols-2">
          {/* PROBLEM card */}
          <RevealOnView delay={0.2} className="h-full">
            <CompareCard
              accent="muted"
              label={t("problem.label")}
              title={t("problem.title")}
              body={t("problem.body")}
              chart={
                <ChaosScatter
                  yLabel="API CONTENT"
                  toleranceLabel="PHARMA SPEC"
                />
              }
              footerLeft={{ label: "σ · VARIATION", value: "±35%" }}
              footerRight={{ label: "PHARMA MATCH", value: "0/5" }}
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
              footerLeft={{ label: metrics[1].label, value: metrics[1].value }}
              footerRight={{
                label: metrics[2].label,
                value: <CountUp value={metrics[2].value} duration={1.2} />,
              }}
              source={t("opportunity.source")}
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
  footerLeft,
  footerRight,
  source,
}: {
  accent: "muted" | "primary";
  label: string;
  title: string;
  body: string;
  chart: React.ReactNode;
  footerLeft: { label: string; value: React.ReactNode };
  footerRight: { label: string; value: React.ReactNode };
  /** Small source / basis line so the figures read as evidence, not decoration. */
  source?: string;
}) {
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
        <p className="min-h-[6.5rem] text-base leading-relaxed text-structural/75">
          {body}
        </p>
      </div>

      {/* Chart fills available space */}
      <div className="relative mt-auto">{chart}</div>

      {/* Footer metrics: identical shape on both cards for balance */}
      <dl className="relative grid grid-cols-2 gap-px border-t border-structural/10 pt-6">
        <FooterMetric label={footerLeft.label} value={footerLeft.value} />
        <FooterMetric
          label={footerRight.label}
          value={footerRight.value}
          accent={accent === "primary"}
        />
      </dl>

      {source && (
        <p className="relative -mt-1 flex items-center gap-1.5 mono-label text-[10px] text-structural/65">
          <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-structural/30" />
          {source}
        </p>
      )}
    </article>
  );
}

function FooterMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="mono-label text-[10px] text-structural/65">{label}</dt>
      <dd
        className={`font-sans text-xl font-bold tabular-nums ${
          accent ? "text-primary" : "text-structural"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

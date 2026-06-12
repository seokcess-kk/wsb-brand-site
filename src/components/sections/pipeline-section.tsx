import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";
import { PipelineTable, type PipelineItem } from "./pipeline-table";

export async function PipelineSection() {
  const t = await getTranslations("home.pipeline");
  const stages = t.raw("stages") as string[];
  const allItems = t.raw("items") as PipelineItem[];
  const investigationalTag = t("investigationalTag");
  const disclaimer = t("disclaimer");
  // Home shows only the 3 most advanced pipelines; full list lives on /r-and-d.
  const items = [...allItems].sort((a, b) => b.stage - a.stage).slice(0, 3);

  return (
    <section
      id="pipeline"
      aria-labelledby="pipeline-heading"
      className="relative isolate scroll-mt-24 bg-canvas"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(15,81,50,0.07) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow number={6} total={9} tag={t("sectionTag")} />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/65">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <h2
            id="pipeline-heading"
            className="font-sans font-bold leading-[1.15] tracking-tight text-structural"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
          >
            <RevealWords text={t("heading")} triggerOnView />
          </h2>
          <RevealOnView delay={0.2}>
            <Lede text={t("lede")} />
          </RevealOnView>
        </div>

        <div className="mt-16">
          <PipelineTable
            items={items}
            stages={stages}
            investigationalTag={investigationalTag}
            disclaimer={disclaimer}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            href="/r-and-d"
            className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
          >
            {t("viewAll")}
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

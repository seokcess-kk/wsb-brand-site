import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";
import { MotionCard } from "@/components/motion/motion-card";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";

type Item = {
  date: string;
  category: string;
  title: string;
  summary: string;
};

export async function NewsSection() {
  const t = await getTranslations("home.news");
  const items = t.raw("items") as Item[];

  return (
    <section
      aria-labelledby="news-heading"
      className="relative isolate bg-canvas"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow number={8} total={9} tag={t("sectionTag")} />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/50">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <h2
            id="news-heading"
            className="font-sans font-bold leading-[1.15] tracking-tight text-structural"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
          >
            <RevealWords text={t("heading")} triggerOnView />
          </h2>
          <RevealOnView delay={0.2}>
            <div className="space-y-5">
              <Lede text={t("lede")} />
              <Link
                href="/news"
                className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
              >
                {t("viewAll")}
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </RevealOnView>
        </div>

        {/* News cards */}
        <FadeInSection
          className="mt-16 grid items-stretch gap-4 lg:grid-cols-3"
          delayChildren={0.12}
          staggerChildren={0.08}
        >
          {items.map((item) => (
            <FadeInItem key={item.title} className="h-full">
              <NewsCard item={item} />
            </FadeInItem>
          ))}
        </FadeInSection>
      </div>
    </section>
  );
}

function NewsCard({ item }: { item: Item }) {
  return (
    <MotionCard
      as="article"
      className="flex h-full flex-col gap-5 p-8 md:p-10"
    >
      {/* Structured media well until final press imagery is available. */}
      <div className="relative aspect-[16/9] overflow-hidden bg-structural/[0.04] transition-colors duration-500 group-hover:bg-structural/[0.07]">
        <div className="absolute inset-0 bg-grid opacity-70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <p className="mono-label text-[11px] text-primary">
            WSB UPDATE
          </p>
          <p className="mono-label text-[11px] text-structural/35">
            {item.category} · {item.date}
          </p>
        </div>
        {/* Corner ticks for the brand frame feel */}
        <span aria-hidden className="absolute top-2 left-2 h-2 w-2 border-l border-t border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
        <span aria-hidden className="absolute top-2 right-2 h-2 w-2 border-r border-t border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
        <span aria-hidden className="absolute bottom-2 left-2 h-2 w-2 border-l border-b border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
        <span aria-hidden className="absolute bottom-2 right-2 h-2 w-2 border-r border-b border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4">
        <p className="mono-label text-[11px] text-structural/55">{item.date}</p>
        <span aria-hidden className="h-px w-3 bg-structural/30" />
        <p className="mono-label text-[11px] text-primary">{item.category}</p>
      </div>

      {/* Title */}
      <h3 className="font-sans text-lg font-bold tracking-tight text-structural">
        {item.title}
      </h3>

      {/* Summary */}
      <p className="text-sm leading-relaxed text-structural/70">
        {item.summary}
      </p>

      {/* Read more (placeholder link) */}
      <Link
        href="/news"
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-70 transition-opacity group-hover:opacity-100"
      >
        Read more
        <ArrowUpRight
          size={13}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    </MotionCard>
  );
}

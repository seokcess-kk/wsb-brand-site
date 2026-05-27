import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RevealOnView } from "@/components/motion/reveal-on-view";

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
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-6 bg-primary" />
              <p className="mono-label text-primary">{t("sectionTag")}</p>
            </div>
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/50">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <RevealOnView delay={0.1}>
            <h2
              id="news-heading"
              className="whitespace-pre-line font-sans font-bold leading-[1.15] tracking-tight text-structural"
              style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
            >
              {t("heading")}
            </h2>
          </RevealOnView>
          <RevealOnView delay={0.2}>
            <div className="space-y-5">
              <p className="max-w-2xl text-base leading-relaxed text-structural/75">
                {t("lede")}
              </p>
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
        <div className="mt-16 grid items-stretch gap-px bg-structural/10 lg:grid-cols-3">
          {items.map((item, i) => (
            <RevealOnView
              key={item.title}
              delay={0.12 + i * 0.08}
              className="h-full"
            >
              <NewsCard item={item} />
            </RevealOnView>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsCard({ item }: { item: Item }) {
  return (
    <article className="group relative flex h-full flex-col gap-5 bg-canvas p-8 md:p-10 transition-colors hover:bg-primary/[0.02]">
      {/* Photo placeholder block */}
      <div className="relative aspect-[16/9] overflow-hidden bg-structural/[0.04]">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="mono-label text-[10px] text-structural/35">
            PLACEHOLDER · THUMBNAIL
          </p>
        </div>
        {/* Corner ticks for the brand frame feel */}
        <span aria-hidden className="absolute top-2 left-2 h-2 w-2 border-l border-t border-structural/20" />
        <span aria-hidden className="absolute top-2 right-2 h-2 w-2 border-r border-t border-structural/20" />
        <span aria-hidden className="absolute bottom-2 left-2 h-2 w-2 border-l border-b border-structural/20" />
        <span aria-hidden className="absolute bottom-2 right-2 h-2 w-2 border-r border-b border-structural/20" />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4">
        <p className="mono-label text-[10px] text-structural/55">{item.date}</p>
        <span aria-hidden className="h-px w-3 bg-structural/30" />
        <p className="mono-label text-[10px] text-primary">{item.category}</p>
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
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    </article>
  );
}

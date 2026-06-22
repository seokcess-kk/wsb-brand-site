import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { listRecentPublished } from "@/lib/news-query";
import type { NewsPost } from "@/db/schema";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";
import { MotionCard } from "@/components/motion/motion-card";
import { NewsThumbnail } from "@/components/sections/news-thumbnail";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";
import { truncateSummary } from "@/lib/truncate";
import { formatKstYearMonth } from "@/lib/datetime";

type Item = {
  date: string;
  category: string;
  title: string;
  summary: string;
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
};

/** Map a published post to the teaser card shape for the active locale. */
function toItem(post: NewsPost, locale: string): Item {
  const date = formatKstYearMonth(post.publishedAt ?? post.createdAt);
  const en = locale === "en";
  return {
    date,
    category: post.category,
    title: (en && post.titleEn) || post.titleKo,
    summary: (en && post.summaryEn) || post.summaryKo,
    thumbnailUrl: post.thumbnailUrl,
    externalUrl: post.externalUrl,
  };
}

export async function NewsSection() {
  const t = await getTranslations("home.news");
  const locale = await getLocale();

  // Share the published-news source with the /news page. When the DB has no
  // published posts (or is not configured, as in local dev), fall back to the
  // curated placeholder items so the section never renders empty. The home page
  // is revalidated on news changes via revalidatePath("/", "layout").
  const posts = await listRecentPublished(3);
  const items: Item[] =
    posts.length > 0
      ? posts.map((p) => toItem(p, locale))
      : (t.raw("items") as Item[]);

  return (
    <section
      aria-labelledby="news-heading"
      className="relative isolate bg-canvas"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow number={7} total={8} tag={t("sectionTag")} />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/65">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <h2
            id="news-heading"
            className="font-sans font-bold leading-[1.25] tracking-[-0.015em] text-structural"
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
  const { text: summaryText, truncated } = truncateSummary(item.summary);
  const moreClass =
    "whitespace-nowrap font-medium text-primary transition-opacity hover:opacity-80";

  return (
    <MotionCard
      as="article"
      className="flex h-full flex-col gap-5 p-8 md:p-10"
    >
      <NewsThumbnail
        src={item.thumbnailUrl}
        category={item.category}
        date={item.date}
      />

      {/* Meta row */}
      <div className="flex items-center gap-4">
        <p className="mono-label text-[11px] tabular-nums text-structural/65">{item.date}</p>
        <span aria-hidden className="h-px w-3 bg-structural/30" />
        <p className="mono-label text-[11px] text-primary">{item.category}</p>
      </div>

      {/* Title */}
      <h3 className="font-sans text-lg font-bold tracking-tight text-structural">
        {item.title}
      </h3>

      {/* Summary, clamped with a "… 더보기" cue when it runs long. */}
      <p className="text-base leading-[1.6] text-structural/70">
        {summaryText}
        {truncated &&
          (item.externalUrl ? (
            <>
              {" "}
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={moreClass}
              >
                … 더보기
              </a>
            </>
          ) : (
            <>
              {" "}
              <Link href="/news" className={moreClass}>
                … 더보기
              </Link>
            </>
          ))}
      </p>

      {/* Persistent CTA when the summary fits and has no inline 더보기 cue. */}
      {!truncated &&
        (item.externalUrl ? (
          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary opacity-70 transition-opacity group-hover:opacity-100"
          >
            Read more
            <ArrowUpRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        ) : (
          <Link
            href="/news"
            className="mt-auto inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary opacity-70 transition-opacity group-hover:opacity-100"
          >
            Read more
            <ArrowUpRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        ))}
    </MotionCard>
  );
}

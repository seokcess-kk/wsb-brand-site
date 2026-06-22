"use client";

import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";
import { MotionCard } from "@/components/motion/motion-card";
import { NewsThumbnail } from "@/components/sections/news-thumbnail";
import { TabFilter, type TabItem } from "@/components/motion/tab-filter";
import { truncateSummary } from "@/lib/truncate";
import { formatKstDate } from "@/lib/datetime";
import { Link } from "@/i18n/navigation";
import type { NewsPost } from "@/db/schema";

const ALL = "__all__";

type Props = {
  posts: NewsPost[];
  locale: string;
  viewDetail: string;
  allLabel: string;
};

/**
 * Client wrapper that adds a category TabFilter above the news card grid.
 * Categories are derived from the post list; switching tab remounts the
 * grid (via React key) so the fade-up stagger replays for the new selection.
 */
export function NewsListWithFilter({
  posts,
  locale,
  viewDetail,
  allLabel,
}: Props) {
  const [active, setActive] = useState<string>(ALL);

  const tabs = useMemo<TabItem[]>(() => {
    const counts = new Map<string, number>();
    for (const p of posts) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return [
      { id: ALL, label: allLabel, count: posts.length },
      ...sorted.map(([cat, n]) => ({ id: cat, label: cat, count: n })),
    ];
  }, [posts, allLabel]);

  const filtered = useMemo(
    () => (active === ALL ? posts : posts.filter((p) => p.category === active)),
    [active, posts],
  );

  return (
    <div className="flex flex-col gap-10">
      <TabFilter items={tabs} value={active} onChange={setActive} />
      <FadeInSection
        key={active}
        className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3"
        staggerChildren={0.06}
      >
        {filtered.map((p) => (
          <FadeInItem key={p.id} className="h-full">
            <NewsCard post={p} locale={locale} viewDetail={viewDetail} />
          </FadeInItem>
        ))}
      </FadeInSection>
    </div>
  );
}

function NewsCard({
  post,
  locale,
  viewDetail,
}: {
  post: NewsPost;
  locale: string;
  viewDetail: string;
}) {
  const isKo = locale === "ko";
  const title = isKo ? post.titleKo : post.titleEn || post.titleKo;
  const summarySource = isKo ? post.summaryKo : post.summaryEn || post.summaryKo;
  const { text: summary, truncated } = truncateSummary(summarySource);

  return (
    <MotionCard
      as="article"
      className="flex h-full flex-col gap-5 p-8 md:p-10"
    >
      {/* Stretched link: the whole card opens the detail page. */}
      <Link
        href={`/news/${post.slug}`}
        aria-label={title}
        className="absolute inset-0 z-10"
      />

      <NewsThumbnail src={post.thumbnailUrl} category={post.category} />

      <div className="flex items-center gap-4">
        <p className="mono-label text-[10px] text-structural/65">
          {post.publishedAt ? formatKstDate(post.publishedAt) : "—"}
        </p>
        <span aria-hidden className="h-px w-3 bg-structural/30" />
        <p className="mono-label text-[10px] text-primary">{post.category}</p>
      </div>

      <h3 className="font-sans text-lg font-bold tracking-tight text-structural transition-colors group-hover:text-primary">
        {title}
      </h3>

      <p className="text-sm leading-[1.6] text-structural/70">
        {summary}
        {truncated && "…"}
      </p>

      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-70 transition-opacity group-hover:opacity-100">
        {viewDetail}
        <ArrowUpRight
          size={13}
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </MotionCard>
  );
}

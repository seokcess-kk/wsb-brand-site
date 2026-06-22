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
import type { NewsPost } from "@/db/schema";

const ALL = "__all__";

type Props = {
  posts: NewsPost[];
  locale: string;
  readMore: string;
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
  readMore,
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
            <NewsCard post={p} locale={locale} readMore={readMore} />
          </FadeInItem>
        ))}
      </FadeInSection>
    </div>
  );
}

function NewsCard({
  post,
  locale,
  readMore,
}: {
  post: NewsPost;
  locale: string;
  readMore: string;
}) {
  const isKo = locale === "ko";
  const title = isKo ? post.titleKo : post.titleEn || post.titleKo;
  const summary = isKo ? post.summaryKo : post.summaryEn || post.summaryKo;

  return (
    <MotionCard
      as="article"
      className="flex h-full flex-col gap-5 p-8 md:p-10"
    >
      <NewsThumbnail src={post.thumbnailUrl} category={post.category} />

      <div className="flex items-center gap-4">
        <p className="mono-label text-[10px] text-structural/65">
          {post.publishedAt
            ? new Date(post.publishedAt).toISOString().slice(0, 10)
            : "—"}
        </p>
        <span aria-hidden className="h-px w-3 bg-structural/30" />
        <p className="mono-label text-[10px] text-primary">{post.category}</p>
      </div>

      <h3 className="font-sans text-lg font-bold tracking-tight text-structural">
        {title}
      </h3>

      <p className="text-sm leading-[1.6] text-structural/70">{summary}</p>

      {post.externalUrl ? (
        <a
          href={post.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-70 transition-opacity group-hover:opacity-100"
        >
          {readMore}
          <ArrowUpRight
            size={13}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      ) : null}
    </MotionCard>
  );
}

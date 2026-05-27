import { getTranslations, setRequestLocale } from "next-intl/server";
import { desc, eq } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { db, isDbConfigured, schema } from "@/db/client";
import type { NewsPost } from "@/db/schema";

export const dynamic = "force-dynamic";

async function listPublished(): Promise<NewsPost[]> {
  if (!isDbConfigured()) return [];
  return db()
    .select()
    .from(schema.newsPosts)
    .where(eq(schema.newsPosts.isPublished, true))
    .orderBy(desc(schema.newsPosts.publishedAt));
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.news");
  const posts = await listPublished();

  return (
    <>
      <PageHero
        tag={t("hero.tag")}
        meta={`${t("hero.meta")} · ${posts.length}`}
        title={t("hero.title")}
        lede={t("hero.lede")}
      />

      <section className="bg-canvas">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <p className="mono-label text-structural/45">EMPTY</p>
              <p className="text-sm text-structural/55">{t("empty")}</p>
            </div>
          ) : (
            <div className="grid items-stretch gap-px bg-structural/10 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <RevealOnView
                  key={p.id}
                  delay={0.06 * (i % 6)}
                  className="h-full"
                >
                  <NewsCard post={p} locale={locale} readMore={t("readMore")} />
                </RevealOnView>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
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
    <article className="group relative flex h-full flex-col gap-5 bg-canvas p-8 md:p-10 transition-colors hover:bg-primary/[0.02]">
      <div className="relative aspect-[16/9] overflow-hidden bg-structural/[0.04]">
        {post.thumbnailUrl ? (
          // Next/Image not used here to keep things simple for arbitrary URLs
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="mono-label text-[10px] text-structural/35">
              PLACEHOLDER · THUMBNAIL
            </p>
          </div>
        )}
        <span aria-hidden className="absolute top-2 left-2 h-2 w-2 border-l border-t border-structural/20" />
        <span aria-hidden className="absolute top-2 right-2 h-2 w-2 border-r border-t border-structural/20" />
        <span aria-hidden className="absolute bottom-2 left-2 h-2 w-2 border-l border-b border-structural/20" />
        <span aria-hidden className="absolute bottom-2 right-2 h-2 w-2 border-r border-b border-structural/20" />
      </div>

      <div className="flex items-center gap-4">
        <p className="mono-label text-[10px] text-structural/55">
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

      <p className="text-sm leading-relaxed text-structural/70">{summary}</p>

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
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      ) : null}
    </article>
  );
}

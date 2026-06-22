import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata } from "@/lib/page-metadata";
import { getPublishedNewsBySlug } from "@/lib/news-query";
import { formatKstDate } from "@/lib/datetime";
import type { NewsPost } from "@/db/schema";

export const dynamic = "force-dynamic";

/** Pick the locale-appropriate fields, falling back to Korean. */
function localize(post: NewsPost, locale: string) {
  const isKo = locale === "ko";
  return {
    title: isKo ? post.titleKo : post.titleEn || post.titleKo,
    summary: isKo ? post.summaryKo : post.summaryEn || post.summaryKo,
    body: (isKo ? post.bodyKo : post.bodyEn || post.bodyKo) ?? "",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPublishedNewsBySlug(slug);
  const path = `/news/${slug}`;
  if (!post) {
    return buildPageMetadata({
      locale,
      path,
      title: locale === "ko" ? "소식" : "News",
      description: "",
    });
  }
  const { title, summary } = localize(post, locale);
  return buildPageMetadata({
    locale,
    path,
    title,
    description: summary,
    image: post.thumbnailUrl,
    type: "article",
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.news");
  const post = await getPublishedNewsBySlug(slug);
  if (!post) notFound();

  const { title, summary, body } = localize(post, locale);
  const date = post.publishedAt ? formatKstDate(post.publishedAt) : null;
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="bg-canvas">
      {/* Header */}
      <div className="relative isolate overflow-hidden border-b border-structural/10">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(26,31,27,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,31,27,0.035) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-16 md:pb-14 md:pt-24">
          <Link
            href="/news"
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-structural/55 transition-colors hover:text-primary"
          >
            <ArrowLeft
              size={13}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            {t("backToList")}
          </Link>

          <div className="mt-8 flex items-center gap-3">
            <span className="mono-label text-primary">{post.category}</span>
            {date && (
              <>
                <span aria-hidden className="h-px w-3 bg-structural/30" />
                <span className="mono-label tabular-nums text-structural/55">
                  {date}
                </span>
              </>
            )}
          </div>

          <h1
            className="mt-4 font-sans font-bold leading-[1.2] tracking-[-0.01em] text-structural"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Lead image */}
      {post.thumbnailUrl && (
        <div className="mx-auto mt-10 max-w-4xl px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.thumbnailUrl}
            alt=""
            className="aspect-[16/9] w-full border border-structural/10 object-cover"
          />
        </div>
      )}

      {/* Body */}
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <p className="text-pretty-kr text-lg leading-[1.7] text-structural/85">
          {summary}
        </p>

        {paragraphs.length > 0 && (
          <div className="mt-8 space-y-5 border-t border-structural/10 pt-8">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="whitespace-pre-line text-pretty-kr text-base leading-[1.85] text-structural/80"
              >
                {para}
              </p>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-structural/10 pt-8">
          {post.externalUrl && (
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-primary px-6 py-3 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
            >
              {t("readOriginal")}
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          )}
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 px-2 text-sm font-medium text-structural/65 transition-colors hover:text-primary"
          >
            <ArrowLeft size={14} />
            {t("backToList")}
          </Link>
        </div>
      </div>
    </article>
  );
}

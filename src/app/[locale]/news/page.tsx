import { getTranslations, setRequestLocale } from "next-intl/server";
import { desc, eq } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { Link } from "@/i18n/navigation";
import { db, isDbConfigured, schema } from "@/db/client";
import type { NewsPost } from "@/db/schema";
import { NewsListWithFilter } from "./news-list-with-filter";

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
  const tCta = await getTranslations("cta");
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
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
          {posts.length === 0 ? (
            // Branded "instrument panel" empty state: a framed well with the
            // site's grid + corner-bracket motif and a partnership CTA, so the
            // pre-launch state reads as intentional rather than a blank void.
            <div className="relative overflow-hidden border border-structural/12 bg-structural/[0.02] px-8 py-16 md:py-20">
              <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
              <span aria-hidden className="absolute top-3 left-3 h-3 w-3 border-l border-t border-structural/20" />
              <span aria-hidden className="absolute top-3 right-3 h-3 w-3 border-r border-t border-structural/20" />
              <span aria-hidden className="absolute bottom-3 left-3 h-3 w-3 border-l border-b border-structural/20" />
              <span aria-hidden className="absolute bottom-3 right-3 h-3 w-3 border-r border-b border-structural/20" />

              <div className="relative flex flex-col items-center gap-5 text-center">
                <div className="relative">
                  <span aria-hidden className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                  <span aria-hidden className="relative block h-2.5 w-2.5 rounded-full bg-primary" />
                </div>
                <p className="mono-label text-primary">{t("hero.meta")} · 0</p>
                <p className="max-w-md text-sm leading-relaxed text-structural/60">
                  {t("empty")}
                </p>
                <Link
                  href="/contact"
                  className="group mt-2 inline-flex items-center gap-2 border border-structural/20 px-5 py-3 text-sm font-medium text-structural transition-colors hover:border-primary hover:text-primary"
                >
                  {tCta("partnership")}
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </div>
          ) : (
            <NewsListWithFilter
              posts={posts}
              locale={locale}
              readMore={t("readMore")}
              allLabel={t("filterAll")}
            />
          )}
        </div>
      </section>
    </>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { desc, eq } from "drizzle-orm";
import { PageHero } from "@/components/layout/page-hero";
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

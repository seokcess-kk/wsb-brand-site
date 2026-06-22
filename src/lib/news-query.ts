import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/db/client";
import type { NewsPost } from "@/db/schema";

export async function listNews(opts: {
  q?: string;
  category?: string;
}): Promise<NewsPost[]> {
  if (!isDbConfigured()) return [];

  const conditions = [];
  if (opts.q && opts.q.trim()) {
    const like = `%${opts.q.trim()}%`;
    conditions.push(
      or(
        ilike(schema.newsPosts.titleKo, like),
        ilike(schema.newsPosts.titleEn, like),
        ilike(schema.newsPosts.slug, like),
      ),
    );
  }
  if (opts.category && opts.category.trim()) {
    conditions.push(eq(schema.newsPosts.category, opts.category.trim()));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  try {
    return await db()
      .select()
      .from(schema.newsPosts)
      .where(where)
      .orderBy(desc(schema.newsPosts.createdAt));
  } catch (err) {
    console.error("[news-query] listNews failed", err);
    return [];
  }
}

/**
 * Most recent published posts, newest first, for the public site (home teaser
 * and the news list share this source). Returns [] when the DB is not
 * configured so callers can fall back to placeholder copy.
 */
export async function listRecentPublished(limit?: number): Promise<NewsPost[]> {
  if (!isDbConfigured()) return [];
  try {
    const base = db()
      .select()
      .from(schema.newsPosts)
      .where(eq(schema.newsPosts.isPublished, true))
      .orderBy(desc(schema.newsPosts.publishedAt));
    return await (limit ? base.limit(limit) : base);
  } catch (err) {
    console.error("[news-query] listRecentPublished failed", err);
    return [];
  }
}

/** A single published post by slug, for the public detail page. Null if missing or unpublished. */
export async function getPublishedNewsBySlug(
  slug: string,
): Promise<NewsPost | null> {
  if (!isDbConfigured()) return null;
  try {
    const [row] = await db()
      .select()
      .from(schema.newsPosts)
      .where(
        and(
          eq(schema.newsPosts.slug, slug),
          eq(schema.newsPosts.isPublished, true),
        ),
      )
      .limit(1);
    return row ?? null;
  } catch (err) {
    console.error("[news-query] getPublishedNewsBySlug failed", err);
    return null;
  }
}

export async function listNewsCategories(): Promise<string[]> {
  if (!isDbConfigured()) return [];
  try {
    const rows = await db()
      .selectDistinct({ category: schema.newsPosts.category })
      .from(schema.newsPosts);
    return rows.map((r) => r.category).filter(Boolean).sort();
  } catch (err) {
    console.error("[news-query] listNewsCategories failed", err);
    return [];
  }
}

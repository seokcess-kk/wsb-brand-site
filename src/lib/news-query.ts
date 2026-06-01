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
      or(ilike(schema.newsPosts.titleKo, like), ilike(schema.newsPosts.slug, like)),
    );
  }
  if (opts.category && opts.category.trim()) {
    conditions.push(eq(schema.newsPosts.category, opts.category.trim()));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  return db()
    .select()
    .from(schema.newsPosts)
    .where(where)
    .orderBy(desc(schema.newsPosts.createdAt));
}

export async function listNewsCategories(): Promise<string[]> {
  if (!isDbConfigured()) return [];
  const rows = await db()
    .selectDistinct({ category: schema.newsPosts.category })
    .from(schema.newsPosts);
  return rows.map((r) => r.category).filter(Boolean).sort();
}

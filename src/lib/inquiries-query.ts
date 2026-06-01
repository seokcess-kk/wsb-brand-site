import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/db/client";
import type { Inquiry } from "@/db/schema";
import { isInquiryStatus } from "@/lib/inquiry-status";

export const INQUIRIES_PAGE_SIZE = 50;

export type InquiryListResult = {
  rows: Inquiry[];
  total: number;
  page: number;
  totalPages: number;
};

export async function listInquiries(opts: {
  status?: string;
  q?: string;
  page?: number;
}): Promise<InquiryListResult> {
  if (!isDbConfigured()) {
    return { rows: [], total: 0, page: 1, totalPages: 1 };
  }

  const page = Math.max(1, Math.floor(opts.page ?? 1));
  const conditions = [];

  if (opts.status && isInquiryStatus(opts.status)) {
    conditions.push(eq(schema.inquiries.status, opts.status));
  }
  if (opts.q && opts.q.trim()) {
    const like = `%${opts.q.trim()}%`;
    conditions.push(
      or(
        ilike(schema.inquiries.company, like),
        ilike(schema.inquiries.name, like),
        ilike(schema.inquiries.email, like),
      ),
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [{ value }] = await db()
    .select({ value: count() })
    .from(schema.inquiries)
    .where(where);
  const total = Number(value);

  const rows = await db()
    .select()
    .from(schema.inquiries)
    .where(where)
    .orderBy(desc(schema.inquiries.createdAt))
    .limit(INQUIRIES_PAGE_SIZE)
    .offset((page - 1) * INQUIRIES_PAGE_SIZE);

  return {
    rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / INQUIRIES_PAGE_SIZE)),
  };
}

export async function listRecentInquiries(limit = 5): Promise<Inquiry[]> {
  if (!isDbConfigured()) return [];
  return db()
    .select()
    .from(schema.inquiries)
    .orderBy(desc(schema.inquiries.createdAt))
    .limit(limit);
}

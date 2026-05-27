import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Partnership inquiries submitted via the Contact form.
 * Stored for admin review and CSV export. The notification email is sent
 * separately via Resend and not persisted here.
 */
export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    company: varchar("company", { length: 200 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    country: varchar("country", { length: 100 }),
    category: varchar("category", { length: 50 }).notNull(),
    message: text("message").notNull(),
    locale: varchar("locale", { length: 8 }).notNull().default("ko"),
    status: varchar("status", { length: 20 }).notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index("inquiries_created_at_idx").on(table.createdAt),
    index("inquiries_status_idx").on(table.status),
  ],
);

/**
 * News posts. Each post can have separate ko/en content.
 * Slug is unique. Published posts are visible on the public site.
 */
export const newsPosts = pgTable(
  "news_posts",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    category: varchar("category", { length: 50 }).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    isPublished: boolean("is_published").notNull().default(false),
    thumbnailUrl: text("thumbnail_url"),
    externalUrl: text("external_url"),
    // Korean content
    titleKo: varchar("title_ko", { length: 300 }).notNull(),
    summaryKo: text("summary_ko").notNull(),
    bodyKo: text("body_ko"),
    // English content
    titleEn: varchar("title_en", { length: 300 }),
    summaryEn: text("summary_en"),
    bodyEn: text("body_en"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index("news_posts_published_at_idx").on(table.publishedAt),
    index("news_posts_is_published_idx").on(table.isPublished),
  ],
);

/**
 * Admin-editable site settings. Single-row table with key/value pairs.
 * Includes notification email recipients for the inquiry form.
 */
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Uploaded files (company intro PDF, certificates, news thumbnails).
 * Actual files live in Vercel Blob. This table tracks metadata.
 */
export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 50 }).notNull(), // pdf_company_intro | cert | news_thumbnail | other
  url: text("url").notNull(),
  pathname: text("pathname").notNull(),
  filename: varchar("filename", { length: 300 }).notNull(),
  contentType: varchar("content_type", { length: 100 }),
  sizeBytes: serial("size_bytes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
export type NewsPost = typeof newsPosts.$inferSelect;
export type NewNewsPost = typeof newsPosts.$inferInsert;

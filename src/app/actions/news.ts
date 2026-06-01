"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { db, isDbConfigured, schema } from "@/db/client";

const NewsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "lowercase letters, digits and hyphens only"),
  category: z.string().trim().min(1).max(50),
  titleKo: z.string().trim().min(1).max(300),
  summaryKo: z.string().trim().min(1),
  bodyKo: z.string().optional().or(z.literal("")),
  titleEn: z.string().optional().or(z.literal("")),
  summaryEn: z.string().optional().or(z.literal("")),
  bodyEn: z.string().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  externalUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .optional()
    .transform((v) => Boolean(v)),
  publishedAt: z.string().optional().or(z.literal("")),
});

export type NewsFormState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};


export async function createOrUpdateNews(
  id: number | null,
  _prev: NewsFormState,
  formData: FormData,
): Promise<NewsFormState> {
  await requireAdmin();
  if (!isDbConfigured()) {
    return { status: "error", message: "DATABASE_URL이 설정되지 않았습니다." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = NewsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "입력 항목을 다시 확인해 주세요.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  const values = {
    slug: data.slug,
    category: data.category,
    titleKo: data.titleKo,
    summaryKo: data.summaryKo,
    bodyKo: data.bodyKo || null,
    titleEn: data.titleEn || null,
    summaryEn: data.summaryEn || null,
    bodyEn: data.bodyEn || null,
    thumbnailUrl: data.thumbnailUrl || null,
    externalUrl: data.externalUrl || null,
    isPublished: data.isPublished,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    updatedAt: sql`now()`,
  };

  try {
    if (id) {
      await db()
        .update(schema.newsPosts)
        .set(values)
        .where(eq(schema.newsPosts.id, id));
    } else {
      await db().insert(schema.newsPosts).values(values);
    }
  } catch (err) {
    console.error("[news] save failed", err);
    return {
      status: "error",
      message: "저장에 실패했습니다. slug가 중복되었을 수 있습니다.",
    };
  }

  revalidatePath("/admin/news");
  revalidatePath("/", "layout");
  redirect("/admin/news");
}

export async function deleteNews(id: number) {
  await requireAdmin();
  if (!isDbConfigured()) return;
  await db().delete(schema.newsPosts).where(eq(schema.newsPosts.id, id));
  revalidatePath("/admin/news");
  revalidatePath("/", "layout");
}

/** Admin-only: flip a post's published flag from the list view. */
export async function toggleNewsPublished(id: number, next: boolean) {
  await requireAdmin();
  if (!isDbConfigured()) return;
  try {
    await db()
      .update(schema.newsPosts)
      .set({ isPublished: next, updatedAt: sql`now()` })
      .where(eq(schema.newsPosts.id, id));
  } catch (err) {
    console.error("[news] toggle publish failed", err);
    return;
  }
  revalidatePath("/admin/news");
  revalidatePath("/", "layout");
}

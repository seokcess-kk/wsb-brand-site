"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { db, isDbConfigured, schema } from "@/db/client";
import { decodeHtml, parseHtmlMetadata, suggestSlug } from "@/lib/url-metadata";
import { assertUrlAllowed } from "@/lib/url-safety";
import { kstDatetimeLocalToDate } from "@/lib/datetime";

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


// ---------------------------------------------------------------------------
// URL auto-fill: paste a published article URL, scrape its Open Graph / JSON-LD
// metadata, and pre-fill the form so the admin only reviews instead of retypes.
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 2_000_000;
const MAX_REDIRECTS = 5;

export type NewsMetadataData = {
  titleKo: string;
  summaryKo: string;
  thumbnailUrl: string;
  externalUrl: string;
  publishedAt: string;
  siteName: string;
  slug: string;
  category: string;
};

export type NewsMetadataResult =
  | { ok: true; data: NewsMetadataData; filled: string[] }
  | { ok: false; error: string };

/** Read a response body up to `max` bytes, cancelling the stream once the cap is hit. */
async function readCapped(res: Response, max: number): Promise<Uint8Array> {
  const reader = res.body?.getReader();
  if (!reader) {
    const buf = new Uint8Array(await res.arrayBuffer());
    return buf.byteLength > max ? buf.subarray(0, max) : buf;
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.byteLength;
      if (total >= max) {
        await reader.cancel().catch(() => {});
        break;
      }
    }
  }
  const out = new Uint8Array(Math.min(total, max));
  let offset = 0;
  for (const chunk of chunks) {
    if (offset >= out.length) break;
    const slice = chunk.subarray(0, out.length - offset);
    out.set(slice, offset);
    offset += slice.byteLength;
  }
  return out;
}

const FetchUrlSchema = z.string().trim().url();

export async function fetchNewsMetadata(
  rawUrl: string,
): Promise<NewsMetadataResult> {
  await requireAdmin();

  const validated = FetchUrlSchema.safeParse(rawUrl);
  if (!validated.success) {
    return { ok: false, error: "올바른 URL을 입력해 주세요." };
  }

  // One AbortController bounds total wall-clock time across all redirect hops.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    let current = validated.data;
    let res: Response | null = null;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      // Re-validate every hop (scheme + DNS-resolved IP) so a redirect cannot
      // smuggle us onto an internal host.
      const allowed = await assertUrlAllowed(current);
      if (!allowed.ok) return { ok: false, error: allowed.reason };

      let hopRes: Response;
      try {
        hopRes = await fetch(allowed.url, {
          redirect: "manual",
          signal: controller.signal,
          headers: {
            "user-agent":
              "Mozilla/5.0 (compatible; WooriSmartBioBot/1.0; +https://woorismartbio.com)",
            accept: "text/html,application/xhtml+xml,text/plain",
          },
        });
      } catch (err) {
        console.error("[news] metadata fetch failed", err);
        return {
          ok: false,
          error: "페이지를 불러오지 못했습니다. 주소를 확인해 주세요.",
        };
      }

      const location = hopRes.headers.get("location");
      if (hopRes.status >= 300 && hopRes.status < 400 && location) {
        await hopRes.body?.cancel().catch(() => {});
        let next: URL;
        try {
          next = new URL(location, allowed.url);
        } catch {
          return { ok: false, error: "잘못된 리다이렉트 주소입니다." };
        }
        current = next.toString();
        continue;
      }

      res = hopRes;
      break;
    }

    if (!res) {
      return { ok: false, error: "리다이렉트가 너무 많습니다." };
    }
    if (!res.ok) {
      return { ok: false, error: `페이지 응답 오류입니다 (HTTP ${res.status}).` };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (
      contentType &&
      !/text\/html|application\/xhtml|text\/plain/i.test(contentType)
    ) {
      await res.body?.cancel().catch(() => {});
      return { ok: false, error: "HTML 페이지가 아니어서 읽을 수 없습니다." };
    }

    const declaredLength = Number(res.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_HTML_BYTES * 8) {
      await res.body?.cancel().catch(() => {});
      return { ok: false, error: "페이지가 너무 큽니다." };
    }

    const bytes = await readCapped(res, MAX_HTML_BYTES);
    const finalUrl = res.url || current;
    const html = decodeHtml(bytes, contentType);
    const meta = parseHtmlMetadata(html, finalUrl);

    const data: NewsMetadataData = {
      titleKo: meta.title ?? "",
      summaryKo: meta.description ?? "",
      thumbnailUrl: meta.image ?? "",
      externalUrl: finalUrl,
      publishedAt: meta.publishedTime ?? "",
      siteName: meta.siteName ?? "",
      slug: suggestSlug(finalUrl),
      category: meta.section ?? "",
    };

    const filled: string[] = [];
    if (data.titleKo) filled.push("titleKo");
    if (data.summaryKo) filled.push("summaryKo");
    if (data.thumbnailUrl) filled.push("thumbnailUrl");
    if (data.publishedAt) filled.push("publishedAt");
    if (data.slug) filled.push("slug");
    if (data.category) filled.push("category");

    return { ok: true, data, filled };
  } finally {
    clearTimeout(timer);
  }
}

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
    publishedAt: data.publishedAt
      ? kstDatetimeLocalToDate(data.publishedAt)
      : null,
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
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid news id");
  if (!isDbConfigured()) return;
  try {
    await db()
      .update(schema.newsPosts)
      .set({ isPublished: next, updatedAt: sql`now()` })
      .where(eq(schema.newsPosts.id, id));
  } catch (err) {
    console.error("[news] toggle publish failed", err);
    throw new Error("발행 상태 변경에 실패했습니다.");
  }
  revalidatePath("/admin/news");
  revalidatePath("/", "layout");
}

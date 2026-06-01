import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { NewsFilters } from "@/components/admin/news-filters";
import { NewsPublishToggle } from "@/components/admin/news-publish-toggle";
import { listNews, listNewsCategories } from "@/lib/news-query";
import { isDbConfigured } from "@/db/client";

export const dynamic = "force-dynamic";

export default async function NewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const category = sp.category ?? "";

  const [rows, categories] = await Promise.all([
    listNews({ q, category }),
    listNewsCategories(),
  ]);

  return (
    <div className="px-10 py-10 space-y-8">
      <AdminHeader
        tag="NEWS POSTS"
        title="보도자료"
        meta={`01 / ${rows.length} POSTS`}
        action={
          <Link
            href="/admin/news/new"
            className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm text-canvas transition-opacity hover:opacity-90"
          >
            <Plus size={14} />
            새 글
          </Link>
        }
      />

      {!isDbConfigured() && (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          DATABASE_URL이 비어있어 News를 표시할 수 없습니다.
        </div>
      )}

      <NewsFilters categories={categories} category={category} q={q} />

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-structural/55">
          조건에 맞는 News가 없습니다.
        </p>
      ) : (
        <div className="overflow-hidden border border-structural/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-structural/[0.04] text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/55">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Title (KO)</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Preview</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-structural/10 transition-colors hover:bg-primary/[0.03]"
                >
                  <td className="px-4 py-4 font-mono text-xs text-structural/65">
                    {r.publishedAt
                      ? new Date(r.publishedAt).toISOString().slice(0, 10)
                      : "—"}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-structural/65">
                    {r.slug}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/news/${r.id}`}
                      className="font-medium text-structural hover:text-primary"
                    >
                      {r.titleKo}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-structural/65">{r.category}</td>
                  <td className="px-4 py-4">
                    <NewsPublishToggle id={r.id} isPublished={r.isPublished} />
                  </td>
                  <td className="px-4 py-4">
                    {r.isPublished ? (
                      <a
                        href="/news"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:opacity-80"
                      >
                        <ExternalLink size={12} />
                        보기
                      </a>
                    ) : (
                      <span className="text-xs text-structural/35">발행 후</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

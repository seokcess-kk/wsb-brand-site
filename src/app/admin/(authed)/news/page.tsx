import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db, isDbConfigured, schema } from "@/db/client";
import { AdminHeader } from "@/components/admin/admin-header";

export const dynamic = "force-dynamic";

async function listNews() {
  if (!isDbConfigured()) return [];
  return db()
    .select()
    .from(schema.newsPosts)
    .orderBy(desc(schema.newsPosts.createdAt));
}

export default async function NewsListPage() {
  const rows = await listNews();

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

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-structural/55">
          아직 등록된 News가 없습니다.
        </p>
      ) : (
        <div className="overflow-hidden border border-structural/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-structural/[0.04] text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/55">
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Title (KO)</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
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
                  <td className="px-4 py-4 text-structural/65">
                    {r.category}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
                        r.isPublished
                          ? "bg-primary/10 text-primary"
                          : "bg-structural/10 text-structural/55"
                      }`}
                    >
                      {r.isPublished ? "Published" : "Draft"}
                    </span>
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

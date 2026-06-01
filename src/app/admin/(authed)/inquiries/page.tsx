import Link from "next/link";
import { Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { InquiryFilters } from "@/components/admin/inquiry-filters";
import { listInquiries } from "@/lib/inquiries-query";
import { isDbConfigured } from "@/db/client";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const q = sp.q ?? "";
  const page = Number(sp.page) || 1;

  const { rows, total, totalPages } = await listInquiries({ status, q, page });

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/inquiries?${qs}` : "/admin/inquiries";
  }

  return (
    <div className="px-10 py-10 space-y-8">
      <AdminHeader
        tag="PARTNERSHIP INQUIRIES"
        title="문의 내역"
        meta={`02 / ${total} ROWS`}
        action={
          <Link
            href="/admin/inquiries/export"
            className="inline-flex items-center gap-2 border border-structural/20 px-4 py-2 text-sm text-structural transition-colors hover:border-primary hover:text-primary"
          >
            <Download size={14} />
            CSV
          </Link>
        }
      />

      {!isDbConfigured() && (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          DATABASE_URL이 비어있어 문의 내역을 표시할 수 없습니다.
        </div>
      )}

      <InquiryFilters current={status} q={q} />

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-structural/55">
          조건에 맞는 문의가 없습니다.
        </p>
      ) : (
        <>
          <div className="overflow-hidden border border-structural/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-structural/[0.04] text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/55">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Message</th>
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
                      {new Date(r.createdAt).toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-4 py-4 font-medium text-structural">
                      <Link
                        href={`/admin/inquiries/${r.id}`}
                        className="hover:text-primary"
                      >
                        {r.company}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-structural/85">{r.name}</td>
                    <td className="px-4 py-4 text-structural/85">{r.category}</td>
                    <td className="px-4 py-4 max-w-xs truncate text-structural/55" title={r.message}>
                      {r.message}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              {page <= 1 ? (
                <span className="px-3 py-1.5 text-structural/30 select-none">
                  ← 이전
                </span>
              ) : (
                <Link
                  href={pageHref(page - 1)}
                  className="px-3 py-1.5 text-structural/70 hover:text-primary"
                >
                  ← 이전
                </Link>
              )}
              <span className="font-mono text-xs text-structural/55">
                {page} / {totalPages}
              </span>
              {page >= totalPages ? (
                <span className="px-3 py-1.5 text-structural/30 select-none">
                  다음 →
                </span>
              ) : (
                <Link
                  href={pageHref(page + 1)}
                  className="px-3 py-1.5 text-structural/70 hover:text-primary"
                >
                  다음 →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

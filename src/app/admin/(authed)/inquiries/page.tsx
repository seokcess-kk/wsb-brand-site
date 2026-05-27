import Link from "next/link";
import { desc } from "drizzle-orm";
import { Download } from "lucide-react";
import { db, isDbConfigured, schema } from "@/db/client";
import { AdminHeader } from "@/components/admin/admin-header";

export const dynamic = "force-dynamic";

async function getInquiries() {
  if (!isDbConfigured()) return [];
  return db()
    .select()
    .from(schema.inquiries)
    .orderBy(desc(schema.inquiries.createdAt))
    .limit(200);
}

export default async function InquiriesPage() {
  const rows = await getInquiries();

  return (
    <div className="px-10 py-10 space-y-8">
      <AdminHeader
        tag="PARTNERSHIP INQUIRIES"
        title="문의 내역"
        meta={`02 / ${rows.length} ROWS`}
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

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-structural/55">
          아직 등록된 문의가 없습니다.
        </p>
      ) : (
        <div className="overflow-hidden border border-structural/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-structural/[0.04] text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/55">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Email</th>
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
                    {r.company}
                  </td>
                  <td className="px-4 py-4 text-structural/85">{r.name}</td>
                  <td className="px-4 py-4 text-structural/85">
                    {r.category}
                  </td>
                  <td className="px-4 py-4 text-structural/65">
                    <a
                      href={`mailto:${r.email}`}
                      className="hover:text-primary"
                    >
                      {r.email}
                    </a>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={r.status} />
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-primary/10 text-primary",
    read: "bg-structural/10 text-structural/65",
    archived: "bg-structural/5 text-structural/40",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${
        colors[status] ?? "bg-structural/10 text-structural/65"
      }`}
    >
      {status}
    </span>
  );
}

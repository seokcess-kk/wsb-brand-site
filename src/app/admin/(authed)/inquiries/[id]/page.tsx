import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, isDbConfigured, schema } from "@/db/client";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { CopyButton } from "@/components/admin/copy-button";
import { MarkRead } from "@/components/admin/mark-read";
import { InquiryActions } from "@/components/admin/inquiry-actions";
import { buildReplyMailto } from "@/lib/mailto";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  if (!isDbConfigured()) {
    return (
      <div className="px-10 py-10">
        <p className="text-sm text-structural/65">
          DATABASE_URL이 설정되지 않았습니다.
        </p>
      </div>
    );
  }

  const [row] = await db()
    .select()
    .from(schema.inquiries)
    .where(eq(schema.inquiries.id, numericId))
    .limit(1);

  if (!row) notFound();

  const mailto = buildReplyMailto({
    email: row.email,
    category: row.category,
    name: row.name,
    locale: row.locale,
  });

  return (
    <div className="px-10 py-10 space-y-10">
      {row.status === "new" && <MarkRead id={row.id} />}

      <AdminHeader
        tag="INQUIRY"
        title={row.company}
        meta={`02 / ID ${row.id}`}
        action={<StatusBadge status={row.status} />}
      />

      <InquiryActions id={row.id} status={row.status} mailto={mailto} />

      <dl className="grid gap-px border border-structural/10 bg-structural/10 sm:grid-cols-2">
        <DetailField label="NAME">{row.name}</DetailField>
        <DetailField label="EMAIL">
          <span className="flex items-center gap-3">
            <a href={`mailto:${row.email}`} className="hover:text-primary">
              {row.email}
            </a>
            <CopyButton value={row.email} />
          </span>
        </DetailField>
        <DetailField label="PHONE">{row.phone || "—"}</DetailField>
        <DetailField label="COUNTRY">{row.country || "—"}</DetailField>
        <DetailField label="CATEGORY">{row.category}</DetailField>
        <DetailField label="LOCALE">{row.locale}</DetailField>
        <DetailField label="RECEIVED">
          {new Date(row.createdAt).toISOString().slice(0, 16).replace("T", " ")}
        </DetailField>
      </dl>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-6 bg-primary" />
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
            MESSAGE
          </h2>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-structural/85">
          {row.message}
        </p>
      </section>
    </div>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-canvas p-5">
      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/45">
        {label}
      </dt>
      <dd className="mt-2 text-sm text-structural/85">{children}</dd>
    </div>
  );
}

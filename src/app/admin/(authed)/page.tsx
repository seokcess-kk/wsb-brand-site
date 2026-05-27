import Link from "next/link";
import { sql } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import { db, isDbConfigured, schema } from "@/db/client";
import { AdminHeader } from "@/components/admin/admin-header";

export const dynamic = "force-dynamic";

async function getCounts() {
  if (!isDbConfigured()) {
    return { inquiriesNew: 0, inquiriesTotal: 0, news: 0, dbReady: false };
  }
  const [inquiriesNew] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.inquiries)
    .where(sql`${schema.inquiries.status} = 'new'`);
  const [inquiriesTotal] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.inquiries);
  const [news] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.newsPosts);
  return {
    inquiriesNew: inquiriesNew?.count ?? 0,
    inquiriesTotal: inquiriesTotal?.count ?? 0,
    news: news?.count ?? 0,
    dbReady: true,
  };
}

export default async function AdminDashboard() {
  const counts = await getCounts();

  return (
    <div className="px-10 py-10 space-y-10">
      <AdminHeader
        tag="DASHBOARD"
        title="Overview"
        meta="00 / WSB ADMIN"
      />

      {!counts.dbReady && (
        <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          DATABASE_URL이 설정되지 않았습니다. <code>.env.local</code>에 추가하면 실제 데이터를 확인할 수 있습니다.
        </div>
      )}

      <dl className="grid gap-px bg-structural/10 sm:grid-cols-3">
        <StatCard
          label="NEW INQUIRIES"
          value={counts.inquiriesNew}
          href="/admin/inquiries"
          accent
        />
        <StatCard
          label="TOTAL INQUIRIES"
          value={counts.inquiriesTotal}
          href="/admin/inquiries"
        />
        <StatCard
          label="NEWS POSTS"
          value={counts.news}
          href="/admin/news"
        />
      </dl>

      <section className="space-y-4">
        <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-structural/55">
          QUICK ACTIONS
        </h2>
        <div className="grid gap-px bg-structural/10 sm:grid-cols-2">
          <QuickLink
            href="/admin/news"
            title="News 등록"
            body="신규 보도자료를 한국어와 영어로 등록합니다."
          />
          <QuickLink
            href="/admin/settings"
            title="수신 이메일 설정"
            body="Partnership Inquiry 알림 받을 이메일을 변경합니다."
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group bg-canvas p-8 transition-colors hover:bg-primary/[0.03]"
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-structural/55">
          {label}
        </p>
        <ArrowUpRight
          size={14}
          className="text-structural/30 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
      <p
        className={`mt-5 font-sans font-extrabold tracking-tight leading-none ${
          accent ? "text-primary" : "text-structural"
        }`}
        style={{ fontSize: "2.5rem" }}
      >
        {value}
      </p>
    </Link>
  );
}

function QuickLink({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-canvas p-6 transition-colors hover:bg-primary/[0.03]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-base font-semibold text-structural">
            {title}
          </p>
          <p className="mt-1 text-sm text-structural/65">{body}</p>
        </div>
        <ArrowUpRight
          size={14}
          className="mt-1 flex-none text-structural/30 transition-all group-hover:text-primary"
        />
      </div>
    </Link>
  );
}

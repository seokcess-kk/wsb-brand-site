import Link from "next/link";
import { Search } from "lucide-react";
import { INQUIRY_STATUSES } from "@/lib/inquiry-status";

const TABS = [{ key: "", label: "All" }, ...INQUIRY_STATUSES.map((s) => ({ key: s, label: s }))];

export function InquiryFilters({
  current,
  q,
}: {
  current: string;
  q: string;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <nav className="flex flex-wrap gap-1">
        {TABS.map((t) => {
          const params = new URLSearchParams();
          if (t.key) params.set("status", t.key);
          if (q) params.set("q", q);
          const href = params.toString()
            ? `/admin/inquiries?${params.toString()}`
            : "/admin/inquiries";
          const active = current === t.key;
          return (
            <Link
              key={t.key || "all"}
              href={href}
              className={`px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                active
                  ? "bg-primary text-canvas"
                  : "text-structural/60 hover:bg-primary/[0.06] hover:text-primary"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <form action="/admin/inquiries" method="get" className="flex items-center gap-2">
        {current && <input type="hidden" name="status" value={current} />}
        <div className="flex items-center border border-structural/20 px-3 py-1.5">
          <Search size={14} className="text-structural/40" />
          <input
            name="q"
            defaultValue={q}
            placeholder="회사·이름·이메일 검색"
            className="ml-2 w-48 bg-transparent text-sm text-structural placeholder:text-structural/35 focus:outline-none"
          />
        </div>
      </form>
    </div>
  );
}

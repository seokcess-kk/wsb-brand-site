import { isInquiryStatus, STATUS_META } from "@/lib/inquiry-status";

export function StatusBadge({ status }: { status: string }) {
  const meta = isInquiryStatus(status)
    ? STATUS_META[status]
    : { label: status, className: "bg-structural/10 text-structural/65" };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

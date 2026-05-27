export function AdminHeader({
  tag,
  title,
  meta,
  action,
}: {
  tag: string;
  title: string;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-structural/10 pb-8 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-6 bg-primary" />
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
            {tag}
          </p>
        </div>
        <h1
          className="font-sans font-bold tracking-tight text-structural"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
        >
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        {action}
        {meta && (
          <p className="font-mono text-[10px] tracking-[0.08em] uppercase text-structural/40">
            {meta}
          </p>
        )}
      </div>
    </header>
  );
}

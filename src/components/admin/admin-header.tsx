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
    <header className="flex flex-col gap-3 border-b border-structural/10 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="h-px w-5 bg-primary" />
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-primary">
            {tag}
          </p>
        </div>
        <h1
          className="font-sans font-bold leading-tight tracking-tight text-structural"
          style={{ fontSize: "clamp(1.25rem, 2.2vw, 1.625rem)" }}
        >
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {action}
        {meta && (
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-structural/55">
            {meta}
          </p>
        )}
      </div>
    </header>
  );
}

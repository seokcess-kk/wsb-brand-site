import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";

export type PipelineItem = {
  name: string;
  latin: string;
  api: string;
  indication: string;
  stage: number; // 0..3
};

/**
 * Pipeline table shared by the home overview (top 3) and the R&D page (all 6).
 * Non-commercial rows (stage < 3) carry an "investigational" tag and the table
 * closes with a disclaimer so research-stage indications never read as proven
 * efficacy.
 */
export function PipelineTable({
  items,
  stages,
  investigationalTag,
  disclaimer,
}: {
  items: PipelineItem[];
  stages: string[];
  investigationalTag: string;
  disclaimer?: string;
}) {
  return (
    <>
      <div className="overflow-hidden border border-structural/10">
        {/* Table header */}
        <div className="hidden grid-cols-[2fr_2fr_2fr_3fr] gap-px bg-structural/10 md:grid">
          <HeaderCell text="INDICATION" />
          <HeaderCell text="ACTIVE COMPOUND" />
          <HeaderCell text="BOTANICAL" />
          <HeaderCell text="STAGE" />
        </div>

        {/* Rows */}
        <FadeInSection
          className="grid gap-px bg-structural/10"
          staggerChildren={0.06}
        >
          {items.map((item, i) => (
            <FadeInItem key={item.name}>
              <PipelineRow
                item={item}
                stages={stages}
                investigationalTag={investigationalTag}
                tinted={i % 2 === 1}
              />
            </FadeInItem>
          ))}
        </FadeInSection>
      </div>

      {disclaimer && (
        <p className="mt-4 max-w-3xl text-xs leading-[1.6] text-structural/70">
          {disclaimer}
        </p>
      )}
    </>
  );
}

function HeaderCell({ text }: { text: string }) {
  return (
    <div className="bg-canvas px-5 py-3 mono-label text-structural/65">
      {text}
    </div>
  );
}

function PipelineRow({
  item,
  stages,
  investigationalTag,
  tinted,
}: {
  item: PipelineItem;
  stages: string[];
  investigationalTag: string;
  tinted?: boolean;
}) {
  return (
    <div className="group grid grid-cols-1 gap-px bg-structural/5 transition-colors md:grid-cols-[2fr_2fr_2fr_3fr]">
      <Cell tinted={tinted}>
        <p className="text-sm text-structural/75">{item.indication}</p>
        {item.stage < 3 && (
          <span className="mono-label mt-2 inline-block border border-structural/20 px-1.5 py-0.5 text-[9px] text-structural/55">
            {investigationalTag}
          </span>
        )}
      </Cell>
      <Cell tinted={tinted}>
        <p className="font-mono text-sm font-semibold tracking-tight text-primary">
          {item.api}
        </p>
      </Cell>
      <Cell tinted={tinted}>
        <p className="font-sans text-base font-semibold text-structural">
          {item.name}
        </p>
        <p className="mono-label text-[10px] text-structural/65 italic">
          {item.latin}
        </p>
      </Cell>
      <Cell tinted={tinted}>
        <StageBar current={item.stage} stages={stages} />
      </Cell>
    </div>
  );
}

function Cell({
  children,
  tinted,
}: {
  children: React.ReactNode;
  tinted?: boolean;
}) {
  return (
    <div
      className={`${tinted ? "bg-surface" : "bg-canvas"} px-5 py-6 transition-colors duration-300 group-hover:bg-primary/[0.03]`}
    >
      {children}
    </div>
  );
}

function StageBar({ current, stages }: { current: number; stages: string[] }) {
  // Each stage anchored at column center; track sits behind, dots on top.
  const cols = stages.length;
  return (
    <div className="space-y-3 pt-1">
      <div
        className="relative h-3"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {/* Track and fill use percentages of inner span. We inset by half a
            column so the line starts at the first dot and ends at the last. */}
        <span
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 h-px bg-structural/20"
          style={{ left: `${100 / (cols * 2)}%`, right: `${100 / (cols * 2)}%` }}
        />
        <span
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 h-px bg-primary"
          style={{
            left: `${100 / (cols * 2)}%`,
            width:
              current === 0
                ? "0%"
                : `calc(${(current / (cols - 1)) * 100}% - ${100 / cols}%)`,
          }}
        />
        {stages.map((_, i) => {
          const filled = i <= current;
          const isCurrent = i === current;
          return (
            <div key={i} className="relative flex items-center justify-center">
              <span
                aria-hidden
                className={`relative z-10 block h-3 w-3 rounded-full ${
                  filled ? "bg-primary" : "bg-canvas ring-1 ring-structural/30"
                } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
              />
            </div>
          );
        })}
      </div>
      <div
        className="grid text-center"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {stages.map((s, i) => (
          <span
            key={s}
            className={`text-[11px] font-medium truncate px-1 ${
              i <= current ? "text-primary" : "text-structural/65"
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

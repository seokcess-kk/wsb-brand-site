import { getTranslations } from "next-intl/server";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";

type Item = {
  name: string;
  latin: string;
  api: string;
  indication: string;
  stage: number; // 0..3
};

export async function PipelineSection() {
  const t = await getTranslations("home.pipeline");
  const stages = t.raw("stages") as string[];
  const items = t.raw("items") as Item[];

  return (
    <section
      aria-labelledby="pipeline-heading"
      className="relative isolate bg-canvas"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(15,81,50,0.07) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-6 bg-primary" />
              <p className="mono-label text-primary">{t("sectionTag")}</p>
            </div>
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/50">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <RevealOnView delay={0.1}>
            <h2
              id="pipeline-heading"
              className="whitespace-pre-line font-sans font-bold leading-[1.15] tracking-tight text-structural"
              style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
            >
              {t("heading")}
            </h2>
          </RevealOnView>
          <RevealOnView delay={0.2}>
            <p className="max-w-2xl text-base leading-relaxed text-structural/75">
              {t("lede")}
            </p>
          </RevealOnView>
        </div>

        {/* Pipeline table */}
        <div className="mt-16 overflow-hidden border border-structural/10">
          {/* Table header */}
          <div className="hidden grid-cols-[2fr_2fr_2fr_3fr] gap-px bg-structural/10 md:grid">
            <HeaderCell text="BOTANICAL" />
            <HeaderCell text="ACTIVE COMPOUND" />
            <HeaderCell text="INDICATION" />
            <HeaderCell text={`STAGE  ·  ${stages.join("  /  ")}`} />
          </div>

          {/* Rows */}
          <FadeInSection
            className="grid gap-px bg-structural/10"
            staggerChildren={0.06}
          >
            {items.map((item) => (
              <FadeInItem key={item.name}>
                <PipelineRow item={item} stages={stages} />
              </FadeInItem>
            ))}
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

function HeaderCell({ text }: { text: string }) {
  return (
    <div className="bg-canvas px-5 py-3 mono-label text-structural/50">
      {text}
    </div>
  );
}

function PipelineRow({ item, stages }: { item: Item; stages: string[] }) {
  return (
    <div className="group grid grid-cols-1 gap-px bg-structural/5 transition-colors md:grid-cols-[2fr_2fr_2fr_3fr]">
      <Cell>
        <p className="font-sans text-base font-semibold text-structural">
          {item.name}
        </p>
        <p className="mono-label text-[10px] text-structural/45 italic">
          {item.latin}
        </p>
      </Cell>
      <Cell>
        <p className="font-mono text-sm font-semibold tracking-tight text-primary">
          {item.api}
        </p>
      </Cell>
      <Cell>
        <p className="text-sm text-structural/75">{item.indication}</p>
      </Cell>
      <Cell>
        <StageBar current={item.stage} stages={stages} />
      </Cell>
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-canvas px-5 py-6 transition-colors duration-300 group-hover:bg-primary/[0.03]">
      {children}
    </div>
  );
}

function StageBar({
  current,
  stages,
}: {
  current: number;
  stages: string[];
}) {
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
                  filled
                    ? "bg-primary"
                    : "bg-canvas ring-1 ring-structural/30"
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
            className={`mono-label text-[9px] truncate px-1 ${
              i <= current ? "text-primary" : "text-structural/40"
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

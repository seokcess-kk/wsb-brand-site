import { getTranslations } from "next-intl/server";
import { FdaTable } from "./fda-table";
import { MatchRadial } from "@/components/visual/match-radial";

type Row = { label: string; fda: string; wsb: string };

export async function FdaSection() {
  const t = await getTranslations("home.fda");
  const rows = t.raw("rows") as Row[];

  return (
    <section
      aria-labelledby="fda-heading"
      className="relative isolate bg-structural text-canvas overflow-hidden"
    >
      {/* Grid drift on dark */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] animate-grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(250,251,249,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(250,251,249,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-6 bg-primary" />
              <p className="mono-label text-canvas/65">{t("sectionTag")}</p>
            </div>
            <h2
              id="fda-heading"
              className="max-w-3xl whitespace-pre-line font-sans font-bold leading-[1.18] tracking-tight text-canvas"
              style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
            >
              {t("heading")}
            </h2>
          </div>

          {/* Match ratio radial */}
          <div className="flex items-end gap-6 self-start md:self-end">
            <MatchRadial filled={5} total={5} label={t("matchTag")} />
            <p className="mono-label text-canvas/40 pb-2">{t("sectionMeta")}</p>
          </div>
        </div>

        <p className="max-w-3xl text-canvas leading-relaxed text-canvas/70">
          {t("lede")}
        </p>

        {/* Table is interactive — client component */}
        <FdaTable
          rows={rows}
          headerNo="NO"
          headerFda="FDA GUIDELINE"
          headerWsb="WSB SOLUTION"
        />
      </div>
    </section>
  );
}

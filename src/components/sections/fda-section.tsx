import { getTranslations } from "next-intl/server";
import { FdaTable } from "./fda-table";
import { MatchRadial } from "@/components/visual/match-radial";
import { RevealWords } from "@/components/motion/reveal-words";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import Image from "next/image";
import { Lede } from "@/components/layout/lede";

type Row = { label: string; fda: string; wsb: string };

export async function FdaSection() {
  const t = await getTranslations("home.fda");
  const rows = t.raw("rows") as Row[];

  return (
    <section
      aria-labelledby="fda-heading"
      className="relative isolate bg-structural text-canvas overflow-hidden"
    >
      {/* Closed-type cleanroom backdrop, dim and masked so the table stays
          legible while grounding the closed-type / contaminant claims. */}
      <Image
        src="/home-fda-closed-cleanroom.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover photo-grade-green opacity-[0.14] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-primary/30 mix-blend-multiply"
      />
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

      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-32">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-5">
            <SectionEyebrow number={3} total={8} tag={t("sectionTag")} inverse />
            <h2
              id="fda-heading"
              className="max-w-3xl font-sans font-bold leading-[1.25] tracking-[-0.015em] text-canvas"
              style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
            >
              <RevealWords text={t("heading")} triggerOnView />
            </h2>
          </div>

          {/* Match ratio radial */}
          <div className="flex items-end gap-6 self-start md:self-end">
            <MatchRadial
              filled={5}
              total={5}
              label={t("matchTag")}
              sublabel="ADDRESSED"
            />
            <p className="mono-label text-canvas/55 pb-2">{t("sectionMeta")}</p>
          </div>
        </div>

        <Lede text={t("lede")} inverse className="max-w-3xl" />

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

import { getTranslations } from "next-intl/server";
import { CountUp } from "@/components/motion/count-up";

const KPI_KEYS = ["saponin", "batch", "fda", "traction"] as const;

export async function KpiGridSection() {
  const t = await getTranslations("home.kpi");

  return (
    <section
      aria-labelledby="kpi-heading"
      className="relative isolate bg-structural text-canvas"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] animate-grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(250,251,249,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(250,251,249,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        <div className="mb-12 md:mb-16 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-6 bg-primary" />
              <p className="mono-label text-canvas/60">{t("sectionTag")}</p>
            </div>
            <h2
              id="kpi-heading"
              className="font-sans font-bold text-canvas leading-tight"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
            >
              {t("sectionTitle")}
            </h2>
          </div>
          <p className="mono-label text-canvas/40">{t("sectionMeta")}</p>
        </div>

        <dl className="grid gap-px bg-canvas/10 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_KEYS.map((key) => (
            <KpiCell
              key={key}
              label={t(`items.${key}.label`)}
              value={t(`items.${key}.value`)}
              caption={t(`items.${key}.caption`)}
            />
          ))}
        </dl>
      </div>
    </section>
  );
}

function KpiCell({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="group relative bg-structural p-8 transition-colors hover:bg-structural/95">
      <dt className="mono-label text-canvas/60">{label}</dt>

      <dd
        className="mt-4 font-sans font-extrabold tracking-tight text-canvas"
        style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1 }}
      >
        <CountUp value={value} />
      </dd>

      <p className="mt-5 text-sm leading-relaxed text-canvas/65 max-w-[24ch]">
        {caption}
      </p>

      <span
        aria-hidden
        className="absolute top-3 right-3 h-2 w-2 border-r border-t border-canvas/30"
      />
    </div>
  );
}

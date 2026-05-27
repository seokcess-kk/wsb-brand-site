import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { MatSection } from "@/components/sections/mat-section";
import { FdaSection } from "@/components/sections/fda-section";

export default async function TechnologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.technology");
  const stack = t.raw("stack.items") as {
    code: string;
    name: string;
    subtitle: string;
    body: string;
    metric: string;
    metricCaption: string;
  }[];
  const competition = t.raw("competition.rows") as {
    label: string;
    field: string;
    smartfarm: string;
    synthetic: string;
    wsb: string;
  }[];
  const compHeaders = t.raw("competition.headers") as {
    field: string;
    smartfarm: string;
    synthetic: string;
    wsb: string;
  };
  const layers = t.raw("moat.layers") as {
    code: string;
    name: string;
    type: string;
    body: string;
  }[];

  return (
    <>
      <PageHero
        tag={t("hero.tag")}
        meta={t("hero.meta")}
        title={t("hero.title")}
        lede={t("hero.lede")}
      />

      {/* STACK 3 cards */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12 flex items-center gap-3">
            <span aria-hidden className="h-px w-6 bg-primary" />
            <p className="mono-label text-primary">{t("stack.sectionTag")}</p>
          </div>
          <div className="grid items-stretch gap-px bg-structural/10 lg:grid-cols-3">
            {stack.map((it, i) => (
              <RevealOnView key={it.code} delay={0.08 * i} className="h-full">
                <article className="flex h-full flex-col gap-6 bg-canvas p-8 md:p-10">
                  <div className="flex items-center justify-between">
                    <p className="mono-label text-structural/55">{it.code}</p>
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-sans text-2xl font-bold tracking-tight text-structural">
                      {it.name}
                    </h3>
                    <p className="mono-label text-primary">{it.subtitle}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-structural/75 min-h-[6rem]">
                    {it.body}
                  </p>
                  <div className="mt-auto border-t border-structural/10 pt-5">
                    <p
                      className="font-sans font-extrabold tracking-tight text-primary leading-none"
                      style={{ fontSize: "2.5rem" }}
                    >
                      {it.metric}
                    </p>
                    <p className="mt-2 text-xs text-structural/55">
                      {it.metricCaption}
                    </p>
                  </div>
                </article>
              </RevealOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Reuse MAT diagram and stressor grid */}
      <MatSection />

      {/* Reuse FDA 5/5 matching table */}
      <FdaSection />

      {/* COMPETITIVE LANDSCAPE */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12 flex items-center gap-3">
            <span aria-hidden className="h-px w-6 bg-primary" />
            <p className="mono-label text-primary">
              {t("competition.sectionTag")}
            </p>
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <RevealOnView delay={0.05}>
              <h2
                className="font-sans font-bold leading-[1.18] tracking-tight text-structural"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
              >
                {t("competition.sectionTitle")}
              </h2>
            </RevealOnView>
            <RevealOnView delay={0.15}>
              <p className="max-w-xl text-base leading-relaxed text-structural/75">
                {t("competition.lede")}
              </p>
            </RevealOnView>
          </div>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[720px] border border-structural/10 text-sm">
              <thead>
                <tr className="bg-structural/[0.04] text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-structural/55">
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">{compHeaders.field}</th>
                  <th className="px-4 py-3">{compHeaders.smartfarm}</th>
                  <th className="px-4 py-3">{compHeaders.synthetic}</th>
                  <th className="px-4 py-3 bg-primary/[0.08] text-primary">
                    {compHeaders.wsb}
                  </th>
                </tr>
              </thead>
              <tbody>
                {competition.map((r) => (
                  <tr
                    key={r.label}
                    className="border-t border-structural/10 align-top"
                  >
                    <td className="px-4 py-5 mono-label text-structural/55 whitespace-nowrap">
                      {r.label}
                    </td>
                    <td className="px-4 py-5 text-structural/65">{r.field}</td>
                    <td className="px-4 py-5 text-structural/65">
                      {r.smartfarm}
                    </td>
                    <td className="px-4 py-5 text-structural/65">
                      {r.synthetic}
                    </td>
                    <td className="px-4 py-5 bg-primary/[0.04] font-medium text-primary">
                      {r.wsb}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TECHNICAL MOAT */}
      <section className="bg-structural text-canvas">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12 flex items-center gap-3">
            <span aria-hidden className="h-px w-6 bg-primary" />
            <p className="mono-label text-canvas/65">{t("moat.sectionTag")}</p>
          </div>
          <RevealOnView>
            <h2
              className="max-w-3xl font-sans font-bold leading-[1.18] tracking-tight text-canvas"
              style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
            >
              {t("moat.sectionTitle")}
            </h2>
          </RevealOnView>
          <div className="mt-12 grid gap-px bg-canvas/10 md:grid-cols-3">
            {layers.map((l, i) => (
              <RevealOnView key={l.code} delay={0.08 * i} className="h-full">
                <article className="flex h-full flex-col gap-5 bg-structural p-8 md:p-10">
                  <div className="flex items-center justify-between">
                    <p className="mono-label text-primary">{l.code}</p>
                    <p className="mono-label text-canvas/45">{l.type}</p>
                  </div>
                  <h3 className="font-sans text-xl font-bold tracking-tight text-canvas">
                    {l.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-canvas/70">
                    {l.body}
                  </p>
                </article>
              </RevealOnView>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { getTranslations } from "next-intl/server";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";

type Metric = { label: string; value: string; caption: string; pending?: boolean };
type Photo = { caption: string };

/**
 * Production & R&D scale band. Conveys facility weight (item 3 of the 2026-06
 * client feedback). Real photography and exact figures are pending, so the
 * media wells and unknown metrics render as explicit, captioned placeholders.
 * See memory/project_wsb_asset_requests.md.
 */
export async function ScaleSection() {
  const t = await getTranslations("home.scale");
  const metrics = t.raw("metrics") as Metric[];
  const photos = t.raw("photos") as Photo[];
  const pending = t("assetPending");
  const [lead, ...supporting] = photos;

  return (
    <section
      aria-labelledby="scale-heading"
      className="relative isolate bg-canvas border-t border-structural/10"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow tag={t("sectionTag")} />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-structural/50">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <h2
            id="scale-heading"
            className="font-sans font-bold leading-[1.15] tracking-tight text-structural"
            style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
          >
            <RevealWords text={t("heading")} triggerOnView />
          </h2>
          <RevealOnView delay={0.2}>
            <Lede text={t("lede")} />
          </RevealOnView>
        </div>

        {/* Scale metrics */}
        <dl className="mt-16 grid gap-px bg-structural/10 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) =>
            m.pending ? (
              <div key={m.label} className="bg-canvas p-6 md:p-7">
                <dt className="mono-label text-structural/55">{m.label}</dt>
                <dd className="mt-4 font-sans text-base font-medium leading-snug text-structural/35">
                  {m.caption}
                </dd>
              </div>
            ) : (
              <div key={m.label} className="bg-canvas p-6 md:p-7">
                <dt className="mono-label text-structural/55">{m.label}</dt>
                <dd
                  className="mt-4 font-sans font-extrabold leading-none tracking-tight text-primary"
                  style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)" }}
                >
                  {m.value}
                </dd>
                <dd className="mt-3 text-sm leading-snug text-structural/60">
                  {m.caption}
                </dd>
              </div>
            ),
          )}
        </dl>

        {/* Facility imagery — placeholders until photography arrives */}
        <FadeInSection
          className="mt-4 grid gap-4"
          delayChildren={0.1}
          staggerChildren={0.08}
        >
          {lead && (
            <FadeInItem>
              <PhotoWell caption={lead.caption} pending={pending} ratio="21 / 9" />
            </FadeInItem>
          )}
          {supporting.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {supporting.map((p) => (
                <FadeInItem key={p.caption}>
                  <PhotoWell caption={p.caption} pending={pending} ratio="4 / 3" />
                </FadeInItem>
              ))}
            </div>
          )}
        </FadeInSection>
      </div>
    </section>
  );
}

function PhotoWell({
  caption,
  pending,
  ratio,
}: {
  caption: string;
  pending: string;
  ratio: string;
}) {
  return (
    <div
      className="group relative w-full overflow-hidden bg-structural/[0.04] transition-colors duration-500 hover:bg-structural/[0.06]"
      style={{ aspectRatio: ratio }}
    >
      <div className="absolute inset-0 bg-grid opacity-70" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="mono-label text-[11px] text-primary">{pending}</p>
        <p className="mono-label text-[11px] text-structural/40 max-w-[28ch]">
          {caption}
        </p>
      </div>
      <span aria-hidden className="absolute top-2 left-2 h-3 w-3 border-l border-t border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
      <span aria-hidden className="absolute top-2 right-2 h-3 w-3 border-r border-t border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
      <span aria-hidden className="absolute bottom-2 left-2 h-3 w-3 border-l border-b border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
      <span aria-hidden className="absolute bottom-2 right-2 h-3 w-3 border-r border-b border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
    </div>
  );
}

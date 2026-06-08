import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DataOverlayPlant } from "@/components/visual/data-overlay-plant";
import { RevealWords } from "@/components/motion/reveal-words";

export async function HeroSection() {
  const t = await getTranslations("home.hero");
  const tSite = await getTranslations("site");
  const tCta = await getTranslations("cta");

  return (
    <section
      id="main"
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[90vh] items-center overflow-hidden bg-structural text-canvas"
    >
      {/* HERO BACKGROUND PHOTO — replace this block with the facility / smart-farm
          image (full-bleed, object-cover). The dark base + drifting grid stand in
          until the asset arrives. See memory/project_wsb_asset_requests.md. */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-structural">
        <div
          className="absolute inset-0 opacity-[0.10] animate-grid-drift"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(250,251,249,1) 1px, transparent 1px), linear-gradient(to bottom, rgba(250,251,249,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 mono-label text-[10px] text-canvas/30">
          {t("bgPlaceholder")}
        </p>
      </div>

      {/* Legibility overlay (also sits over the future photo so the text stays readable) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-structural via-structural/85 to-structural/40"
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          {/* LEFT */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <span aria-hidden className="inline-block h-px w-8 bg-primary" />
              <p className="mono-label text-primary">{t("tag")}</p>
            </div>

            <h1
              id="hero-heading"
              className="font-sans font-extrabold leading-[1.02] tracking-tight text-canvas"
              style={{
                fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
                letterSpacing: "-0.025em",
              }}
            >
              <span className="block whitespace-nowrap">
                <RevealWords text="Engineered by Data," />
              </span>
              <span className="block whitespace-nowrap text-canvas/90">
                <RevealWords text="Grown by Design." delay={0.45} />
              </span>
            </h1>

            <p className="max-w-xl text-base md:text-lg text-canvas/75 leading-relaxed">
              {t("subhead")}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 bg-primary px-6 py-3.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
              >
                {tCta("partnership")}
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/technology"
                className="group inline-flex items-center gap-2 border border-canvas/25 px-6 py-3.5 text-sm font-medium text-canvas transition-colors hover:border-primary hover:text-primary"
              >
                {tCta("exploreTech")}
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-canvas/15 pt-6">
              <p className="mono-label text-canvas/70">{t("batchMeta")}</p>
              <span aria-hidden className="mono-label text-canvas/30">·</span>
              <p className="mono-label text-canvas/55">{tSite("name")}</p>
              <span aria-hidden className="mono-label text-canvas/30">·</span>
              <p className="mono-label text-canvas/55">YEONCHEON · KR</p>
            </div>
          </div>

          {/* RIGHT (Data Overlay panel — reads as an instrument readout over the photo) */}
          <div className="relative">
            <DataOverlayPlant
              labels={{
                overlay1: t("overlayLabel1"),
                overlay2: t("overlayLabel2"),
                overlay3: t("overlayLabel3"),
                batchPrefix: "BATCH · WSB-2026-",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

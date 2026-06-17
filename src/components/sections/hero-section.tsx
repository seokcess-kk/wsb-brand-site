import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DataOverlayPlant } from "@/components/visual/data-overlay-plant";
import { RevealWords } from "@/components/motion/reveal-words";
import { HeroBackdrop } from "@/components/sections/hero-backdrop";

export async function HeroSection() {
  const t = await getTranslations("home.hero");
  const tSite = await getTranslations("site");
  const tCta = await getTranslations("cta");

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[90vh] items-center overflow-hidden bg-structural text-canvas"
    >
      {/* HERO BACKGROUND — authentic Yeoncheon vertical-farm corridor, graded
          and animated (cinematic drift + live telemetry) so the first screen
          reads as an overwhelming, actively observed facility (item 1+2 of the
          2026-06 client feedback). */}
      <HeroBackdrop src="/hero-farm-corridor.jpg" />

      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          {/* LEFT */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <span aria-hidden className="inline-block h-px w-8 bg-canvas/70" />
              <p className="mono-label text-canvas/90">{t("tag")}</p>
            </div>

            <h1
              id="hero-heading"
              className="font-sans font-extrabold leading-[1.02] tracking-tight text-canvas"
              style={{
                fontSize: "clamp(1.875rem, 6vw, 4.5rem)",
                letterSpacing: "-0.025em",
              }}
            >
              <span className="block whitespace-normal md:whitespace-nowrap">
                <RevealWords text="Engineered by Data," />
              </span>
              <span className="block whitespace-normal md:whitespace-nowrap text-canvas/90">
                <RevealWords text="Grown by Design." delay={0.45} />
              </span>
            </h1>

            <div className="space-y-4">
              <p className="max-w-2xl text-lg font-medium leading-relaxed text-canvas/90 md:text-xl">
                {t("definition")}
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-canvas/60 md:text-base">
                {t("subhead")}
              </p>
            </div>

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

      {/* Scroll cue: invites the reader past the atmospheric hero to the
          sections where these instrument readouts get decoded. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-6 hidden flex-col items-center gap-2 text-canvas/55 md:flex"
      >
        <span className="mono-label text-[10px]">{t("scrollCue")}</span>
        <span className="relative block h-9 w-px overflow-hidden bg-canvas/20">
          <span className="hero-scroll-dot absolute left-0 top-0 block h-3 w-px bg-canvas/80" />
        </span>
      </div>
    </section>
  );
}

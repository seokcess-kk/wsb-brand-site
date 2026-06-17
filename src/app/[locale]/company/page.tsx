import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/page-metadata";
import { PageHero } from "@/components/layout/page-hero";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import {
  FadeInItem,
  FadeInSection,
} from "@/components/motion/fade-in-section";
import { MotionCard } from "@/components/motion/motion-card";
import { CtaBand } from "@/components/sections/cta-band";
import { LocationMap } from "@/components/sections/location-map";
import { env } from "@/env";

// Yeoncheon headquarters pin. Approximate near 차옥로 149 until confirmed against
// Naver; the deep-link fallback resolves the exact address regardless of this.
const HQ_COORDS = { lat: 38.0966, lng: 127.0748 };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.company" });
  return buildPageMetadata({
    locale,
    path: "/company",
    title: locale === "ko" ? "회사 소개" : "Company",
    description: t("hero.lede"),
  });
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.company");
  const overviewItems = t.raw("overview.items") as { label: string; value: string }[];
  const credentials = t.raw("ceo.credentials") as string[];
  const members = t.raw("leadership.members") as {
    name: string;
    role: string;
    bio: string;
  }[];
  const historyItems = t.raw("history.items") as {
    year: string;
    items: string[];
  }[];

  return (
    <>
      <PageHero
        tag={t("hero.tag")}
        meta={t("hero.meta")}
        title={t("hero.title")}
        lede={t("hero.lede")}
      />

      {/* AT A GLANCE strip */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <RevealOnView>
              <SectionEyebrow tag={t("overview.sectionTag")} />
            </RevealOnView>
          </div>
          <dl className="grid gap-px bg-structural/10 sm:grid-cols-2 lg:grid-cols-4">
            {overviewItems.map((it) => (
              <div key={it.label} className="bg-canvas p-6">
                <dt className="mono-label text-structural/65">{it.label}</dt>
                <dd className="mt-3 font-sans text-xl font-bold tracking-tight text-structural tabular-nums">
                  {it.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CEO MESSAGE */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12">
            <RevealOnView>
              <SectionEyebrow tag={t("ceo.sectionTag")} />
            </RevealOnView>
          </div>

          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <h2
              className="font-sans font-bold leading-[1.2] tracking-tight text-structural"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
            >
              <RevealWords text={t("ceo.title")} triggerOnView />
            </h2>

            <div className="space-y-8">
              <RevealOnView delay={0.18}>
                <Lede text={t("ceo.body")} className="max-w-prose" />
              </RevealOnView>
              <RevealOnView delay={0.26}>
                <div className="border-t border-structural/10 pt-6 space-y-3">
                  <p className="mono-label text-structural/65">
                    {t("ceo.name").toUpperCase()} · {t("ceo.role")}
                  </p>
                  <ul className="space-y-2 text-sm text-structural/70">
                    {credentials.map((c) => (
                      <li key={c} className="flex items-start gap-2">
                        <span
                          aria-hidden
                          className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-primary/70"
                        />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealOnView>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="bg-canvas border-t border-structural/10">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12 flex items-end justify-between">
            <div className="space-y-3">
              <RevealOnView>
                <SectionEyebrow tag={t("leadership.sectionTag")} />
              </RevealOnView>
              <h2
                className="font-sans font-bold tracking-tight text-structural"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
              >
                <RevealWords text={t("leadership.sectionTitle")} triggerOnView />
              </h2>
            </div>
          </div>
          <FadeInSection
            className="grid gap-4 md:grid-cols-3"
            delayChildren={0.1}
            staggerChildren={0.08}
          >
            {members.map((m, i) => (
              <FadeInItem key={m.name} className="h-full">
                <MotionCard
                  as="article"
                  className="flex h-full flex-col gap-5 p-6 md:p-8"
                >
                  <div className="flex items-center justify-between border-b border-structural/10 pb-5">
                    <p className="mono-label text-primary">{m.role}</p>
                    <span aria-hidden className="font-mono text-[11px] tabular-nums text-primary/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-sans text-xl font-bold tracking-tight text-structural">
                    {m.name}
                  </h3>
                  <p className="text-sm leading-[1.6] text-structural/70">
                    {m.bio}
                  </p>
                </MotionCard>
              </FadeInItem>
            ))}
          </FadeInSection>
        </div>
      </section>

      {/* HISTORY */}
      <section className="bg-canvas border-t border-structural/10">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-12">
            <RevealOnView>
              <SectionEyebrow tag={t("history.sectionTag")} />
            </RevealOnView>
          </div>
          <h2
            className="mb-12 font-sans font-bold tracking-tight text-structural"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            <RevealWords text={t("history.sectionTitle")} triggerOnView />
          </h2>

          <ol className="space-y-px bg-structural/10">
            {historyItems.map((row) => (
              <li
                key={row.year}
                className="grid grid-cols-[100px_1fr] gap-6 bg-canvas px-2 py-6 md:px-6"
              >
                <p className="font-mono text-lg font-bold tracking-tight text-primary tabular-nums">
                  {row.year}
                </p>
                <ul className="space-y-2 text-sm text-structural/80">
                  {row.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-primary/70"
                      />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* VISION */}
      <section className="relative isolate bg-structural text-canvas">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <RevealOnView>
              <SectionEyebrow tag={t("vision.sectionTag")} inverse />
            </RevealOnView>
            <div className="space-y-6">
              <h2
                className="font-sans font-bold tracking-tight text-canvas"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                <RevealWords text={t("vision.title")} triggerOnView />
              </h2>
              <RevealOnView delay={0.2}>
                <Lede text={t("vision.body")} inverse className="max-w-3xl" />
              </RevealOnView>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section
        id="location"
        className="relative isolate scroll-mt-24 bg-canvas border-t border-structural/10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-10">
            <RevealOnView>
              <SectionEyebrow tag={t("location.sectionTag")} />
            </RevealOnView>
          </div>
          <div className="grid gap-px bg-structural/10 md:grid-cols-[1fr_1.4fr]">
            <div className="bg-canvas p-8 md:p-10 space-y-6">
              <InfoBlock
                label={t("location.addressLabel")}
                value={t("location.address")}
              />
              <InfoBlock
                label={t("location.telLabel")}
                value={t("location.tel")}
                href={`tel:${t("location.tel").replace(/[^+\d]/g, "")}`}
              />
              <InfoBlock
                label={t("location.emailLabel")}
                value={t("location.email")}
                href={`mailto:${t("location.email")}`}
              />
            </div>
            <LocationMap
              clientId={env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}
              lat={HQ_COORDS.lat}
              lng={HQ_COORDS.lng}
              address={t("location.address")}
              label={t("location.mapPlaceholder")}
              directionsLabel={t("location.directions")}
            />
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow={t("cta.eyebrow")}
        heading={t("cta.heading")}
        body={t("cta.body")}
        primaryLabel={t("cta.primary")}
        primaryHref="/contact?topic=investor"
        secondaryLabel={t("cta.secondary")}
        secondaryHref="/business"
      />
    </>
  );
}

function InfoBlock({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="mono-label text-structural/65">{label}</p>
      {href ? (
        <a
          href={href}
          className="block text-base text-structural hover:text-primary transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-base text-structural">{value}</p>
      )}
    </div>
  );
}

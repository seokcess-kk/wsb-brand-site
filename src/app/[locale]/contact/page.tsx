import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/page-metadata";
import { PageHero } from "@/components/layout/page-hero";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { ContactForm } from "@/components/sections/contact-form";
import { LocationMap } from "@/components/sections/location-map";

// Maps a ?topic= deep-link to the matching inquiry category by index, so a
// section CTA can land a visitor on the form with their topic preselected.
const TOPIC_INDEX: Record<string, number> = {
  material: 0,
  solution: 1,
  rnd: 2,
  investor: 3,
  brand: 4,
  media: 5,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.contact" });
  return buildPageMetadata({
    locale,
    path: "/contact",
    title: locale === "ko" ? "파트너십 문의" : "Contact",
    description: t("hero.lede"),
  });
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pages.contact");
  const tHome = await getTranslations("home.contact");
  const tForm = await getTranslations("home.contact.form");
  const categoryOptions = tForm.raw("categoryOptions") as string[];

  const { topic } = await searchParams;
  const topicIdx = typeof topic === "string" ? TOPIC_INDEX[topic] : undefined;
  const defaultCategory =
    typeof topicIdx === "number" ? categoryOptions[topicIdx] : undefined;

  return (
    <>
      <PageHero
        tag={t("hero.tag")}
        meta={t("hero.meta")}
        title={t("hero.title")}
        lede={t("hero.lede")}
      />

      <section className="bg-structural text-canvas overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid items-stretch gap-px bg-canvas/10 lg:grid-cols-[1.4fr_1fr]">
            <RevealOnView delay={0.1} className="h-full">
              <ContactForm
                defaultCategory={defaultCategory}
                labels={{
                  company: tForm("company"),
                  name: tForm("name"),
                  email: tForm("email"),
                  phone: tForm("phone"),
                  country: tForm("country"),
                  category: tForm("category"),
                  categoryOptions,
                  message: tForm("message"),
                  messagePlaceholder: tForm("messagePlaceholder"),
                  consent: tForm("consent"),
                  privacyTitle: tForm("privacyTitle"),
                  privacyBody: tForm("privacyBody"),
                  submit: tForm("submit"),
                  required: tForm("required"),
                  successHeading: tForm("successHeading"),
                  successBody: tForm("successBody"),
                  errorFallback: tForm("errorFallback"),
                }}
              />
            </RevealOnView>

            <RevealOnView delay={0.2} className="h-full">
              <div className="flex h-full flex-col gap-px bg-canvas/10">
                <div className="bg-structural p-8 md:p-10 space-y-6">
                  <InfoRow
                    label={tHome("info.addressLabel")}
                    value={tHome("info.addressValue")}
                  />
                  <InfoRow
                    label={tHome("info.telLabel")}
                    value={tHome("info.telValue")}
                    href={`tel:${tHome("info.telValue").replace(/[^+\d]/g, "")}`}
                  />
                  <InfoRow
                    label={tHome("info.emailLabel")}
                    value={tHome("info.emailValue")}
                    href={`mailto:${tHome("info.emailValue")}`}
                  />
                  <InfoRow
                    label={tHome("info.hoursLabel")}
                    value={tHome("info.hoursValue")}
                  />
                </div>

                <LocationMap
                  hl={locale}
                  address={tHome("info.addressValue")}
                  label={tHome("mapPlaceholder")}
                  directionsLabel={tHome("directions")}
                  className="flex-1 min-h-[280px]"
                />
              </div>
            </RevealOnView>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoRow({
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
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-canvas/55">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          className="block text-sm text-canvas hover:text-primary transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-canvas">{value}</p>
      )}
    </div>
  );
}

import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { RevealOnView } from "@/components/motion/reveal-on-view";
import { RevealWords } from "@/components/motion/reveal-words";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";
import { Lede } from "@/components/layout/lede";
import { LocationMap } from "./location-map";
import { ContactForm } from "./contact-form";

export async function ContactSection() {
  const locale = await getLocale();
  const t = await getTranslations("home.contact");
  const tForm = await getTranslations("home.contact.form");
  const categoryOptions = tForm.raw("categoryOptions") as string[];

  return (
    <section
      aria-labelledby="contact-heading"
      className="relative isolate bg-structural text-canvas overflow-hidden"
    >
      {/* Full-bleed facility backdrop. The form/info cards are opaque
          bg-structural, so the photo reads behind the heading while the form
          stays legible on top. */}
      <Image
        src="/home-contact-backdrop.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="absolute inset-0 -z-10 object-cover photo-grade-green opacity-30 [mask-image:linear-gradient(to_bottom,black,black_65%,transparent)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-primary/25 mix-blend-multiply"
      />
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
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <RevealOnView>
            <SectionEyebrow number={8} total={8} tag={t("sectionTag")} inverse />
          </RevealOnView>
          <RevealOnView delay={0.05}>
            <p className="mono-label text-canvas/55">{t("sectionMeta")}</p>
          </RevealOnView>
        </div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <h2
            id="contact-heading"
            className="font-sans font-bold leading-[1.25] tracking-[-0.015em] text-canvas"
            style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
          >
            <RevealWords text={t("heading")} triggerOnView />
          </h2>
          <RevealOnView delay={0.2}>
            <Lede text={t("lede")} inverse />
          </RevealOnView>
        </div>

        {/* Form + Info */}
        <div className="mt-16 grid items-stretch gap-px bg-canvas/10 lg:grid-cols-[1.4fr_1fr]">
          <RevealOnView delay={0.2} className="h-full">
            <ContactForm
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

          <RevealOnView delay={0.3} className="h-full">
            <div className="flex h-full flex-col gap-px bg-canvas/10">
              <div className="bg-structural p-8 md:p-10 space-y-6">
                <InfoRow
                  label={t("info.addressLabel")}
                  value={t("info.addressValue")}
                />
                <InfoRow
                  label={t("info.telLabel")}
                  value={t("info.telValue")}
                  href={`tel:${t("info.telValue").replace(/[^+\d]/g, "")}`}
                />
                <InfoRow
                  label={t("info.emailLabel")}
                  value={t("info.emailValue")}
                  href={`mailto:${t("info.emailValue")}`}
                />
                <InfoRow
                  label={t("info.hoursLabel")}
                  value={t("info.hoursValue")}
                />
              </div>

              <LocationMap
                hl={locale}
                address={t("info.addressValue")}
                label={t("mapPlaceholder")}
                directionsLabel={t("directions")}
                className="flex-1 min-h-[240px]"
              />
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
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

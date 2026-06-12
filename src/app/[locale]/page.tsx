import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/sections/hero-section";
import { PersonaRouterSection } from "@/components/sections/persona-router-section";
import { CredibilityStripSection } from "@/components/sections/credibility-strip-section";
import { ScaleSection } from "@/components/sections/scale-section";
import { ProblemSection } from "@/components/sections/problem-section";
import { MatSection } from "@/components/sections/mat-section";
import { FdaSection } from "@/components/sections/fda-section";
import { TractionSection } from "@/components/sections/traction-section";
import { BusinessSection } from "@/components/sections/business-section";
import { PipelineSection } from "@/components/sections/pipeline-section";
import { RoadmapSection } from "@/components/sections/roadmap-section";
import { NewsSection } from "@/components/sections/news-section";
import { ContactSection } from "@/components/sections/contact-section";
import { CtaBand } from "@/components/sections/cta-band";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  return (
    <>
      <HeroSection />
      <PersonaRouterSection />
      <CredibilityStripSection />
      <ProblemSection />
      <MatSection />
      <FdaSection />
      <ScaleSection />
      <TractionSection />
      <CtaBand
        tone="light"
        eyebrow={t("ctaProof.eyebrow")}
        heading={t("ctaProof.heading")}
        body={t("ctaProof.body")}
        primaryLabel={t("ctaProof.primary")}
        primaryHref="/contact"
        secondaryLabel={t("ctaProof.secondary")}
        secondaryHref="/business"
      />
      <BusinessSection />
      <PipelineSection />
      <CtaBand
        tone="light"
        eyebrow={t("ctaRnd.eyebrow")}
        heading={t("ctaRnd.heading")}
        body={t("ctaRnd.body")}
        primaryLabel={t("ctaRnd.primary")}
        primaryHref="/contact?topic=rnd"
      />
      <RoadmapSection />
      <NewsSection />
      <ContactSection />
    </>
  );
}

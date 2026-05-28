import { setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/sections/hero-section";
import { CredibilityStripSection } from "@/components/sections/credibility-strip-section";
import { ProblemSection } from "@/components/sections/problem-section";
import { MatSection } from "@/components/sections/mat-section";
import { FdaSection } from "@/components/sections/fda-section";
import { TractionSection } from "@/components/sections/traction-section";
import { BusinessSection } from "@/components/sections/business-section";
import { PipelineSection } from "@/components/sections/pipeline-section";
import { RoadmapSection } from "@/components/sections/roadmap-section";
import { NewsSection } from "@/components/sections/news-section";
import { ContactSection } from "@/components/sections/contact-section";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <CredibilityStripSection />
      <ProblemSection />
      <MatSection />
      <FdaSection />
      <TractionSection />
      <BusinessSection />
      <PipelineSection />
      <RoadmapSection />
      <NewsSection />
      <ContactSection />
    </>
  );
}

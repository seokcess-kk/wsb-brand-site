import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { OrganizationJsonLd } from "@/components/seo/organization-jsonld";
import { Analytics } from "@/components/seo/analytics";
import "../globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const title = `${t("name")} · ${t("slogan")}`;

  return {
    metadataBase: new URL("https://woorismartbio.com"),
    title: {
      default: title,
      template: `%s · ${t("shortName")}`,
    },
    description: t("tagline"),
    openGraph: {
      type: "website",
      locale: locale === "ko" ? "ko_KR" : "en_US",
      siteName: t("name"),
      title,
      description: t("tagline"),
      url: locale === "ko" ? "/" : "/en",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t("tagline"),
    },
    alternates: {
      canonical: locale === "ko" ? "/" : "/en",
      languages: {
        ko: "/",
        en: "/en",
        "x-default": "/",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-canvas text-structural">
        <OrganizationJsonLd locale={locale} />
        <Analytics />
        <NextIntlClientProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

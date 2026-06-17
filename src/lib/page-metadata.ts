import type { Metadata } from "next";

/**
 * Per-page metadata for the public subpages. Without this each route inherited
 * the home title/description/canonical/OG from the locale layout, so search and
 * social treated them as duplicates of the home page. metadataBase is set on
 * the layout and inherited here, so relative asset URLs still resolve.
 */
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const koPath = path;
  const enPath = `/en${path}`;
  const canonical = locale === "ko" ? koPath : enPath;
  const fullTitle = `${title} · WSB`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { ko: koPath, en: enPath, "x-default": koPath },
    },
    openGraph: {
      type: "website",
      locale: locale === "ko" ? "ko_KR" : "en_US",
      siteName: locale === "ko" ? "우리스마트바이오" : "Woori Smart Bio",
      title: fullTitle,
      description,
      url: canonical,
      images: [
        { url: "/og-image.png", width: 1200, height: 630, alt: fullTitle },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/og-image.png"],
    },
  };
}

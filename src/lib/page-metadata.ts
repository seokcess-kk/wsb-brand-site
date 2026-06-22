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
  image,
  type = "website",
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  /** Overrides the default OG image (e.g. a news thumbnail). */
  image?: string | null;
  type?: "website" | "article";
}): Metadata {
  const koPath = path;
  const enPath = `/en${path}`;
  const canonical = locale === "ko" ? koPath : enPath;
  const fullTitle = `${title} · WSB`;
  const ogImage =
    image && /^https?:\/\//.test(image)
      ? [{ url: image }]
      : [{ url: "/og-image.png", width: 1200, height: 630, alt: fullTitle }];

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { ko: koPath, en: enPath, "x-default": koPath },
    },
    openGraph: {
      type,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      siteName: locale === "ko" ? "우리스마트바이오" : "Woori Smart Bio",
      title: fullTitle,
      description,
      url: canonical,
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImage.map((i) => i.url),
    },
  };
}

import type { MetadataRoute } from "next";
import { env } from "@/env";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const routes = ["", "/company", "/technology", "/business", "/r-and-d", "/news", "/contact"];

  return routes.flatMap((route) =>
    routing.locales.map((locale) => {
      const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
      return {
        url: `${base}${prefix}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.7,
        alternates: {
          languages: routing.locales.reduce<Record<string, string>>(
            (acc, loc) => {
              const p = loc === routing.defaultLocale ? "" : `/${loc}`;
              acc[loc] = `${base}${p}${route}`;
              return acc;
            },
            {},
          ),
        },
      };
    }),
  );
}

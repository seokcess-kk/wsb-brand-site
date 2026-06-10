import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const NAV_GROUPS = [
  {
    title: "explore",
    items: [
      { key: "company", href: "/company" },
      { key: "technology", href: "/technology" },
      { key: "business", href: "/business" },
      { key: "rnd", href: "/r-and-d" },
      { key: "news", href: "/news" },
      { key: "contact", href: "/contact" },
    ],
  },
] as const;

function LabelMark({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="h-px w-6 bg-primary" />
      <span className="mono-label">{text}</span>
    </div>
  );
}

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tSite = await getTranslations("site");

  return (
    <footer className="mt-32 border-t border-structural/10 bg-canvas">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <Image
              src="/wsb-logo.png"
              alt={tSite("name")}
              width={1376}
              height={332}
              className="h-9 w-auto"
            />
            <LabelMark text={t("brandPromiseLabel")} />
            <p className="text-sm leading-relaxed text-structural/80">
              {t("brandPromise")}
            </p>
            <p className="mono-label pt-2">{tSite("slogan")}</p>
          </div>

          <nav aria-label="Footer" className="space-y-4">
            <LabelMark text={t("explore")} />
            <ul className="space-y-2">
              {NAV_GROUPS[0].items.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-sm text-structural/70 hover:text-primary"
                  >
                    {tNav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-4">
            <LabelMark text={t("contactLabel")} />
            <address className="not-italic text-sm text-structural/80 space-y-1">
              <p>{t("address")}</p>
              <p>Tel · {t("tel")}</p>
              <p>
                <a
                  href={`mailto:${t("email")}`}
                  className="hover:text-primary"
                >
                  {t("email")}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-structural/10 pt-6 text-xs text-structural/55 md:flex-row md:items-center md:justify-between">
          <p>{t("copyright")}</p>
          <p className="mono-label">WSB · BRAND SITE · v1.0</p>
        </div>
      </div>
    </footer>
  );
}

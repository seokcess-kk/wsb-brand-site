import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "./language-toggle";
import { MobileNav, type MobileNavItem } from "./mobile-nav";

const NAV_ITEMS = [
  { key: "company", href: "/company" },
  { key: "technology", href: "/technology" },
  { key: "business", href: "/business" },
  { key: "rnd", href: "/r-and-d" },
  { key: "news", href: "/news" },
  { key: "contact", href: "/contact" },
] as const;

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const tSite = await getTranslations("site");

  const items: MobileNavItem[] = NAV_ITEMS.map((i) => ({
    key: i.key,
    href: i.href,
    label: t(i.key),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-structural/10 bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-canvas"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center"
          aria-label={tSite("name")}
        >
          <Image
            src="/wsb-logo.png"
            alt=""
            width={1376}
            height={332}
            priority
            className="h-7 w-auto md:h-9"
          />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-structural/70 transition-colors hover:text-primary"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3 md:gap-6">
          <LanguageToggle />
          <MobileNav
            items={items}
            openLabel={t("openMenu")}
            closeLabel={t("closeMenu")}
          />
        </div>
      </div>
    </header>
  );
}

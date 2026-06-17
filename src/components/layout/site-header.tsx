import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeaderShell } from "./header-shell";
import { LanguageToggle } from "./language-toggle";
import { NavLink } from "./nav-link";
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

  const items: MobileNavItem[] = NAV_ITEMS.filter(
    (i) => i.key !== "contact",
  ).map((i) => ({
    key: i.key,
    href: i.href,
    label: t(i.key),
  }));

  return (
    <HeaderShell>
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
            {NAV_ITEMS.filter((item) => item.key !== "contact").map((item) => (
              <li key={item.key}>
                <NavLink href={item.href} label={t(item.key)} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <Link
            href="/contact"
            className="hidden items-center bg-primary px-4 py-2 text-sm font-medium text-canvas transition-opacity hover:opacity-90 md:inline-flex"
          >
            {t("contact")}
          </Link>
          <LanguageToggle />
          <MobileNav
            items={items}
            openLabel={t("openMenu")}
            closeLabel={t("closeMenu")}
            ctaLabel={t("contact")}
            ctaHref="/contact"
          />
        </div>
      </div>
    </HeaderShell>
  );
}

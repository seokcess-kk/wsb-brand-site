"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: (typeof routing.locales)[number]) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      className="mono-label flex items-center gap-2"
      aria-label="Language toggle"
    >
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden className="opacity-30">·</span>}
          <button
            type="button"
            onClick={() => switchTo(loc)}
            disabled={isPending}
            className={cn(
              "uppercase tracking-wider transition-opacity",
              locale === loc
                ? "opacity-100 text-primary"
                : "opacity-50 hover:opacity-100",
            )}
            aria-current={locale === loc ? "true" : undefined}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  );
}

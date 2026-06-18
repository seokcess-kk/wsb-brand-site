"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

// Error boundaries must be Client Components. We avoid depending on the
// message catalog (it may be what failed to load) and key off the locale with
// inline copy instead.
const COPY = {
  ko: {
    label: "ERROR",
    heading: "예상치 못한 오류가 발생했습니다",
    body: "잠시 후 다시 시도해 주세요. 문제가 계속되면 dasom@woorismartbio.com 으로 알려주세요.",
    retry: "다시 시도",
  },
  en: {
    label: "ERROR",
    heading: "Something went wrong",
    body: "Please try again in a moment. If the problem persists, contact us at dasom@woorismartbio.com.",
    retry: "Try again",
  },
} as const;

export default function LocaleError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  const locale = useLocale();
  const t = COPY[locale === "en" ? "en" : "ko"];

  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <section className="bg-canvas">
      <div className="mx-auto flex max-w-7xl justify-center px-6 py-24 md:py-32">
        <div className="relative w-full max-w-xl overflow-hidden border border-structural/12 bg-structural/[0.02] px-8 py-16 text-center md:py-20">
          <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
          <span aria-hidden className="absolute top-3 left-3 h-3 w-3 border-l border-t border-structural/20" />
          <span aria-hidden className="absolute top-3 right-3 h-3 w-3 border-r border-t border-structural/20" />
          <span aria-hidden className="absolute bottom-3 left-3 h-3 w-3 border-l border-b border-structural/20" />
          <span aria-hidden className="absolute bottom-3 right-3 h-3 w-3 border-r border-b border-structural/20" />

          <div className="relative flex flex-col items-center gap-5">
            <p className="mono-label text-primary">{t.label}</p>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-structural">
              {t.heading}
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-structural/65">
              {t.body}
            </p>
            {error.digest && (
              <p className="mono-label text-[10px] text-structural/35">
                REF · {error.digest}
              </p>
            )}
            {retry && (
              <button
                type="button"
                onClick={() => retry()}
                className="mt-2 inline-flex items-center bg-primary px-6 py-3 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
              >
                {t.retry}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

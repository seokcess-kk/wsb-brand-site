import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Page-level translations live in a second namespace file (pages.{locale}.json)
  // to keep the main messages file focused on home + global UI.
  const [main, pages] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/pages.${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      ...main.default,
      pages: pages.default,
    },
  };
});

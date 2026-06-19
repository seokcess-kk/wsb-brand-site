import { getTranslations } from "next-intl/server";
import { ArrowDownRight } from "lucide-react";

type PersonaItem = {
  key: string;
  audience: string;
  need: string;
  cta: string;
  href: string;
};

/**
 * Persona router. Sits directly under the hero so each visitor type (material
 * buyer, technology adopter, investor, researcher) can jump straight to the
 * section that serves them. Plain in-page anchors (#mat, #business, ...) keep
 * navigation on the home narrative; section CTAs handle conversion downstream.
 */
export async function PersonaRouterSection() {
  const t = await getTranslations("home.personas");
  const items = t.raw("items") as PersonaItem[];

  return (
    <section
      aria-label={t("ariaLabel")}
      className="border-b border-structural/10 bg-canvas"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="group flex h-full flex-col border border-structural/[0.12] bg-canvas p-6 transition-colors hover:border-primary/50 hover:bg-primary/[0.03] md:p-7"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-sans text-xl font-bold leading-snug tracking-tight text-structural md:text-2xl">
                  {item.audience}
                </h3>
                <span
                  aria-hidden
                  className="mt-2 h-2 w-2 flex-none rounded-full bg-primary/50 transition-transform duration-300 group-hover:scale-150"
                />
              </div>
              <span
                aria-hidden
                className="mt-4 h-px w-10 bg-primary/40 transition-all duration-300 group-hover:w-16"
              />
              <p className="mt-4 text-sm leading-[1.6] text-structural/70">
                {item.need}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-medium text-primary">
                {item.cta}
                <ArrowDownRight
                  size={13}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

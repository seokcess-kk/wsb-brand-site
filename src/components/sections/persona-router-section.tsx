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
      className="relative isolate overflow-hidden border-y border-structural/12 bg-canvas"
    >
      {/* Light engineering grid: a 32px major over an 8px minor, like graph
          paper. No carbon wash, so the band stays airy and reads as one
          continuous surface with the credibility strip below it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--grid-major) 1px, transparent 1px)," +
            "linear-gradient(to bottom, var(--grid-major) 1px, transparent 1px)," +
            "linear-gradient(to right, var(--grid-minor) 1px, transparent 1px)," +
            "linear-gradient(to bottom, var(--grid-minor) 1px, transparent 1px)",
          backgroundSize: "32px 32px, 32px 32px, 8px 8px, 8px 8px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
        {/* Card lattice: zero-gap cells joined by shared rules, so the four
            read as one instrument grid rather than four floating buttons. */}
        <div className="grid border-l border-t border-structural/15 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const index = String(i + 1).padStart(2, "0");
            const node = item.href.replace("#", "").toUpperCase();
            return (
              <a
                key={item.key}
                href={item.href}
                className="group relative flex h-full flex-col overflow-hidden border-r border-b border-structural/15 p-6 transition-colors hover:bg-primary/[0.05] md:p-7"
              >
                {/* Cell origin crosshair */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-2 top-2 font-mono text-[11px] leading-none text-structural/25 transition-colors duration-300 group-hover:text-primary/70"
                >
                  +
                </span>
                {/* Hover scan sweep (monitor refresh) */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-primary/[0.06] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[450%]"
                />

                {/* Monitor header: cell index + target node readout */}
                <div className="flex items-center justify-between">
                  <span className="mono-label text-[11px] text-structural/45">
                    {index}
                  </span>
                  <span className="mono-label flex items-center gap-1.5 text-[10px] text-primary/70">
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 flex-none rounded-full bg-primary/50 transition-transform duration-300 group-hover:scale-150"
                    />
                    {node}
                  </span>
                </div>

                <h3 className="mt-5 font-sans text-xl font-bold leading-snug tracking-tight text-structural md:text-2xl">
                  {item.audience}
                </h3>
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
            );
          })}
        </div>
      </div>
    </section>
  );
}

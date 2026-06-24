import { getTranslations } from "next-intl/server";
import { CountUp } from "@/components/motion/count-up";

type CredibilityItem = {
  label: string;
  value: string;
  caption: string;
};

/**
 * Trust-indicator strip pinned directly under the hero. Rendered in the hero's
 * dark carbon tone (not a white band) so it reads as the hero's footing rather
 * than a sheet wedged between the hero and the persona router: the tone carries
 * straight down from the photo, then hands off to the light persona band below.
 * Compact (value + label only); fuller captions live in Traction. Numeric
 * values count up on scroll-in and cells lift on hover.
 */
export async function CredibilityStripSection() {
  const t = await getTranslations("home.credibility");
  const items = t.raw("items") as CredibilityItem[];

  return (
    <section
      aria-label={t("ariaLabel")}
      className="relative isolate bg-structural text-canvas"
    >
      {/* Seam glow where the hero photo meets the solid strip. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-canvas/10 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="group flex flex-col gap-1 bg-structural px-5 py-5 transition-colors hover:bg-canvas/[0.04] md:px-6"
          >
            <dd className="font-mono text-xl font-bold leading-none tracking-tight text-canvas tabular-nums transition-colors group-hover:text-[color:var(--color-data)]">
              <CountUp value={item.value} />
            </dd>
            <dt className="mono-label text-[10px] text-canvas/50">
              {item.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

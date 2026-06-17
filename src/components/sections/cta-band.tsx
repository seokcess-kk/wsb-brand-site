import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Props = {
  eyebrow?: string;
  heading: string;
  body?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  tone?: "light" | "dark";
};

/**
 * Contextual conversion band. Dropped after a persuasion section or at the end
 * of a subpage so the visitor can act the moment they are convinced, instead of
 * scrolling all the way to the contact form. Primary links carry a ?topic= so
 * the inquiry form arrives with the matching category preselected.
 */
export function CtaBand({
  eyebrow,
  heading,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  tone = "dark",
}: Props) {
  const dark = tone === "dark";
  return (
    <section
      className={
        dark
          ? "relative isolate bg-structural text-canvas"
          : "border-y border-structural/10 bg-canvas"
      }
    >
      {dark && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
      )}
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            {eyebrow && <p className="mono-label text-primary">{eyebrow}</p>}
            <h2
              className={`font-sans font-bold leading-[1.25] tracking-[-0.015em] ${
                dark ? "text-canvas" : "text-structural"
              }`}
              style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.25rem)" }}
            >
              {heading}
            </h2>
            {body && (
              <p
                className={`text-base leading-[1.6] md:text-base ${
                  dark ? "text-canvas/70" : "text-structural/70"
                }`}
              >
                {body}
              </p>
            )}
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center gap-4">
            <Link
              href={primaryHref}
              className="group inline-flex items-center gap-3 bg-primary px-6 py-3.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
            >
              {primaryLabel}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            {secondaryLabel && secondaryHref && (
              <Link
                href={secondaryHref}
                className={`group inline-flex items-center gap-2 border px-6 py-3.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary ${
                  dark ? "border-canvas/25 text-canvas" : "border-structural/25 text-structural"
                }`}
              >
                {secondaryLabel}
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import { Link } from "@/i18n/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline";
type Tone = "light" | "dark";
type IconKind = "right" | "up" | "none";

/**
 * One CTA language across the whole site. Every call to action shares the same
 * instrument chrome: square edges, a hover scan sweep (reads like a monitor
 * refresh) and a nudging arrow. `ctaClassName` and `CtaScan` are exported so
 * non-link triggers (e.g. the form submit button) can wear the same skin.
 *
 * `tone` only affects the outline variant: the border/text flip to the canvas
 * tone over dark sections and to the structural tone over light ones.
 */
export function ctaClassName(
  variant: Variant,
  tone: Tone = "light",
  className?: string,
) {
  return cn(
    "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden px-6 py-3.5 text-sm font-medium transition-colors",
    variant === "solid"
      ? "bg-primary text-canvas hover:bg-primary/90"
      : tone === "dark"
        ? "border border-canvas/25 text-canvas hover:border-primary"
        : "border border-structural/25 text-structural hover:border-primary hover:text-primary",
    className,
  );
}

export function CtaScan({ variant }: { variant: Variant }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[460%]",
        variant === "solid" ? "via-canvas/25" : "via-primary/10",
      )}
    />
  );
}

export function CtaLabel({
  label,
  icon,
}: {
  label: string;
  icon: IconKind;
}) {
  return (
    <span className="relative inline-flex items-center gap-2.5">
      {label}
      {icon === "right" && (
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5"
        />
      )}
      {icon === "up" && (
        <ArrowUpRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </span>
  );
}

export function Cta({
  href,
  label,
  variant = "solid",
  tone = "light",
  icon = "right",
  className,
}: {
  href: string;
  label: string;
  variant?: Variant;
  tone?: Tone;
  icon?: IconKind;
  className?: string;
}) {
  return (
    <Link href={href} className={ctaClassName(variant, tone, className)}>
      <CtaScan variant={variant} />
      <CtaLabel label={label} icon={icon} />
    </Link>
  );
}

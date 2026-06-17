import { ArrowUpRight } from "lucide-react";

type Props = {
  /** Full address. Drives the embedded map and the Google Maps deep link. */
  address: string;
  /** Short place name, used as the iframe title for accessibility. */
  label: string;
  /** Deep-link label (e.g. "Google 지도에서 보기"). */
  directionsLabel: string;
  /** Map UI language for the embed (defaults to Korean). */
  hl?: string;
  /** Extra classes for the outer frame (e.g. min-height tuning per layout). */
  className?: string;
};

/**
 * Headquarters / location map. Uses Google Maps' key-free embed: the address
 * is geocoded server-side by Google, so a marker resolves without any API key
 * or domain registration. A "View on Google Maps" deep link sits on top.
 */
export function LocationMap({
  address,
  label,
  directionsLabel,
  hl = "ko",
  className,
}: Props) {
  const query = encodeURIComponent(address);
  const embedSrc = `https://www.google.com/maps?q=${query}&hl=${hl}&z=16&output=embed`;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <div
      className={`relative min-h-[280px] overflow-hidden bg-structural/[0.04] ${className ?? ""}`}
    >
      <iframe
        title={label}
        src={embedSrc}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />

      <a
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-[2] inline-flex items-center gap-1.5 bg-canvas/95 px-3 py-2 mono-label text-[10px] text-structural ring-1 ring-structural/10 transition-colors hover:text-primary"
      >
        {directionsLabel}
        <ArrowUpRight size={12} aria-hidden />
      </a>
    </div>
  );
}

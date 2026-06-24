import Image from "next/image";

type Grade = "green" | "green-strong" | "none";

type ImageFrameProps = {
  src?: string;
  /** Used as both the visible caption and the image alt text. */
  caption: string;
  /** Placeholder line shown until a real `src` arrives. */
  pending: string;
  /** CSS aspect-ratio, e.g. "21 / 9". Fixed so swapping the photo never shifts layout. */
  ratio: string;
  sizes: string;
  /** Frame index, e.g. "01" (decorative). */
  index?: string;
  /** Data ID label, e.g. "IMG-FAC-01" (decorative). */
  dataId?: string;
  /** object-position for art-directed cropping, e.g. "center 30%". */
  focal?: string;
  grade?: Grade;
  priority?: boolean;
};

const GRADE_CLASS: Record<Grade, string> = {
  green: "photo-grade-green",
  "green-strong": "photo-grade-green-strong",
  none: "",
};

/**
 * Reusable facility image frame. A fixed-ratio well with corner brackets, a
 * mono caption, an optional index / data-ID readout, and a green grade wash, so
 * swapping the photo never shifts layout. Renders a blueprint-grid placeholder
 * until a real `src` arrives. Extracted from traction's former PhotoWell so the
 * same frame can be reused as client photography is delivered.
 */
export function ImageFrame({
  src,
  caption,
  pending,
  ratio,
  sizes,
  index,
  dataId,
  focal,
  grade = "green",
  priority,
}: ImageFrameProps) {
  const tick = src ? "border-canvas/40" : "border-structural/20";
  return (
    <div
      className="group relative isolate w-full overflow-hidden bg-structural/[0.04] transition-colors duration-500 hover:bg-structural/[0.06]"
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <>
          <Image
            src={src}
            alt={caption}
            fill
            priority={priority}
            sizes={sizes}
            style={focal ? { objectPosition: focal } : undefined}
            className={`object-cover ${GRADE_CLASS[grade]} transition-transform duration-700 group-hover:scale-[1.03]`}
          />
          {/* Light green wash to unify mixed-source photos (verdant greens stay,
              other casts pull gently toward Deep Cultivation Green). */}
          <div
            aria-hidden
            className="absolute inset-0 bg-primary/15 mix-blend-multiply"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-structural/55 via-transparent to-transparent"
          />
          <p className="absolute bottom-3 left-3 right-3 mono-label text-[11px] text-canvas">
            {caption}
          </p>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-grid opacity-70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="mono-label text-[11px] text-primary">{pending}</p>
            <p className="mono-label text-[11px] text-structural/65 max-w-[28ch]">
              {caption}
            </p>
          </div>
        </>
      )}

      {/* Frame index / data ID (top-left, decorative) */}
      {(index || dataId) && (
        <span
          aria-hidden
          className={`absolute left-4 top-3 flex items-center gap-1.5 mono-label text-[10px] ${
            src ? "text-canvas/80" : "text-structural/50"
          }`}
          style={src ? { textShadow: "0 1px 6px rgba(10,18,12,0.55)" } : undefined}
        >
          {index && <span className="tabular-nums">{index}</span>}
          {index && dataId && <span className="opacity-40">·</span>}
          {dataId && <span>{dataId}</span>}
        </span>
      )}

      {/* Corner brackets */}
      <span aria-hidden className={`absolute left-2 top-2 h-3 w-3 border-l border-t ${tick} transition-colors duration-500 group-hover:border-primary/60`} />
      <span aria-hidden className={`absolute right-2 top-2 h-3 w-3 border-r border-t ${tick} transition-colors duration-500 group-hover:border-primary/60`} />
      <span aria-hidden className={`absolute bottom-2 left-2 h-3 w-3 border-l border-b ${tick} transition-colors duration-500 group-hover:border-primary/60`} />
      <span aria-hidden className={`absolute bottom-2 right-2 h-3 w-3 border-r border-b ${tick} transition-colors duration-500 group-hover:border-primary/60`} />
    </div>
  );
}

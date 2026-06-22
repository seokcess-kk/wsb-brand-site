"use client";

import { useState } from "react";

/**
 * News card media well, shared by the home teaser and the /news list. Shows the
 * post thumbnail when present and reachable; if the URL is empty or the image
 * fails to load (e.g. an external press thumbnail with hotlink protection) it
 * falls back to the branded placeholder well instead of a broken image.
 */
export function NewsThumbnail({
  src,
  category,
  date,
}: {
  src?: string | null;
  category: string;
  date?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-structural/[0.04] transition-colors duration-500 group-hover:bg-structural/[0.07]">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-grid opacity-70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="mono-label text-[11px] text-primary">WSB UPDATE</p>
            <p className="mono-label text-[11px] text-structural/35">
              {date ? `${category} · ${date}` : category}
            </p>
          </div>
        </>
      )}
      <span aria-hidden className="absolute top-2 left-2 h-2 w-2 border-l border-t border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
      <span aria-hidden className="absolute top-2 right-2 h-2 w-2 border-r border-t border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
      <span aria-hidden className="absolute bottom-2 left-2 h-2 w-2 border-l border-b border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
      <span aria-hidden className="absolute bottom-2 right-2 h-2 w-2 border-r border-b border-structural/20 transition-colors duration-500 group-hover:border-primary/50" />
    </div>
  );
}

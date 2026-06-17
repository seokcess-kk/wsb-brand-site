"use client";

import Script from "next/script";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";

type Props = {
  /**
   * NCP Maps client id (NEXT_PUBLIC). When absent the component renders a
   * key-free fallback: a styled marker plate plus a Naver deep link, so the
   * location still resolves without any API setup.
   */
  clientId?: string;
  lat: number;
  lng: number;
  /** Full address. Drives the Naver deep link and the marker title. */
  address: string;
  /** Short place name, used for the marker title and the fallback caption. */
  label: string;
  /** Deep-link label (e.g. "네이버 지도에서 보기"). */
  directionsLabel: string;
  zoom?: number;
};

// Minimal shape of the Naver Maps v3 globals we touch (avoids an extra types dep).
type NaverNamespace = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
    LatLng: new (lat: number, lng: number) => unknown;
    Marker: new (opts: Record<string, unknown>) => unknown;
  };
};

declare global {
  interface Window {
    naver?: NaverNamespace;
  }
}

/**
 * Headquarters / location map. With an NCP key it renders a live Naver Dynamic
 * Map with a marker; without one it degrades to the styled plate and a Naver
 * deep link, matching the project's graceful-degradation pattern.
 */
export function LocationMap({
  clientId,
  lat,
  lng,
  address,
  label,
  directionsLabel,
  zoom = 16,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const directionsHref = `https://map.naver.com/p/search/${encodeURIComponent(address)}`;

  function initMap() {
    const naver = window.naver;
    if (!naver || !mapRef.current) return;
    const center = new naver.maps.LatLng(lat, lng);
    const map = new naver.maps.Map(mapRef.current, { center, zoom });
    new naver.maps.Marker({ position: center, map, title: label });
  }

  return (
    <div className="relative min-h-[320px] overflow-hidden bg-structural/[0.04]">
      {/* Fallback plate. Stays visible while the live map loads and is all that
          shows when no key is set. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(26,31,27,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,31,27,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary/40 animate-ping"
          />
          <span
            aria-hidden
            className="relative block h-3 w-3 rounded-full bg-primary"
          />
        </div>
        <p className="mono-label text-[10px] text-structural/65">{label}</p>
      </div>

      {clientId && (
        <>
          {/* Naver Maps v3 (NCP). New keys use `ncpKeyId`; keys issued before the
              2024 NCP migration use `ncpClientId`. If the map fails to load,
              switch the param name and confirm the service domain is registered. */}
          <Script
            src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
            strategy="afterInteractive"
            onReady={initMap}
          />
          <div
            ref={mapRef}
            className="absolute inset-0 z-[1]"
            role="img"
            aria-label={label}
          />
        </>
      )}

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

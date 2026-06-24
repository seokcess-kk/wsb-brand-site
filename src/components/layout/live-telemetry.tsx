"use client";

import { useEffect, useState } from "react";
import { useHasMounted } from "@/hooks/use-has-mounted";

/**
 * Live telemetry strip for the header. A thin instrument bar (desktop only) that
 * makes the whole site read as an actively monitored facility: a pulsing status
 * LED, the Yeoncheon coordinates, and a live KST clock. The clock is rendered as
 * a placeholder until mount so SSR and hydration agree, then ticks each second.
 * KST is pinned via Intl timeZone so it is correct regardless of the visitor's
 * own time zone.
 */
const kstFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function LiveTelemetry() {
  const mounted = useHasMounted();
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setTime(kstFormatter.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="telemetry-strip hidden border-b border-structural/[0.06] md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 mono-label text-[10px] text-structural/45">
        <span className="flex items-center gap-2">
          <span aria-hidden className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          SYSTEMS OPERATIONAL
        </span>
        <span className="flex items-center gap-4">
          <span className="hidden lg:inline">YEONCHEON · 37.9°N 127.0°E</span>
          <span className="tabular-nums text-structural/60">
            KST {mounted ? time : "--:--:--"}
          </span>
        </span>
      </div>
    </div>
  );
}

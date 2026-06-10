"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Returns false on the server and during the first client render (so SSR output
 * matches hydration), then true after the component has mounted. Use this to
 * gate scroll-reveal animations behind a confirmed client mount: the content
 * renders visible by default and the hidden-then-reveal motion is layered on
 * only once JS is running, so visitors without working client JS still see the
 * copy instead of a permanently hidden (opacity 0) block.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Whether IntersectionObserver (required by scroll reveals) is usable here. */
export function canObserveViewport(): boolean {
  return typeof IntersectionObserver !== "undefined";
}

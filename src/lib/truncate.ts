/**
 * Truncate a teaser summary to a maximum length, cutting on a Korean word
 * boundary (어절 are space separated) when one is reasonably close to the limit
 * so words are not split mid-character. Trailing whitespace and dangling
 * punctuation are stripped so the caller can append a "… 더보기" affordance.
 */
export function truncateSummary(
  text: string,
  max = 100,
): { text: string; truncated: boolean } {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return { text: normalized, truncated: false };

  let cut = normalized.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  // Only back off to the last space if it is not too far from the limit,
  // otherwise (e.g. a long unspaced run) keep the hard cut.
  if (lastSpace > max * 0.6) cut = cut.slice(0, lastSpace);
  cut = cut.replace(/[\s.,·…‥、，。]+$/u, "");

  // Guard against an all-punctuation tail leaving an empty string.
  if (!cut) cut = normalized.slice(0, max).trim();

  return { text: cut, truncated: true };
}

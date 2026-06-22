/**
 * Date formatting for the public site and admin. publishedAt is stored as a
 * UTC instant, but this is a Korea-first site, so dates must be rendered in
 * KST. Formatting with `.toISOString()` (UTC) rolls late-evening KST posts back
 * to the previous day; these helpers format in Asia/Seoul explicitly so the
 * calendar date is correct regardless of where the code runs (UTC on Vercel).
 */

const KST = "Asia/Seoul";

function kstParts(value: Date | string): {
  year: string;
  month: string;
  day: string;
} {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** "YYYY-MM-DD" in KST. */
export function formatKstDate(value: Date | string): string {
  const { year, month, day } = kstParts(value);
  return `${year}-${month}-${day}`;
}

/** "YYYY.MM" in KST (home teaser meta). */
export function formatKstYearMonth(value: Date | string): string {
  const { year, month } = kstParts(value);
  return `${year}.${month}`;
}

// Korea has no DST, so the offset is a constant.
const KST_OFFSET = "+09:00";

/**
 * Format a UTC instant as a `datetime-local` value (YYYY-MM-DDTHH:mm) in KST,
 * so the admin sees and edits the Korean wall-clock publish time. Pair with
 * `kstDatetimeLocalToDate` on save so the round-trip is stable regardless of
 * the server timezone.
 */
export function toKstDatetimeLocal(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Parse a `datetime-local` value (interpreted as KST wall-clock) into a UTC instant. */
export function kstDatetimeLocalToDate(local: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local);
  if (!m) return null;
  const date = new Date(
    `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00${KST_OFFSET}`,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

import { test, expect } from "@playwright/test";
import {
  formatKstDate,
  formatKstYearMonth,
  toKstDatetimeLocal,
  kstDatetimeLocalToDate,
} from "../../src/lib/datetime";

test("formatKstDate renders the KST calendar date, not UTC", () => {
  // 2026-06-20 00:02 KST == 2026-06-19T15:02Z. UTC would say 06-19; KST is 06-20.
  expect(formatKstDate("2026-06-19T15:02:00.000Z")).toBe("2026-06-20");
  // 23:59 KST on the 19th == 14:59Z, still the 19th
  expect(formatKstDate("2026-06-19T14:59:00.000Z")).toBe("2026-06-19");
  // midnight boundary: 15:00Z == 00:00 KST next day
  expect(formatKstDate("2026-06-19T15:00:00.000Z")).toBe("2026-06-20");
});

test("formatKstYearMonth rolls the month at the KST boundary", () => {
  // 2026-07-01 00:30 KST == 2026-06-30T15:30Z -> month is July in KST
  expect(formatKstYearMonth("2026-06-30T15:30:00.000Z")).toBe("2026.07");
  expect(formatKstYearMonth("2026-06-30T14:00:00.000Z")).toBe("2026.06");
});

test("accepts a Date instance", () => {
  expect(formatKstDate(new Date("2026-01-01T00:00:00.000Z"))).toBe("2026-01-01");
});

test("toKstDatetimeLocal shows the KST wall-clock for the input", () => {
  // 2026-06-19T15:02Z == 2026-06-20 00:02 KST
  expect(toKstDatetimeLocal("2026-06-19T15:02:00.000Z")).toBe("2026-06-20T00:02");
  expect(toKstDatetimeLocal(null)).toBe("");
});

test("kstDatetimeLocalToDate treats the value as KST and returns a UTC instant", () => {
  const d = kstDatetimeLocalToDate("2026-06-20T00:02");
  expect(d?.toISOString()).toBe("2026-06-19T15:02:00.000Z");
  expect(kstDatetimeLocalToDate("")).toBeNull();
});

test("publishedAt round-trips through the form without drifting", () => {
  const stored = "2026-06-19T15:02:00.000Z"; // 2026-06-20 00:02 KST
  const inForm = toKstDatetimeLocal(stored);
  const resaved = kstDatetimeLocalToDate(inForm);
  expect(resaved?.toISOString()).toBe(stored);
  // and it displays as the correct KST date
  expect(formatKstDate(resaved as Date)).toBe("2026-06-20");
});

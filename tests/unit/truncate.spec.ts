import { test, expect } from "@playwright/test";
import { truncateSummary } from "../../src/lib/truncate";

test("returns short text unchanged and not truncated", () => {
  const r = truncateSummary("짧은 요약입니다.", 100);
  expect(r.truncated).toBe(false);
  expect(r.text).toBe("짧은 요약입니다.");
});

test("collapses whitespace and trims", () => {
  const r = truncateSummary("  여러   공백이   있는   요약  ", 100);
  expect(r.text).toBe("여러 공백이 있는 요약");
  expect(r.truncated).toBe(false);
});

test("truncates long Korean text on a word boundary", () => {
  const long =
    "우리기술이 주말을 앞둔 19일 장에서 약세로 거래를 마쳤다 최근 원전 관련주와 전력 인프라 테마에 대한 관심이 이어지는 가운데 차익실현 매물이 나왔다";
  const r = truncateSummary(long, 40);
  expect(r.truncated).toBe(true);
  expect(r.text.length).toBeLessThanOrEqual(40);
  // cut on a space boundary -> no trailing partial word / space
  expect(r.text.endsWith(" ")).toBe(false);
  expect(long.startsWith(r.text)).toBe(true);
});

test("hard-cuts an unspaced run when no nearby boundary exists", () => {
  const run = "가".repeat(200);
  const r = truncateSummary(run, 50);
  expect(r.truncated).toBe(true);
  expect(r.text.length).toBe(50);
});

test("strips dangling punctuation at the cut", () => {
  const r = truncateSummary("첫 문장입니다. 둘째 문장이 이어집니다 그리고 더", 18);
  expect(r.truncated).toBe(true);
  expect(/[\s.,·…]$/.test(r.text)).toBe(false);
});

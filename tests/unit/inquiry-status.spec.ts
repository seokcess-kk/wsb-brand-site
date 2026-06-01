import { test, expect } from "@playwright/test";
import {
  isInquiryStatus,
  settableStatusSchema,
  STATUS_META,
  INQUIRY_STATUSES,
} from "../../src/lib/inquiry-status";

test("isInquiryStatus accepts known, rejects unknown", () => {
  expect(isInquiryStatus("new")).toBe(true);
  expect(isInquiryStatus("archived")).toBe(true);
  expect(isInquiryStatus("bogus")).toBe(false);
});

test("settableStatusSchema rejects 'new'", () => {
  expect(settableStatusSchema.safeParse("read").success).toBe(true);
  expect(settableStatusSchema.safeParse("new").success).toBe(false);
});

test("every status has badge meta", () => {
  for (const s of INQUIRY_STATUSES) {
    expect(STATUS_META[s].label.length).toBeGreaterThan(0);
  }
});

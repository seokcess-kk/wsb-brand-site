import { test, expect } from "@playwright/test";
import { fileKindLabel, FILE_KIND_LABELS } from "../../src/lib/file-kinds";

test("maps every known kind to its label", () => {
  for (const [kind, label] of Object.entries(FILE_KIND_LABELS)) {
    expect(fileKindLabel(kind)).toBe(label);
  }
});

test("known samples and unknown fallback", () => {
  expect(fileKindLabel("pdf_company_intro")).toBe("회사소개서 PDF");
  expect(fileKindLabel("cert")).toBe("인증서");
  expect(fileKindLabel("mystery")).toBe("mystery");
});

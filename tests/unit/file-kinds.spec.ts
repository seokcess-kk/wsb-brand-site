import { test, expect } from "@playwright/test";
import { fileKindLabel } from "../../src/lib/file-kinds";

test("maps known kinds and falls back to raw value", () => {
  expect(fileKindLabel("pdf_company_intro")).toBe("회사소개서 PDF");
  expect(fileKindLabel("cert")).toBe("인증서");
  expect(fileKindLabel("mystery")).toBe("mystery");
});

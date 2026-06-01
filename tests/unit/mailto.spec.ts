import { test, expect } from "@playwright/test";
import { buildReplyMailto } from "../../src/lib/mailto";

test("builds mailto with encoded subject and body", () => {
  const url = buildReplyMailto({
    email: "lead@acme.com",
    category: "Sourcing",
    name: "Kim",
    locale: "ko",
  });
  expect(url.startsWith("mailto:lead@acme.com?")).toBe(true);
  expect(url).toContain("subject=Re%3A%20%5BWSB%5D%20Sourcing%20inquiry");
  expect(url).toContain("body=");
});

test("english locale greeting", () => {
  const url = buildReplyMailto({
    email: "a@b.com",
    category: "Partnership",
    name: "Lee",
    locale: "en",
  });
  expect(decodeURIComponent(url)).toContain("Hello Lee");
});

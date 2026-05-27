// Capture screenshots of dev server routes.
// Usage:
//   node scripts/screenshot.mjs <route> <out.png> [viewport] [selector]
//   node scripts/screenshot.mjs / home.png desktop
//   node scripts/screenshot.mjs / hero.png desktop "section[aria-labelledby=hero-heading]"
//
// When selector is provided, only that element is captured (full element, no fullPage).
// When omitted, captures the full scrolling page.

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const BASE = process.env.SHOT_BASE ?? "http://localhost:3002";
const route = process.argv[2] ?? "/";
const out = process.argv[3] ?? "screenshot.png";
const viewport = process.argv[4] ?? "desktop";
const selector = process.argv[5];

const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844 },
};
const vp = viewports[viewport] ?? viewports.desktop;

const url = BASE.replace(/\/$/, "") + (route.startsWith("/") ? route : "/" + route);
const outPath = resolve(out);
await mkdir(dirname(outPath), { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: vp,
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const page = await ctx.newPage();

console.log(`→ ${url}  (${viewport}${selector ? `, ${selector}` : ""})`);
try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(600);

  if (selector) {
    // Scroll into view first so layout settles
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
    }, selector);
    await page.waitForTimeout(400);
    const el = await page.locator(selector).first();
    await el.screenshot({ path: outPath });
  } else {
    await page.screenshot({ path: outPath, fullPage: true });
  }
  console.log(`✓ saved ${outPath}`);
} catch (err) {
  console.error(`✗ failed:`, err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}

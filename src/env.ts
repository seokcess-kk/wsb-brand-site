import { z } from "zod";

/**
 * Centralized env parsing. Missing values are allowed at dev/build time so
 * the site renders without a database or email key. Each consumer checks
 * for presence before using.
 */
// Treat empty strings the same as missing values so an unfilled .env.local
// line ("DATABASE_URL=") does not break validation.
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const schema = z.object({
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  RESEND_FROM: z.preprocess(
    emptyToUndefined,
    z.string().email().default("noreply@woorismartbio.com"),
  ),
  INQUIRY_NOTIFY_TO: z.preprocess(
    emptyToUndefined,
    z.string().default("contact@woorismartbio.com"),
  ),
  AUTH_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("https://woorismartbio.com"),
  ),
  // Naver Maps (NCP) client id for the headquarters map. Public by design
  // (domain-restricted). Absent = the map falls back to a Naver deep link.
  NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
});

const parsed = schema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  INQUIRY_NOTIFY_TO: process.env.INQUIRY_NOTIFY_TO,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID,
});

if (!parsed.success) {
  console.error(
    "[env] Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables. Check .env.local.");
}

export const env = parsed.data;

export type Env = typeof env;

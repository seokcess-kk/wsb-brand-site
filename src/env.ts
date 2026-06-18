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
    z.string().email().default("dasom@woorismartbio.com"),
  ),
  INQUIRY_NOTIFY_TO: z.preprocess(
    emptyToUndefined,
    z.string().default("dasom@woorismartbio.com"),
  ),
  AUTH_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("https://woorismartbio.com"),
  ),
});

const parsed = schema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM: process.env.RESEND_FROM,
  INQUIRY_NOTIFY_TO: process.env.INQUIRY_NOTIFY_TO,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
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

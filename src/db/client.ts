import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { env } from "@/env";

/**
 * Drizzle client for Neon serverless Postgres.
 * Single shared instance. Lazy when DATABASE_URL is missing so the app still
 * builds and renders without a database (form submits will use the dev
 * fallback in actions/inquiry.ts).
 */
let _db: ReturnType<typeof makeClient> | null = null;

function makeClient() {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local to enable database calls.",
    );
  }
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export function db() {
  if (!_db) _db = makeClient();
  return _db;
}

export function isDbConfigured() {
  return Boolean(env.DATABASE_URL);
}

export { schema };

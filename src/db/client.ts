import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "@/env";

/**
 * Drizzle client for Supabase Postgres (postgres.js driver).
 * Single shared instance. Lazy when DATABASE_URL is missing so the app still
 * builds and renders without a database (form submits will use the dev
 * fallback in actions/inquiry.ts).
 *
 * DATABASE_URL points at the Supabase transaction pooler (port 6543), which
 * runs in transaction mode and does not support prepared statements, hence
 * `prepare: false`. Migrations use DIRECT_DATABASE_URL (port 5432) via
 * drizzle.config.ts, not this client.
 */
let _db: ReturnType<typeof makeClient> | null = null;

function makeClient() {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local to enable database calls.",
    );
  }
  const client = postgres(env.DATABASE_URL, { prepare: false });
  return drizzle(client, { schema });
}

export function db() {
  if (!_db) _db = makeClient();
  return _db;
}

export function isDbConfigured() {
  return Boolean(env.DATABASE_URL);
}

export { schema };

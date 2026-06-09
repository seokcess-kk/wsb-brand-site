import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit is a plain node script, so (unlike Next.js) it does not load
// .env.local automatically. Load it explicitly, falling back to .env.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations run DDL over a session connection (port 5432). Fall back to
    // DATABASE_URL (transaction pooler) only if a direct URL is not provided.
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
  verbose: true,
  strict: true,
});

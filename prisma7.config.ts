import "dotenv/config";
import { defineConfig } from "prisma/config";

// --- Local dev (current): SQLite, one file, no pooling to worry about. ---
// The CLI and the app both just point at DATABASE_URL.
//
// --- Later, moving to Supabase: swap datasource.provider to "postgresql"
// in prisma/schema.prisma, point this at DIRECT_URL (the *unpooled*
// connection — pgbouncer's transaction mode doesn't support the prepared
// statements migrations need), and keep DATABASE_URL as the pooled
// connection string the app uses at runtime via src/lib/prisma.ts. See
// README.md "Moving to Supabase" for the full checklist.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});

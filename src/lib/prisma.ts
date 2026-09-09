import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// Local dev: a single SQLite file via better-sqlite3. Swapping to Supabase
// later means swapping this adapter for @prisma/adapter-pg — see README.md
// "Moving to Supabase".

// Next.js hot-reloads modules in dev, which would otherwise create a fresh
// PrismaClient (and a fresh connection) on every edit. Stashing it on
// `globalThis` keeps one instance alive across reloads.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — see .env.example");
  }
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

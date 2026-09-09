import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set — see .env.example");

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Shop Admin";
  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set — see .env.example",
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  console.log(`Admin account ready: ${admin.email}`);

  // Starter palette so the pattern generator has *something* to quantize
  // against out of the box. These are common Perler/Artkal reference
  // colors, not what's actually in anyone's bead jar — the admin UI (see
  // /admin/palette) tells the maker to replace them with hex values
  // sampled from her real beads. Only seed once; her edits afterward
  // should never get silently reset by re-running this script.
  const existingColors = await prisma.beadColor.count();
  if (existingColors === 0) {
    await prisma.beadColor.createMany({
      data: [
        { name: "Cream", code: "H10", hex: "#F3E4C9" },
        { name: "Light Skin Tone", code: "H25", hex: "#E8B894" },
        { name: "Medium Skin Tone", code: "H14", hex: "#C98A5E" },
        { name: "Deep Skin Tone", code: "H16", hex: "#8B5A3C" },
        { name: "Dark Brown", code: "H21", hex: "#4A2E1E" },
        { name: "Black", code: "H1", hex: "#1A1815" },
        { name: "White", code: "H5", hex: "#FBFAF7" },
        { name: "Rose Blush", code: "H12", hex: "#D98A8A" },
        { name: "Chestnut", code: "H32", hex: "#6E4530" },
        { name: "Sand", code: "H18", hex: "#D9BE93" },
        { name: "Slate Grey", code: "H36", hex: "#7C7A76" },
        { name: "Teal", code: "H41", hex: "#1E7D82" },
      ],
    });
    console.log("Seeded starter bead palette (12 colors) — replace with real bead hex values in /admin/palette.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

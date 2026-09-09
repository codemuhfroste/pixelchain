# Order Tracker

An order management system for a bead keychain business: tracking orders from
inquiry to delivery, and generating bead-by-bead pegboard patterns from a
customer's photo.

Stack: Next.js (App Router) + TypeScript + Tailwind + Prisma. Runs entirely
locally for now (SQLite + reference photos on local disk) — see
[Moving to Supabase](#moving-to-supabase) for when that changes.

## Status

All five phases are built: dual auth (separate admin console and customer
accounts), order CRUD, the bead palette, and the client-side pattern
generator (face detection, crop, box-average downsample, Lab-space color
matching, manual touch-up, print view), plus optional background removal
(MediaPipe selfie segmentation — background cells become no-bead instead of
a wasted color, with a checkbox to turn it off and a graceful fallback to
the full crop when no subject is found).

## Local setup

```bash
npm install
npm run db:migrate   # creates prisma/dev.db and applies the schema
npm run db:seed      # creates the admin account + starter bead palette
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No external services
needed — the database is a single SQLite file and uploaded photos land in
`public/uploads/`.

Seeded admin login (from `.env`'s `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`,
defaults below unless you changed them):

```
email:    admin@shop.local
password: admin1234
```

Customer accounts aren't seeded — register one at `/register`.

## Testing

```bash
npm run build   # typecheck + production build
npm run lint
npm test        # unit tests for the color-science + downsample functions
```

The pattern generator's core algorithms (`src/lib/color/lab.ts`,
`nearestBead.ts`, `downsample.ts`) are pure functions with unit tests. The
rest of the app doesn't have test coverage — it's been verified by hand
(build + lint + a full click-through of every flow: admin login, order
CRUD, status transitions, palette CRUD, photo upload, face detection, crop,
generate, paint/undo, member registration and self-service ordering).

## Moving to Supabase

This runs on SQLite + local disk on purpose, so there's nothing to set up
before you can start using it. When you're ready to deploy somewhere with a
real, persistent database (Vercel and most other hosts don't have a
writable local filesystem that survives between requests), here's what
changes — nothing else in the app needs to change, since Prisma and the
storage layer are both isolated behind small modules:

1. **Database**: create a [Supabase](https://supabase.com) project.
   - In `prisma/schema.prisma`, change `datasource db { provider = "sqlite" }`
     to `provider = "postgresql"`.
   - In `prisma7.config.ts`, point `datasource.url` at Supabase's *direct*
     (port 5432, unpooled) connection string via a `DIRECT_URL` env var —
     the Prisma CLI needs an unpooled connection for migrations.
   - In `src/lib/prisma.ts`, swap `@prisma/adapter-better-sqlite3` for
     `@prisma/adapter-pg` (already installed), using the *pooled* (port
     6543) connection string via `DATABASE_URL` at runtime.
   - Remove the `Decimal` fields' SQLite limitation is gone — you can
     re-add `@db.Decimal(10, 2)` on `Order.totalPrice`/`amountPaid` if you
     want DB-enforced precision (optional).
   - Run `npm run db:migrate` against the new database.
2. **Reference photos**: replace `src/lib/storage.ts`'s two functions
   (`savePhoto`, `getPhotoUrl`) with calls to Supabase Storage (a private
   bucket + signed URLs, since these can be photos of customers' kids).
   Nothing that calls those functions needs to change.
3. **Deploy**: push to Vercel (or similar), set the environment variables
   from `.env.example`'s Supabase section.

## Notes

- **Prisma version**: pinned to `7.10.0` rather than whatever
  `npm install prisma` resolves to — npm's `latest` tag currently points at
  an `8.0.0-rc` release candidate with a different CLI (config file is
  `prisma7.config.ts`, not `prisma.config.ts`; the client is generated as
  TypeScript source into `src/generated/prisma`, not shipped from
  `node_modules`; connecting requires a driver adapter). Don't
  `npm i prisma@latest` without checking this changed on purpose.
- **Bead palette**: the 12 seeded colors are placeholders. The accurate way
  to build the real palette (in `/admin/palette`) is to photograph the
  actual bead jars under neutral light and sample hex values from that
  photo — manufacturer color charts don't match what's physically in the
  jar, and this is the single biggest factor in whether generated patterns
  look right.
- **Auth**: two entirely separate systems, not one table with roles.
  `Admin` is seeded manually (`npm run db:seed`, no public registration
  route) and has full access under `/admin/*`. `Customer` doubles as the
  member-account table — `passwordHash` is null for someone the admin typed
  in after a Messenger chat, and set for someone who self-registered and
  can log in at `/account`. Sessions are signed JWTs in httpOnly cookies
  (`src/lib/auth/session.ts`), checked in `src/proxy.ts` (Next 16's renamed
  `middleware.ts`) for page loads and re-checked inside every mutating
  Server Action, since Actions are reachable directly over POST regardless
  of which page rendered the form.

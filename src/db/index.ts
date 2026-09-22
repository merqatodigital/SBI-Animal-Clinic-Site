// ─────────────────────────────────────────────────────────────────────────────
// SBI database client — Neon-ready Postgres code tree
// ─────────────────────────────────────────────────────────────────────────────
// Works unchanged against:
//   • Local Postgres  (DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db)
//   • Neon (https://neon.com) — pooled or direct, IPv4 or SNI-routed.
//
// Static mode (no database):
//   If DATABASE_URL is not set, this module no longer throws at import time.
//   It exports a Drizzle client backed by a fast-failing pool, so every query
//   rejects immediately and the app's built-in fallbacks (seed catalogue in
//   src/lib/catalog.ts + default CMS content in src/lib/cms.ts) take over.
//   The full storefront therefore runs with zero backend — handy for a
//   frontend-only deploy (Vercel) before the database is connected later.
//   Set DATABASE_URL to switch back to live data; nothing else changes.
//
// Neon setup (2 minutes):
//   1. Create a project at https://neon.com → copy the connection string.
//      It looks like:
//        postgresql://<user>:<password>@<endpoint>.neon.tech/<dbname>?sslmode=require
//   2. Set it as DATABASE_URL in your hosting env (Vercel → Project → Settings →
//      Environment Variables). For local dev, put it in `.env`.
//   3. Run `npx drizzle-kit push` once to create all tables (branches, bookings,
//      site_settings, content_sections, faqs, social_links, media_assets).
//   4. Run `npx tsx scripts/seed.ts` + `npx tsx scripts/seed-cms.ts` to populate.
// See NEON_SETUP.md at the project root for branching, pooling and Vercel notes.
//
// Implementation note: plain `pg` Pool works against Neon (it is wire-compatible
// Postgres). SSL is forced on for any *.neon.tech host so serverless deploys do
// not fail on certificate negotiation.
// ─────────────────────────────────────────────────────────────────────────────
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

/** True when a live database is configured; false in static (frontend-only) mode. */
export const databaseAvailable = Boolean(databaseUrl);

if (!databaseAvailable) {
  console.warn(
    "[db] DATABASE_URL is not set — running in static mode. " +
      "The site will serve its built-in catalogue; live data needs DATABASE_URL.",
  );
}

/**
 * Minimal pg.Pool stand-in whose every operation rejects immediately.
 * Kept on the client just so `drizzle()` has a real pool object to wrap;
 * callers' try/catch blocks turn these rejections into catalogue fallbacks.
 */
function createUnavailablePool(): Pool {
  const reason = "DATABASE_URL is not set — running in static (no-database) mode.";
  const fail = () => {
    const err = new Error(reason);
    (err as { code?: string }).code = "SBI_STATIC_MODE";
    return Promise.reject(err);
  };
  return {
    connect: () => fail(),
    query: () => fail(),
    end: async () => undefined,
    on: () => undefined,
    totalCount: 0,
    idleCount: 0,
  } as unknown as Pool;
}

function createLivePool(): Pool {
  const isNeon = databaseUrl!.includes("neon.tech");
  const globalForDb = globalThis as typeof globalThis & {
    __sbiPool?: Pool;
  };
  const pool =
    globalForDb.__sbiPool ??
    new Pool({
      connectionString: databaseUrl!,
      // Neon requires TLS. Local Postgres does not.
      ...(isNeon ? { ssl: { rejectUnauthorized: false } } : {}),
      max: isNeon ? 10 : 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__sbiPool = pool;
  }
  pool.on("error", (err) => {
    console.error("[db] idle pool error", err);
  });
  return pool;
}

export const pool = databaseAvailable ? createLivePool() : createUnavailablePool();
export const db = drizzle(pool);
export const isNeonBackend = databaseAvailable && databaseUrl!.includes("neon.tech");

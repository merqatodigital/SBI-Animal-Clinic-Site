import { databaseAvailable, db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — liveness probe.
 *
 * The site is designed to run with no database (static mode), so "no
 * DATABASE_URL" is a healthy state, not a failure. Only a configured but
 * unreachable database reports 500.
 */
export async function GET() {
  if (!databaseAvailable) {
    return Response.json({ ok: true, mode: "static", database: "unconfigured" });
  }

  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, mode: "live", database: "connected" });
  } catch {
    return Response.json({ ok: false, mode: "live", database: "unreachable" }, { status: 500 });
  }
}

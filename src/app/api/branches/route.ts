import { NextRequest, NextResponse } from "next/server";
import { and, eq, or, sql } from "drizzle-orm";
import { db, databaseAvailable } from "@/db";
import { branches } from "@/db/schema";
import { BRANCHES } from "@/lib/catalog";
import type { Branch } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Static-mode search over the built-in catalogue (mirrors the SQL filters). */
function searchCatalog(region: string | null, city: string | null, q: string | null) {
  const needle = (q ?? "").trim().toLowerCase();
  return BRANCHES.filter((b) => {
    if (region && b.region !== region) return false;
    if (city && b.city !== city) return false;
    if (needle) {
      const hay = [b.name, b.address, b.city, b.province ?? "", b.contact ?? ""]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  }).map((b, i) => ({ ...b, id: i + 1, isHq: b.isHq ?? false, notes: b.notes ?? null })) as Branch[];
}

/**
 * GET /api/branches?region=Luzon&city=Antipolo%20City&q=marikina
 * SBI branch directory. All filters are optional and combinable.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const city = searchParams.get("city");
  const q = searchParams.get("q");

  if (!databaseAvailable) {
    const rows = searchCatalog(region, city, q);
    return NextResponse.json({ count: rows.length, branches: rows });
  }

  const filters = [];
  if (region) filters.push(eq(branches.region, region));
  if (city) filters.push(eq(branches.city, city));
  if (q) {
    const pattern = `%${q.trim()}%`;
    filters.push(
      or(
        sql`${branches.name} ILIKE ${pattern}`,
        sql`${branches.address} ILIKE ${pattern}`,
        sql`${branches.city} ILIKE ${pattern}`,
        sql`${branches.province} ILIKE ${pattern}`,
        sql`${branches.contact} ILIKE ${pattern}`,
      )!,
    );
  }

  try {
    const rows = await db
      .select()
      .from(branches)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(branches.region, branches.name);
    return NextResponse.json({ count: rows.length, branches: rows });
  } catch (err) {
    console.error("branches query failed, serving catalogue fallback", err);
    const rows = searchCatalog(region, city, q);
    return NextResponse.json({ count: rows.length, branches: rows });
  }
}

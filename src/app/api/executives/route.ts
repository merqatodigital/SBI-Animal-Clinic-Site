import { NextResponse } from "next/server";
import { db, databaseAvailable } from "@/db";
import { branches, executives } from "@/db/schema";
import { BRANCHES, EXECUTIVES } from "@/lib/catalog";
import type { Executive } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/executives — SBI leadership roster plus network size. */
export async function GET() {
  if (!databaseAvailable) {
    const rows = EXECUTIVES.map((e, i) => ({ ...e, id: i + 1 })) as Executive[];
    return NextResponse.json({
      count: rows.length,
      executives: rows,
      publishedBranches: BRANCHES.length,
    });
  }

  try {
    const rows = await db.select().from(executives).orderBy(executives.sortOrder);
    const allBranches = await db.select({ slug: branches.slug }).from(branches);
    return NextResponse.json({
      count: rows.length,
      executives: rows,
      publishedBranches: allBranches.length,
    });
  } catch (err) {
    console.error("executives query failed, serving catalogue fallback", err);
    const rows = EXECUTIVES.map((e, i) => ({ ...e, id: i + 1 })) as Executive[];
    return NextResponse.json({
      count: rows.length,
      executives: rows,
      publishedBranches: BRANCHES.length,
    });
  }
}

import { NextResponse } from "next/server";
import { db, databaseAvailable } from "@/db";
import { services } from "@/db/schema";
import { SERVICES } from "@/lib/catalog";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

/** GET /api/services — full SKU list (active vaccines, immunoglobulins, tetanus biologics). */
export async function GET() {
  if (!databaseAvailable) {
    const rows = SERVICES.map((s, i) => ({ ...s, id: i + 1 })) as Service[];
    return NextResponse.json({ count: rows.length, services: rows });
  }

  try {
    const rows = await db.select().from(services).orderBy(services.sortOrder);
    return NextResponse.json({ count: rows.length, services: rows });
  } catch (err) {
    console.error("services query failed, serving catalogue fallback", err);
    const rows = SERVICES.map((s, i) => ({ ...s, id: i + 1 })) as Service[];
    return NextResponse.json({ count: rows.length, services: rows });
  }
}

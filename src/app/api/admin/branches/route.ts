import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { branches } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/branches — editable directory for the admin. */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const rows = await db.select().from(branches).orderBy(branches.region, branches.name);
  return NextResponse.json({ branches: rows });
}

/** PUT /api/admin/branches { id, contact, email, hours, address, name, notes } */
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  for (const k of ["name", "address", "contact", "email", "hours", "notes", "city", "province"]) {
    if (b[k] !== undefined) patch[k] = b[k] === "" ? null : b[k];
  }
  if (b.latitude !== undefined) patch.latitude = Number(b.latitude);
  if (b.longitude !== undefined) patch.longitude = Number(b.longitude);
  const [row] = await db.update(branches).set(patch).where(eq(branches.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ branch: row });
}

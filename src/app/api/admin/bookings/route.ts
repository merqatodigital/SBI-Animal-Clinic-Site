import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, databaseAvailable } from "@/db";
import { bookings, branches } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { dbUnavailable, withStatic } from "@/lib/admin-static";

export const dynamic = "force-dynamic";

/** GET /api/admin/bookings?limit=50 — full operational list for the admin. */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  // Static mode: no bookings can exist without a database.
  if (!databaseAvailable) return withStatic({ bookings: [] });
  try {
    const limit = Math.min(Number(new URL(req.url).searchParams.get("limit") ?? 50), 200);
    const rows = await db
      .select({
        id: bookings.id,
        reference: bookings.reference,
        patientName: bookings.patientName,
        contactNumber: bookings.contactNumber,
        exposureCategory: bookings.exposureCategory,
        animalType: bookings.animalType,
        isPhilhealthMember: bookings.isPhilhealthMember,
        appointmentDate: bookings.appointmentDate,
        appointmentTime: bookings.appointmentTime,
        indication: bookings.indication,
        status: bookings.status,
        createdAt: bookings.createdAt,
        branchName: branches.name,
      })
      .from(bookings)
      .leftJoin(branches, eq(bookings.branchId, branches.id))
      .orderBy(sql`${bookings.createdAt} desc`)
      .limit(limit);
    return NextResponse.json({ bookings: rows });
  } catch (err) {
    console.error("admin bookings query failed", err);
    return withStatic({ bookings: [] });
  }
}

/** PUT /api/admin/bookings { id, status } — confirm / cancel / complete. */
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  if (!databaseAvailable) return dbUnavailable();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!id || !b.status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
  const [row] = await db
    .update(bookings)
    .set({ status: String(b.status) })
    .where(eq(bookings.id, id))
    .returning();
  return NextResponse.json({ booking: row });
}

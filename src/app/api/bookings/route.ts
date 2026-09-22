import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, databaseAvailable } from "@/db";
import { bookings, branches } from "@/db/schema";

const STATIC_MODE_NOTE =
  "Online booking is being set up. For now, please visit your nearest branch or call us directly — the front desk will take care of you.";

export const dynamic = "force-dynamic";

export function buildReference(date = new Date()) {
  const year = date.getUTCFullYear();
  const n = Math.floor(Math.random() * 9000) + 1000;
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const l = letters[Math.floor(Math.random() * letters.length)];
  return `SBI-${year}-${l}${n}`;
}

/**
 * POST /api/bookings
 * Body: { patientName, contactNumber, branchSlug, exposureCategory: "I"|"II"|"III",
 *         animalType: "Dog"|"Cat"|"Other", isPhilhealthMember: boolean,
 *         appointmentDate: "YYYY-MM-DD", appointmentTime: "08:00 AM" }
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    patientName,
    contactNumber,
    branchSlug,
    exposureCategory,
    animalType,
    isPhilhealthMember,
    appointmentDate,
    appointmentTime,
  } = body as {
    patientName?: string;
    contactNumber?: string;
    branchSlug?: string;
    exposureCategory?: string;
    animalType?: string;
    isPhilhealthMember?: boolean;
    appointmentDate?: string;
    appointmentTime?: string;
  };

  if (!patientName?.trim() || !contactNumber?.trim()) {
    return NextResponse.json(
      { error: "Patient name and contact number are required." },
      { status: 400 },
    );
  }
  if (!["I", "II", "III"].includes(exposureCategory ?? "")) {
    return NextResponse.json({ error: "Invalid exposure category." }, { status: 400 });
  }
  if (!["Dog", "Cat", "Other"].includes(animalType ?? "")) {
    return NextResponse.json({ error: "Invalid animal type." }, { status: 400 });
  }
  if (!appointmentDate || !appointmentTime || !branchSlug) {
    return NextResponse.json(
      { error: "Branch, appointment date and time are required." },
      { status: 400 },
    );
  }

  if (!databaseAvailable) {
    return NextResponse.json({ error: STATIC_MODE_NOTE }, { status: 503 });
  }

  const [branch] = await db
    .select()
    .from(branches)
    .where(eq(branches.slug, branchSlug))
    .limit(1);

  if (!branch) {
    return NextResponse.json({ error: "Branch not found." }, { status: 404 });
  }

  const indication =
    exposureCategory === "I"
      ? "Category I — education only, no vaccine required"
      : exposureCategory === "II"
        ? "Category II — active vaccine prophylaxis (PVRV/PCEC)"
        : "Category III — ERIG/HRIG + active vaccines (URGENT)";

  let reference = buildReference();
  for (let i = 0; i < 5; i++) {
    try {
      const [row] = await db
        .insert(bookings)
        .values({
          reference,
          patientName: patientName.trim(),
          contactNumber: contactNumber.trim(),
          branchId: branch.id,
          exposureCategory: exposureCategory!,
          animalType: animalType!,
          isPhilhealthMember: Boolean(isPhilhealthMember),
          appointmentDate,
          appointmentTime,
          indication,
        })
        .returning();
      return NextResponse.json(
        {
          booking: row,
          branch: { slug: branch.slug, name: branch.name, address: branch.address },
        },
        { status: 201 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("unique") || message.includes("duplicate")) {
        reference = buildReference();
        continue;
      }
      console.error("booking insert failed", err);
      return NextResponse.json(
        { error: "We could not save that booking. Please try again." },
        { status: 500 },
      );
    }
  }
  return NextResponse.json({ error: "Could not allocate a reference." }, { status: 500 });
}

/** GET /api/bookings?limit=20 — recent bookings (operational view). */
export async function GET(req: NextRequest) {
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? 20);

  if (!databaseAvailable) {
    return NextResponse.json({ count: 0, bookings: [] });
  }

  try {
    const rows = await db
    .select({
      reference: bookings.reference,
      patientName: bookings.patientName,
      exposureCategory: bookings.exposureCategory,
      animalType: bookings.animalType,
      isPhilhealthMember: bookings.isPhilhealthMember,
      appointmentDate: bookings.appointmentDate,
      appointmentTime: bookings.appointmentTime,
      status: bookings.status,
      indication: bookings.indication,
      branchName: branches.name,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .leftJoin(branches, eq(bookings.branchId, branches.id))
    .orderBy(sql`${bookings.createdAt} desc`)
    .limit(Math.min(limit, 100));
    return NextResponse.json({ count: rows.length, bookings: rows });
  } catch (err) {
    console.error("bookings query failed, returning empty list", err);
    return NextResponse.json({ count: 0, bookings: [] });
  }
}

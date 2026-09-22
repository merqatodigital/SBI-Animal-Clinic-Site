import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, isNeonBackend } from "@/db";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { branches, bookings, contentSections, faqs, mediaAssets, socialLinks } from "@/db/schema";

export const dynamic = "force-dynamic";

/** GET /api/admin/overview — dashboard counters + backend tree info. */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const count = async (t: typeof branches) =>
    Number((await db.select({ n: sql<number>`count(*)` }).from(t))[0]?.n ?? 0);
  const [branchCount, bookingCount, sectionCount, faqCount, socialCount, mediaCount, recent] =
    await Promise.all([
      count(branches),
      count(bookings as unknown as typeof branches),
      count(contentSections as unknown as typeof branches),
      count(faqs as unknown as typeof branches),
      count(socialLinks as unknown as typeof branches),
      count(mediaAssets as unknown as typeof branches),
      db
        .select({
          reference: bookings.reference,
          patientName: bookings.patientName,
          exposureCategory: bookings.exposureCategory,
          appointmentDate: bookings.appointmentDate,
          status: bookings.status,
        })
        .from(bookings)
        .orderBy(sql`${bookings.createdAt} desc`)
        .limit(5)
        .catch(() => []),
    ]);

  const url = process.env.DATABASE_URL ?? "";
  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return "unconfigured";
    }
  })();

  return NextResponse.json({
    counts: {
      branches: branchCount,
      bookings: bookingCount,
      sections: sectionCount,
      faqs: faqCount,
      socials: socialCount,
      media: mediaCount,
    },
    recentBookings: recent,
    backend: {
      provider: isNeonBackend ? "Neon (neon.tech)" : "PostgreSQL (local / generic)",
      host,
      ssl: isNeonBackend ? "require (TLS)" : "off (local)",
      orm: "Drizzle ORM",
      tables: [
        "branches",
        "executives",
        "services",
        "bookings",
        "site_settings",
        "content_sections",
        "faqs",
        "social_links",
        "media_assets",
      ],
      docs: "NEON_SETUP.md",
    },
  });
}

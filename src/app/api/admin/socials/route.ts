import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const rows = await db.select().from(socialLinks).orderBy(socialLinks.sortOrder);
  return NextResponse.json({ socials: rows });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = await req.json().catch(() => ({}));
  if (!b.url?.trim() || !b.platform?.trim())
    return NextResponse.json({ error: "platform and url are required" }, { status: 400 });
  const [row] = await db
    .insert(socialLinks)
    .values({
      platform: b.platform.trim().toLowerCase(),
      label: b.label?.trim() || null,
      url: b.url.trim(),
      sortOrder: Number(b.sortOrder ?? 99),
      isVisible: b.isVisible !== false,
    })
    .returning();
  return NextResponse.json({ social: row }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const [row] = await db
    .update(socialLinks)
    .set({
      platform: b.platform ?? undefined,
      label: b.label !== undefined ? b.label || null : undefined,
      url: b.url ?? undefined,
      sortOrder: b.sortOrder !== undefined ? Number(b.sortOrder) : undefined,
      isVisible: b.isVisible !== undefined ? Boolean(b.isVisible) : undefined,
    })
    .where(eq(socialLinks.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ social: row });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.delete(socialLinks).where(eq(socialLinks.id, id));
  return NextResponse.json({ ok: true });
}

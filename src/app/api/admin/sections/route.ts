import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, databaseAvailable } from "@/db";
import { contentSections } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { dbUnavailable, withStatic } from "@/lib/admin-static";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  // Static mode mirrors the storefront, which renders no custom sections.
  if (!databaseAvailable) return withStatic({ sections: [] });
  try {
    const rows = await db.select().from(contentSections).orderBy(contentSections.sortOrder);
    return NextResponse.json({ sections: rows });
  } catch (err) {
    console.error("admin sections query failed", err);
    return withStatic({ sections: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  if (!databaseAvailable) return dbUnavailable();
  const b = await req.json().catch(() => ({}));
  if (!b.slug?.trim() || !b.title?.trim())
    return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
  const [row] = await db
    .insert(contentSections)
    .values({
      slug: b.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
      eyebrow: b.eyebrow ?? null,
      title: b.title.trim(),
      body: b.body ?? null,
      imageUrl: b.imageUrl || null,
      videoUrl: b.videoUrl || null,
      ctaLabel: b.ctaLabel || null,
      ctaHref: b.ctaHref || null,
      sortOrder: Number(b.sortOrder ?? 99),
      isVisible: b.isVisible !== false,
    })
    .returning()
    .catch(async () => {
      return await db
        .update(contentSections)
        .set({
          eyebrow: b.eyebrow ?? null,
          title: b.title.trim(),
          body: b.body ?? null,
          imageUrl: b.imageUrl || null,
          videoUrl: b.videoUrl || null,
          ctaLabel: b.ctaLabel || null,
          ctaHref: b.ctaHref || null,
          sortOrder: Number(b.sortOrder ?? 99),
          isVisible: b.isVisible !== false,
        })
        .where(eq(contentSections.slug, b.slug.trim().toLowerCase()))
        .returning();
    });
  return NextResponse.json({ section: row }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  if (!databaseAvailable) return dbUnavailable();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const [row] = await db
    .update(contentSections)
    .set({
      slug: b.slug ?? undefined,
      eyebrow: b.eyebrow ?? null,
      title: b.title ?? undefined,
      body: b.body ?? null,
      imageUrl: b.imageUrl || null,
      videoUrl: b.videoUrl || null,
      ctaLabel: b.ctaLabel || null,
      ctaHref: b.ctaHref || null,
      sortOrder: b.sortOrder !== undefined ? Number(b.sortOrder) : undefined,
      isVisible: b.isVisible !== undefined ? Boolean(b.isVisible) : undefined,
    })
    .where(eq(contentSections.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ section: row });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  if (!databaseAvailable) return dbUnavailable();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.delete(contentSections).where(eq(contentSections.id, id));
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const rows = await db.select().from(faqs).orderBy(faqs.sortOrder);
  return NextResponse.json({ faqs: rows });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = await req.json().catch(() => ({}));
  if (!b.question?.trim() || !b.answer?.trim())
    return NextResponse.json({ error: "question and answer are required" }, { status: 400 });
  const [row] = await db
    .insert(faqs)
    .values({
      question: b.question.trim(),
      answer: b.answer.trim(),
      sortOrder: Number(b.sortOrder ?? 99),
      isVisible: b.isVisible !== false,
    })
    .returning();
  return NextResponse.json({ faq: row }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const [row] = await db
    .update(faqs)
    .set({
      question: b.question ?? undefined,
      answer: b.answer ?? undefined,
      sortOrder: b.sortOrder !== undefined ? Number(b.sortOrder) : undefined,
      isVisible: b.isVisible !== undefined ? Boolean(b.isVisible) : undefined,
    })
    .where(eq(faqs.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ faq: row });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  await db.delete(faqs).where(eq(faqs.id, id));
  return NextResponse.json({ ok: true });
}

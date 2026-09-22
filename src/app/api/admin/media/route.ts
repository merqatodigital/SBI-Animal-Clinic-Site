import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per file

function kindOf(mime: string) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "other";
}

/** GET /api/admin/media — library listing. */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const rows = await db.select().from(mediaAssets).orderBy(mediaAssets.id);
  return NextResponse.json({ media: rows.reverse() });
}

/**
 * POST /api/admin/media — multipart upload straight from the device.
 * Field name: `files` (repeatable). Accepts images + videos.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0)
    return NextResponse.json({ error: "Choose at least one image or video." }, { status: 400 });

  await mkdir(UPLOAD_DIR, { recursive: true });
  const saved = [];
  for (const file of files.slice(0, 10)) {
    if (file.size > MAX_BYTES) continue;
    const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "upload";
    const stamp = Date.now().toString(36);
    const name = `${stamp}-${safe}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, name), bytes);
    const url = `uploads/${name}`;
    const [row] = await db
      .insert(mediaAssets)
      .values({
        fileName: file.name,
        url,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        kind: kindOf(file.type || ""),
      })
      .returning();
    saved.push(row);
  }
  if (saved.length === 0)
    return NextResponse.json({ error: "Files were too large (25 MB max)." }, { status: 400 });
  return NextResponse.json({ media: saved }, { status: 201 });
}

/** DELETE /api/admin/media?id=3 — removes the DB row and the file. */
export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const [row] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  if (row) {
    try {
      await unlink(path.join(process.cwd(), "public", row.url));
    } catch {
      /* file already gone */
    }
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  }
  return NextResponse.json({ ok: true });
}

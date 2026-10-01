import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { db, databaseAvailable } from "@/db";
import { mediaAssets } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { withStatic } from "@/lib/admin-static";
import {
  addMediaLocally,
  nextMediaId,
  readStore,
  removeMediaLocally,
  type StoredMedia,
} from "@/lib/site-store";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per file

function kindOf(mime: string) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "other";
}

/** GET /api/admin/media — library listing (database rows, or local store). */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  if (!databaseAvailable) {
    const store = await readStore();
    return withStatic({ media: store.media }, store.media.length ? "local-file" : "defaults");
  }
  try {
    const rows = await db.select().from(mediaAssets).orderBy(mediaAssets.id);
    const store = await readStore();
    // Locally saved uploads stay visible even when the database is back.
    return NextResponse.json({ media: [...store.media, ...rows.reverse()] });
  } catch (err) {
    console.error("admin media query failed", err);
    const store = await readStore();
    return withStatic({ media: store.media }, "local-file");
  }
}

/** Write the uploaded files to public/uploads. Returns null when unwritable. */
async function writeFilesToDisk(files: File[]): Promise<StoredMedia[] | null> {
  const saved: StoredMedia[] = [];
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const store = await readStore();
    let id = nextMediaId(store);
    for (const file of files.slice(0, 10)) {
      if (file.size > MAX_BYTES) continue;
      const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "upload";
      const name = `${Date.now().toString(36)}-${id}-${safe}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(UPLOAD_DIR, name), bytes);
      saved.push({
        id: id++,
        fileName: file.name,
        url: `uploads/${name}`,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        kind: kindOf(file.type || ""),
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("media upload could not write to disk", err);
    return null;
  }
  if (saved.length === 0) return null;
  const ok = await addMediaLocally(saved);
  return ok ? saved : null;
}

/**
 * POST /api/admin/media — multipart upload straight from the device.
 * Field name: `files` (repeatable). Accepts images + videos.
 * Without a database the files land in public/uploads and are indexed in the
 * local content store, so the library and the logo picker keep working.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0)
    return NextResponse.json({ error: "Choose at least one image or video." }, { status: 400 });

  // No database: store on disk + local index — never refuse the upload.
  if (!databaseAvailable) {
    const saved = await writeFilesToDisk(files);
    if (!saved)
      return NextResponse.json(
        {
          error:
            "This host has a read-only filesystem, so uploads cannot be stored here. " +
            "Use the logo field (it embeds the image in the setting) or connect DATABASE_URL.",
          staticMode: true,
        },
        { status: 503 },
      );
    return NextResponse.json({ media: saved, persisted: "local-file" }, { status: 201 });
  }

  // Database configured — prefer it, but never lose the file if it is down.
  try {
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
  } catch (err) {
    console.error("media upload fell back to the local store", err);
    const saved = await writeFilesToDisk(files);
    if (!saved)
      return NextResponse.json(
        { error: "Upload failed — the database is unreachable and the disk is read-only." },
        { status: 503 },
      );
    return NextResponse.json({ media: saved, persisted: "local-file" }, { status: 201 });
  }
}

/** DELETE /api/admin/media?id=3 — removes the DB row and the file. */
export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const unlinkUrl = async (url: string | null | undefined) => {
    if (!url) return;
    try {
      await unlink(path.join(process.cwd(), "public", url));
    } catch {
      /* file already gone */
    }
  };

  if (!databaseAvailable) {
    const url = await removeMediaLocally(id);
    await unlinkUrl(url);
    return NextResponse.json({ ok: true });
  }

  try {
    const [row] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
    if (row) {
      await unlinkUrl(row.url);
      await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
    }
  } catch (err) {
    console.error("media delete fell back to the local store", err);
  }
  // Also covers entries that live only in the local store.
  const url = await removeMediaLocally(id);
  await unlinkUrl(url);
  return NextResponse.json({ ok: true });
}

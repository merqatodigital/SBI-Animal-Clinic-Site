import { NextRequest, NextResponse } from "next/server";
import { db, databaseAvailable } from "@/db";
import { siteSettings } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { DEFAULT_BRANDING, DEFAULT_FOOTER, DEFAULT_HEADER, DEFAULT_HERO, DEFAULT_THEME } from "@/lib/cms";
import { dbUnavailable, staticSettings, withStatic } from "@/lib/admin-static";

export const dynamic = "force-dynamic";

const FALLBACKS: Record<string, unknown> = {
  branding: DEFAULT_BRANDING,
  theme: DEFAULT_THEME,
  header: DEFAULT_HEADER,
  hero: DEFAULT_HERO,
  footer: DEFAULT_FOOTER,
};

/** GET /api/admin/settings — full key-value map for the admin editors. */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();

  // No database: hand the editors the built-in defaults so the theme/header/
  // hero/footer forms render instead of throwing a 500.
  if (!databaseAvailable) return withStatic({ settings: staticSettings() });

  try {
    const rows = await db.select().from(siteSettings);
    return NextResponse.json({
      settings: Object.fromEntries(rows.map((r) => [r.key, r.value])),
    });
  } catch (err) {
    console.error("admin settings query failed, serving defaults", err);
    return withStatic({ settings: staticSettings() });
  }
}

/** PUT /api/admin/settings { key, value } — value may be an object or string. */
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  if (!databaseAvailable) return dbUnavailable();

  const body = await req.json().catch(() => ({}));
  const key = String(body.key ?? "").trim();
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });
  const str = typeof body.value === "string" ? body.value : JSON.stringify(body.value ?? {});
  try {
    await db
      .insert(siteSettings)
      .values({ key, value: str })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: str } });
  } catch (err) {
    console.error("admin settings save failed", err);
    return NextResponse.json(
      { error: "Could not save — the database is not reachable right now." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, key });
}

export { FALLBACKS };

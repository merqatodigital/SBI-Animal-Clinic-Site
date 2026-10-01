import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { DEFAULT_BRANDING, DEFAULT_FOOTER, DEFAULT_HEADER, DEFAULT_HERO, DEFAULT_THEME } from "@/lib/cms";

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
  const rows = await db.select().from(siteSettings);
  return NextResponse.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
}

/** PUT /api/admin/settings { key, value } — value may be an object or string. */
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const key = String(body.key ?? "").trim();
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });
  const str = typeof body.value === "string" ? body.value : JSON.stringify(body.value ?? {});
  await db
    .insert(siteSettings)
    .values({ key, value: str })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: str } });
  return NextResponse.json({ ok: true, key });
}

export { FALLBACKS };

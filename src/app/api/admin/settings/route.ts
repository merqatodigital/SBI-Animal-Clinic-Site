import { NextRequest, NextResponse } from "next/server";
import { db, databaseAvailable } from "@/db";
import { siteSettings } from "@/db/schema";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";
import { DEFAULT_BRANDING, DEFAULT_FOOTER, DEFAULT_HEADER, DEFAULT_HERO, DEFAULT_THEME } from "@/lib/cms";
import { staticSettings, withStatic } from "@/lib/admin-static";
import { flushLocalSettingsToDatabase, loadSettingsMap } from "@/lib/site-content";
import { saveSettingLocally, storePath } from "@/lib/site-store";

export const dynamic = "force-dynamic";

const FALLBACKS: Record<string, unknown> = {
  branding: DEFAULT_BRANDING,
  theme: DEFAULT_THEME,
  header: DEFAULT_HEADER,
  hero: DEFAULT_HERO,
  footer: DEFAULT_FOOTER,
};

/** Shown when a save could only be stored on this server. */
function localSaveNote(why: string) {
  return (
    `${why} The change is applied to the live site right away and stored in ` +
    `${storePath()} so it survives restarts. Connect DATABASE_URL to keep it in the cloud.`
  );
}

/** GET /api/admin/settings — full key-value map for the admin editors. */
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();

  // A database is attached again? Push anything that was saved locally while
  // it was away, so the two sources can never drift apart.
  if (databaseAvailable) await flushLocalSettingsToDatabase().catch(() => false);

  // No database: hand the editors the values the site is really serving —
  // built-in defaults with every locally saved key (the logo!) merged over.
  if (!databaseAvailable) {
    return withStatic({ settings: await staticSettings() }, "local-file");
  }

  try {
    const { settings, source } = await loadSettingsMap();
    return NextResponse.json({
      settings: { ...(await staticSettings()), ...settings },
      dataSource: source,
    });
  } catch (err) {
    console.error("admin settings query failed, serving defaults", err);
    return withStatic({ settings: await staticSettings() }, "local-file");
  }
}

/** PUT /api/admin/settings { key, value } — value may be an object or string. */
export async function PUT(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const key = String(body.key ?? "").trim();
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 });
  const str = typeof body.value === "string" ? body.value : JSON.stringify(body.value ?? {});

  // No database connected → save to the local content store instead of
  // rejecting. This is the path the logo upload takes on a static deploy.
  if (!databaseAvailable) {
    const ok = await saveSettingLocally(key, str);
    if (!ok) {
      return NextResponse.json(
        {
          error:
            "Could not write the local content store — this host has a read-only filesystem. " +
            "Set DATABASE_URL (see NEON_SETUP.md) to save changes here.",
          staticMode: true,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({
      ok: true,
      key,
      persisted: "local-file",
      store: storePath(),
      note: localSaveNote("No database is connected, so this was saved on this server."),
    });
  }

  try {
    await db
      .insert(siteSettings)
      .values({ key, value: str })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: str } });
  } catch (err) {
    console.error("admin settings save failed, falling back to the local store", err);
    // The database is configured but unreachable (paused project, bad
    // credentials, no network). Save locally rather than losing the edit.
    const ok = await saveSettingLocally(key, str);
    if (!ok) {
      return NextResponse.json(
        {
          error:
            "Could not save — the database is not reachable right now and this host has a " +
            "read-only filesystem. Check DATABASE_URL, then save again.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({
      ok: true,
      key,
      persisted: "local-file",
      store: storePath(),
      note: localSaveNote(
        "The database is not reachable right now, so this was saved on this server instead.",
      ),
    });
  }

  return NextResponse.json({ ok: true, key, persisted: "database" });
}

export { FALLBACKS };

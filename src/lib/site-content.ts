// ─────────────────────────────────────────────────────────────────────────────
// Site content resolver — one authoritative answer to "what is on the site?"
// ─────────────────────────────────────────────────────────────────────────────
// Precedence for every setting (the logo included):
//   1. database row (site_settings)          — live/cloud source of truth
//   2. local JSON store (.data/site-content.json) — saves made while the
//      database was unset/unreachable; flushed back to Postgres when it returns
//   3. a drop-in brand file in public/images/sbi-logo.*  — for logoUrl only, so
//      replacing the logo is literally "put the file here"
//   4. DEFAULT_* values in src/lib/cms.ts    — the built-in drawn mark
//
// Public pages used to read the database directly and fall back to the plain
// defaults, which is how the uploaded logo kept getting overridden by the
// built-in artwork. Every page must read through this module instead.
// ─────────────────────────────────────────────────────────────────────────────
import { existsSync } from "fs";
import path from "path";
import { db, databaseAvailable } from "@/db";
import { siteSettings, socialLinks } from "@/db/schema";
import { readStore, clearLocalSettings } from "@/lib/site-store";
import {
  DEFAULT_BRANDING,
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_HERO,
  DEFAULT_SOCIALS,
  DEFAULT_THEME,
  type BrandingSettings,
  type FooterSettings,
  type HeaderSettings,
  type HeroSettings,
  type SocialLink,
  type ThemeSettings,
} from "@/lib/cms";

export type SettingsSource = "database" | "local-file" | "defaults";

/** Brand files checked, in order, when no logo has been saved in Admin. */
const DROP_IN_LOGOS = [
  "images/sbi-logo.png",
  "images/sbi-logo.jpg",
  "images/sbi-logo.jpeg",
  "images/sbi-logo.webp",
  "images/sbi-logo.svg",
  "images/logo.png",
  "images/logo.svg",
];

/** A logo committed to the repo next to the other site images, if present. */
export function dropInLogoUrl(): string | null {
  for (const rel of DROP_IN_LOGOS) {
    try {
      if (existsSync(path.join(process.cwd(), "public", rel))) return rel;
    } catch {
      /* unreadable cwd — ignore */
    }
  }
  return null;
}

export interface SettingsResult {
  settings: Record<string, string>;
  source: SettingsSource;
}

/**
 * Settings map with the local store merged over the database. Local values win
 * because they are written only when the database write failed, i.e. they are
 * the user's most recent intent.
 */
export async function loadSettingsMap(): Promise<SettingsResult> {
  let map: Record<string, string> = {};
  let dbOk = false;

  if (databaseAvailable) {
    try {
      const rows = await db.select().from(siteSettings);
      map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      dbOk = true;
    } catch (err) {
      console.error("[site-content] database settings read failed", err);
    }
  }

  const store = await readStore();
  const localKeys = Object.keys(store.settings);
  if (localKeys.length > 0) {
    map = { ...map, ...store.settings };
    return { settings: map, source: dbOk ? "database" : "local-file" };
  }
  return { settings: map, source: dbOk ? "database" : "defaults" };
}

/** Parse one stored setting over its built-in defaults (same shape as before). */
export function parseSetting<T extends object>(
  settings: Record<string, string>,
  key: string,
  fallback: T,
): T {
  const raw = settings[key];
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

export interface SiteContent {
  branding: BrandingSettings;
  theme: ThemeSettings;
  header: HeaderSettings;
  hero: HeroSettings;
  footer: FooterSettings;
  /** Where the content came from — surfaced in the Admin "live" badge. */
  source: SettingsSource;
}

/**
 * Everything the chrome of every page needs (header, footer, hero, branding).
 * The logo resolution order is: saved setting → drop-in brand file → built-in.
 */
export async function loadSiteContent(): Promise<SiteContent> {
  const { settings, source } = await loadSettingsMap();
  const branding = parseSetting<BrandingSettings>(settings, "branding", DEFAULT_BRANDING);

  if (!branding.logoUrl?.trim()) {
    const dropIn = dropInLogoUrl();
    if (dropIn) branding.logoUrl = dropIn;
  }

  return {
    branding,
    theme: parseSetting<ThemeSettings>(settings, "theme", DEFAULT_THEME),
    header: parseSetting<HeaderSettings>(settings, "header", DEFAULT_HEADER),
    hero: parseSetting<HeroSettings>(settings, "hero", DEFAULT_HERO),
    footer: parseSetting<FooterSettings>(settings, "footer", DEFAULT_FOOTER),
    source,
  };
}

/** Social links for pages that are not the homepage (services, etc.). */
export async function loadSocials(): Promise<SocialLink[]> {
  if (databaseAvailable) {
    try {
      const rows = await db.select().from(socialLinks).orderBy(socialLinks.sortOrder);
      if (rows.length > 0) return (rows as SocialLink[]).filter((s) => s.isVisible);
    } catch (err) {
      console.error("[site-content] social links read failed", err);
    }
  }
  return DEFAULT_SOCIALS.map((s, i) => ({
    id: i + 1,
    ...s,
    sortOrder: i + 1,
    isVisible: true,
  })) as SocialLink[];
}

/**
 * Push locally-saved settings into Postgres once it is reachable again, then
 * drop them from the local store. Called from the admin routes only.
 */
export async function flushLocalSettingsToDatabase(): Promise<boolean> {
  if (!databaseAvailable) return false;
  const store = await readStore();
  const keys = Object.keys(store.settings);
  if (keys.length === 0) return true;
  try {
    for (const key of keys) {
      await db
        .insert(siteSettings)
        .values({ key, value: store.settings[key] })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: store.settings[key] } });
    }
    await clearLocalSettings(keys);
    return true;
  } catch (err) {
    console.error("[site-content] could not flush local settings to the database", err);
    return false;
  }
}

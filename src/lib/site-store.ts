// ─────────────────────────────────────────────────────────────────────────────
// Local content store — makes admin edits (the site logo above all) stick
// even when no database is connected.
// ─────────────────────────────────────────────────────────────────────────────
// Before this module existed, a save from Admin was answered with a 503 when
// DATABASE_URL was unset, so the uploaded logo was silently thrown away and the
// public site kept rendering the built-in drawn mark — the "mock data" override.
//
// The store is a single JSON file (default `.data/site-content.json`, override
// with SBI_DATA_DIR) that holds:
//   • settings — the same `{ key: jsonString }` map as the site_settings table
//   • media    — an index of files uploaded to public/uploads
//
// It is only ever written when no database is configured or a database write
// fails, and it is flushed into the database automatically as soon as the
// database becomes reachable again (see flushLocalSettingsToDatabase).
// ─────────────────────────────────────────────────────────────────────────────
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface StoredMedia {
  id: number;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  createdAt: string;
}

export interface SiteStore {
  settings: Record<string, string>;
  media: StoredMedia[];
}

function emptyStore(): SiteStore {
  return { settings: {}, media: [] };
}

/** Directory that holds the JSON store. */
export function storeDir() {
  return process.env.SBI_DATA_DIR || path.join(process.cwd(), ".data");
}

/** Absolute path of the JSON store file (surfaced in the admin UI). */
export function storePath() {
  return path.join(storeDir(), "site-content.json");
}

/** Read the store; never throws — a missing/corrupt file reads as empty. */
export async function readStore(): Promise<SiteStore> {
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteStore>;
    const settings =
      parsed.settings && typeof parsed.settings === "object" ? parsed.settings : {};
    const media = Array.isArray(parsed.media) ? parsed.media : [];
    return { settings, media };
  } catch {
    return emptyStore();
  }
}

/** Persist the store. Returns false when the filesystem is not writable. */
async function writeStore(store: SiteStore): Promise<boolean> {
  try {
    await mkdir(storeDir(), { recursive: true });
    await writeFile(storePath(), JSON.stringify(store, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[site-store] could not write", storePath(), err);
    return false;
  }
}

/** Save one settings key locally. Returns false when the disk is read-only. */
export async function saveSettingLocally(key: string, value: string): Promise<boolean> {
  const store = await readStore();
  store.settings[key] = value;
  return writeStore(store);
}

/** Drop locally-stored keys (used after they have been flushed to Postgres). */
export async function clearLocalSettings(keys: string[]): Promise<void> {
  const store = await readStore();
  let changed = false;
  for (const key of keys) {
    if (key in store.settings) {
      delete store.settings[key];
      changed = true;
    }
  }
  if (changed) await writeStore(store);
}

/** Index newly uploaded media files. */
export async function addMediaLocally(rows: StoredMedia[]): Promise<boolean> {
  if (rows.length === 0) return true;
  const store = await readStore();
  const known = new Set(store.media.map((m) => m.url));
  store.media = [...rows.filter((r) => !known.has(r.url)), ...store.media];
  return writeStore(store);
}

/** Remove one media entry by id. Returns the removed file url, if any. */
export async function removeMediaLocally(id: number): Promise<string | null> {
  const store = await readStore();
  const hit = store.media.find((m) => m.id === id);
  if (!hit) return null;
  store.media = store.media.filter((m) => m.id !== id);
  await writeStore(store);
  return hit.url;
}

/** Next free id for locally-indexed media. */
export function nextMediaId(store: SiteStore) {
  return store.media.reduce((max, m) => Math.max(max, m.id), 0) + 1;
}

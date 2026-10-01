// ─────────────────────────────────────────────────────────────────────────────
// Admin backend — static (no-database) mode helpers
// ─────────────────────────────────────────────────────────────────────────────
// The storefront already degrades gracefully when DATABASE_URL is unset: the
// public routes (branches, services, executives, cms) guard on
// `databaseAvailable` and serve the built-in catalogue.
//
// The admin routes did NOT, so every authenticated admin GET rejected with a
// 500 and the CMS panel came up empty (and, on a fresh tab, logged you back
// out because the panel probes /api/admin/overview to detect the session).
//
// This module gives the admin routes the same contract as the public ones:
//   • GET      → serve the exact data the storefront is serving, + staticMode
//   • mutations→ 503 with a clear explanation, never an opaque 500
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { databaseAvailable } from "@/db";
import { BRANCHES, TOTAL_NETWORK_BRANCHES } from "@/lib/catalog";
import {
  DEFAULT_BRANDING,
  DEFAULT_FAQS,
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_HERO,
  DEFAULT_SOCIALS,
  DEFAULT_THEME,
} from "@/lib/cms";
import type { Branch } from "@/lib/types";

/** True when no DATABASE_URL is configured — the site runs on built-in data. */
export const staticMode = !databaseAvailable;

export const STATIC_MODE_NOTE =
  "No database is connected yet (DATABASE_URL is not set), so this change cannot be saved. " +
  "Set DATABASE_URL and redeploy to enable saving.";

/** Writes attempted while the backend is offline — a clear 503, never a bare 500. */
export function dbUnavailable() {
  return NextResponse.json({ error: STATIC_MODE_NOTE, staticMode: true }, { status: 503 });
}

/** Wraps a static GET payload so the admin UI can flag read-only mode. */
export function withStatic<T extends object>(payload: T) {
  return NextResponse.json({ ...payload, staticMode: true });
}

/** Settings map in the same shape as `Object.fromEntries(rows.map(r => [r.key, r.value]))`. */
export function staticSettings(): Record<string, string> {
  const json = (value: unknown) => JSON.stringify(value);
  return {
    branding: json(DEFAULT_BRANDING),
    theme: json(DEFAULT_THEME),
    header: json(DEFAULT_HEADER),
    hero: json(DEFAULT_HERO),
    footer: json(DEFAULT_FOOTER),
  };
}

/** FAQs exactly as the storefront renders them in static mode. */
export function staticFaqs() {
  return DEFAULT_FAQS.map((f, i) => ({
    id: i + 1,
    question: f.question,
    answer: f.answer,
    sortOrder: i + 1,
    isVisible: true,
  }));
}

/** Social links exactly as the storefront renders them in static mode. */
export function staticSocials() {
  return DEFAULT_SOCIALS.map((s, i) => ({
    id: i + 1,
    platform: s.platform,
    label: s.label,
    url: s.url,
    sortOrder: i + 1,
    isVisible: true,
  }));
}

/** Branch directory in the same shape as GET /api/branches. */
export function staticBranches(): Branch[] {
  return BRANCHES.map((b, i) => ({
    ...b,
    id: i + 1,
    isHq: b.isHq ?? false,
    notes: b.notes ?? null,
  })) as Branch[];
}

/** Dashboard counters for the no-database state. */
export function staticCounts() {
  return {
    branches: BRANCHES.length,
    bookings: 0,
    sections: 0,
    faqs: DEFAULT_FAQS.length,
    socials: DEFAULT_SOCIALS.length,
    media: 0,
  };
}

/** Backend banner for the admin dashboard. */
export function staticBackend() {
  return {
    provider: "Static mode (no database connected)",
    host: "unconfigured",
    ssl: "n/a",
    orm: "Drizzle ORM (idle)",
    tables: [
      "branches",
      "executives",
      "services",
      "bookings",
      "site_settings",
      "content_sections",
      "faqs",
      "social_links",
      "media_assets",
    ],
    docs: "NEON_SETUP.md",
    networkBranches: TOTAL_NETWORK_BRANCHES,
  };
}

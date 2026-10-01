import { NextResponse } from "next/server";
import { db, databaseAvailable } from "@/db";
import { contentSections, faqs, socialLinks } from "@/db/schema";
import {
  DEFAULT_BRANDING,
  DEFAULT_FAQS,
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_HERO,
  DEFAULT_SOCIALS,
  DEFAULT_THEME,
  type BrandingSettings,
  type FooterSettings,
  type HeaderSettings,
  type HeroSettings,
  type ThemeSettings,
} from "@/lib/cms";
import { dropInLogoUrl, loadSettingsMap, parseSetting } from "@/lib/site-content";

export const dynamic = "force-dynamic";

/** GET /api/cms — everything the storefront needs: theme, header, hero, footer, sections, faqs, socials. */
export async function GET() {
  // Settings resolve exactly like the pages do (database → local store →
  // drop-in logo → defaults), so this endpoint can never disagree with the site.
  const { settings: map, source } = await loadSettingsMap();
  const branding = parseSetting<BrandingSettings>(map, "branding", DEFAULT_BRANDING);
  if (!branding.logoUrl?.trim()) {
    const dropIn = dropInLogoUrl();
    if (dropIn) branding.logoUrl = dropIn;
  }

  /** Sections/FAQs/socials as the storefront shows them with no database. */
  const fallback = {
    sections: [] as unknown[],
    faqs: DEFAULT_FAQS.map((f, i) => ({ id: i + 1, ...f, sortOrder: i + 1, isVisible: true })),
    socials: DEFAULT_SOCIALS.map((s, i) => ({ id: i + 1, ...s, sortOrder: i + 1, isVisible: true })),
  };

  // No database: never fire a query that is guaranteed to fail (it used to log
  // a full stack trace on every call) — answer with the built-in content.
  if (!databaseAvailable) {
    return NextResponse.json({
      branding,
      theme: parseSetting<ThemeSettings>(map, "theme", DEFAULT_THEME),
      header: parseSetting<HeaderSettings>(map, "header", DEFAULT_HEADER),
      hero: parseSetting<HeroSettings>(map, "hero", DEFAULT_HERO),
      footer: parseSetting<FooterSettings>(map, "footer", DEFAULT_FOOTER),
      ...fallback,
      dataSource: source,
    });
  }

  try {
    const [sections, faqRows, socialRows] = await Promise.all([
      db.select().from(contentSections).orderBy(contentSections.sortOrder),
      db.select().from(faqs).orderBy(faqs.sortOrder),
      db.select().from(socialLinks).orderBy(socialLinks.sortOrder),
    ]);
    return NextResponse.json({
      branding,
      theme: parseSetting<ThemeSettings>(map, "theme", DEFAULT_THEME),
      header: parseSetting<HeaderSettings>(map, "header", DEFAULT_HEADER),
      hero: parseSetting<HeroSettings>(map, "hero", DEFAULT_HERO),
      footer: parseSetting<FooterSettings>(map, "footer", DEFAULT_FOOTER),
      sections: sections.filter((s) => s.isVisible),
      faqs: faqRows.filter((f) => f.isVisible),
      socials: socialRows.filter((s) => s.isVisible),
      dataSource: source,
    });
  } catch (err) {
    console.error("cms aggregate failed", err);
    return NextResponse.json({
      branding,
      theme: parseSetting<ThemeSettings>(map, "theme", DEFAULT_THEME),
      header: parseSetting<HeaderSettings>(map, "header", DEFAULT_HEADER),
      hero: parseSetting<HeroSettings>(map, "hero", DEFAULT_HERO),
      footer: parseSetting<FooterSettings>(map, "footer", DEFAULT_FOOTER),
      ...fallback,
      dataSource: source,
    });
  }
}

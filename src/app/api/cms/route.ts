import { NextResponse } from "next/server";
import { db } from "@/db";
import { contentSections, faqs, siteSettings, socialLinks } from "@/db/schema";
import {
  DEFAULT_BRANDING,
  DEFAULT_FAQS,
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_HERO,
  DEFAULT_SOCIALS,
  DEFAULT_THEME,
} from "@/lib/cms";

export const dynamic = "force-dynamic";

function parse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

/** GET /api/cms — everything the storefront needs: theme, header, hero, footer, sections, faqs, socials. */
export async function GET() {
  try {
    const [settings, sections, faqRows, socialRows] = await Promise.all([
      db.select().from(siteSettings),
      db.select().from(contentSections).orderBy(contentSections.sortOrder),
      db.select().from(faqs).orderBy(faqs.sortOrder),
      db.select().from(socialLinks).orderBy(socialLinks.sortOrder),
    ]);
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return NextResponse.json({
      branding: parse(map.branding, DEFAULT_BRANDING),
      theme: parse(map.theme, DEFAULT_THEME),
      header: parse(map.header, DEFAULT_HEADER),
      hero: parse(map.hero, DEFAULT_HERO),
      footer: parse(map.footer, DEFAULT_FOOTER),
      sections: sections.filter((s) => s.isVisible),
      faqs: faqRows.filter((f) => f.isVisible),
      socials: socialRows.filter((s) => s.isVisible),
    });
  } catch (err) {
    console.error("cms aggregate failed", err);
    return NextResponse.json({
      branding: DEFAULT_BRANDING,
      theme: DEFAULT_THEME,
      header: DEFAULT_HEADER,
      hero: DEFAULT_HERO,
      footer: DEFAULT_FOOTER,
      sections: [],
      faqs: DEFAULT_FAQS.map((f, i) => ({ id: i + 1, ...f, sortOrder: i + 1, isVisible: true })),
      socials: DEFAULT_SOCIALS.map((s, i) => ({
        id: i + 1,
        ...s,
        sortOrder: i + 1,
        isVisible: true,
      })),
    });
  }
}

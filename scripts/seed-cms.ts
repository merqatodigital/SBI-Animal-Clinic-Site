import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { contentSections, faqs, siteSettings, socialLinks } from "../src/db/schema";
import {
  DEFAULT_FAQS,
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_HERO,
  DEFAULT_SECTIONS,
  DEFAULT_SOCIALS,
  DEFAULT_THEME,
} from "../src/lib/cms";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.DATABASE_URL?.includes("neon.tech")
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});
const db = drizzle(pool);

async function upsertSetting(key: string, value: unknown) {
  const str = typeof value === "string" ? value : JSON.stringify(value);
  await db
    .insert(siteSettings)
    .values({ key, value: str })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: str } });
}

async function main() {
  await upsertSetting("theme", DEFAULT_THEME);
  await upsertSetting("header", DEFAULT_HEADER);
  await upsertSetting("hero", DEFAULT_HERO);
  await upsertSetting("footer", DEFAULT_FOOTER);

  for (let i = 0; i < DEFAULT_SECTIONS.length; i++) {
    const s = DEFAULT_SECTIONS[i];
    await db
      .insert(contentSections)
      .values({ ...s, sortOrder: i + 1, isVisible: true })
      .onConflictDoUpdate({
        target: contentSections.slug,
        set: { ...s, sortOrder: i + 1 },
      });
  }

  const existingFaqs = await db.select({ id: faqs.id }).from(faqs).limit(1);
  if (existingFaqs.length === 0) {
    await db.insert(faqs).values(
      DEFAULT_FAQS.map((f, i) => ({ ...f, sortOrder: i + 1, isVisible: true })),
    );
  }

  const existingSocials = await db.select({ id: socialLinks.id }).from(socialLinks).limit(1);
  if (existingSocials.length === 0) {
    await db.insert(socialLinks).values(
      DEFAULT_SOCIALS.map((s, i) => ({ ...s, sortOrder: i + 1, isVisible: true })),
    );
  }

  console.log("CMS seed complete: settings, sections, faqs, socials.");
}

main()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });

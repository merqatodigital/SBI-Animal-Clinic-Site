import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  region: text("region").notNull(), // NCR | Luzon | Visayas | Mindanao
  province: text("province"),
  city: text("city").notNull(),
  address: text("address").notNull(),
  contact: text("contact"), // null == not yet published
  email: text("email"),
  hours: text("hours"), // null == not yet published
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  isHq: boolean("is_hq").notNull().default(false),
  notes: text("notes"),
});

export const executives = pgTable("executives", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  credential: text("credential"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  group: text("group").notNull(), // Active Vaccines | Passive Rabies Defenses | Anti-Tetanus Biologics | Clinical Services
  application: text("application").notNull(),
  regimen: text("regimen"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  patientName: text("patient_name").notNull(),
  contactNumber: text("contact_number").notNull(),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id),
  exposureCategory: text("exposure_category").notNull(), // I | II | III
  animalType: text("animal_type").notNull(), // Dog | Cat | Other
  isPhilhealthMember: boolean("is_philhealth_member").notNull().default(false),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  indication: text("indication").notNull(),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── CMS / Admin control tables (Neon-ready, same Postgres dialect) ───────────
// Key-value store for theme, header, hero, footer and global copy.
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Flexible page sections: hero, locator intro, triage, services, philhealth,
// about, faq, custom blocks… Admin can add / edit / delete / reorder / hide.
export const contentSections = pgTable("content_sections", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  eyebrow: text("eyebrow"),
  title: text("title").notNull(),
  body: text("body"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Multiple social profiles allowed per platform (e.g. 2 Facebook pages).
export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(), // facebook | messenger | instagram | tiktok | youtube | x | viber | website | email | phone | other
  label: text("label"),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Device uploads (images + videos) usable in every part of the site.
export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull().default(0),
  kind: text("kind").notNull().default("image"), // image | video | other
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

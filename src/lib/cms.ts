// Central CMS defaults + types. DB values override these at runtime.
export interface ThemeSettings {
  navy: string;
  navyDeep: string;
  ink: string;
  cyan: string;
  cyanDeep: string;
  cyanSoft: string;
  alert: string;
  alertDeep: string;
  paper: string;
  hair: string;
  steel: string;
  leaf: string;
  fontDisplay: string;
  fontBody: string;
  baseFontSize: number;
}

/** One uploaded brand mark shared by the public header/footer and optional hero badge. */
export interface BrandingSettings {
  logoUrl: string;
  showHeroLogo: boolean;
}

export interface HeaderSettings {
  bannerText: string;
  phone: string;
  phoneHref: string;
  ctaLabel: string;
}

export interface HeroSettings {
  eyebrow: string;
  line1: string;
  line2: string;
  line3: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  imageUrl: string;
  videoUrl: string;
  hotline: string;
  email: string;
}

export interface FooterSettings {
  about: string;
  address: string;
  phone: string;
  email: string;
  taglineA: string;
  taglineB: string;
  developerName: string;
  developerUrl: string;
  developerTagline: string;
}

export interface CmsSection {
  id: number;
  slug: string;
  eyebrow: string | null;
  title: string;
  body: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface SocialLink {
  id: number;
  platform: string;
  label: string | null;
  url: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface MediaAsset {
  id: number;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  createdAt: string;
}

export const DEFAULT_THEME: ThemeSettings = {
  navy: "#0A3D7A",
  navyDeep: "#06254A",
  ink: "#04182F",
  cyan: "#00AEEF",
  cyanDeep: "#0077A8",
  cyanSoft: "#D7F2FD",
  alert: "#E31E24",
  alertDeep: "#A8141A",
  paper: "#F8F9FA",
  hair: "#DCE5EF",
  steel: "#5A7599",
  leaf: "#12833F",
  fontDisplay: "Plus Jakarta Sans",
  fontBody: "Inter",
  baseFontSize: 16,
};

export const DEFAULT_BRANDING: BrandingSettings = {
  // Upload the clinic artwork in Admin to replace the built-in SVG mark.
  logoUrl: "",
  showHeroLogo: false,
};

export const DEFAULT_HEADER: HeaderSettings = {
  bannerText:
    "Wash wound with soap and running water for 15 minutes. Seek care immediately.",
  phone: "0928 605 2684",
  phoneHref: "tel:09286052684",
  ctaLabel: "Find Nearest Branch",
};

export const DEFAULT_HERO: HeroSettings = {
  eyebrow: "00 / Animal bite centre · since 2010",
  line1: "Rabies is",
  line2: "100% preventable.",
  line3: "Care beyond compare.",
  description:
    "SBI Medical & Animal Bite Center & Vaccination Clinic runs a 23-branch nationwide network of DOH-certified post-exposure prophylaxis sites — from Manggahan, Pasig to Gingoog, Misamis Oriental — under one standardized PEP algorithm.",
  primaryLabel: "Find nearest branch",
  secondaryLabel: "Start triage & book",
  imageUrl: "images/hero-wide.jpg",
  videoUrl: "",
  hotline: "0928 605 2684",
  email: "sbimedicalanimalbitecenter@gmail.com",
};

export const DEFAULT_FOOTER: FooterSettings = {
  about:
    "SBI Medical & Animal Bite Center & Vaccination Clinic — a DOH-certified, PhilHealth-accredited network of animal bite centers and vaccination clinics serving the Philippines since 2010.",
  address: "Lot 19, Blk 2 Langhaya, NHA Ave, Brgy. Dela Paz, Antipolo City",
  phone: "0928 605 2684",
  email: "sbimedicalanimalbitecenter@gmail.com",
  taglineA: "SBI Care",
  taglineB: "Beyond Compare",
  developerName: "SBI Digital Studio",
  developerUrl: "https://sbimedical.example.com",
  developerTagline: "Designed & engineered for care beyond compare.",
};

export const FONT_CHOICES = [
  "Inter",
  "Plus Jakarta Sans",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Nunito",
  "Work Sans",
  "IBM Plex Sans",
  "Merriweather",
  "Georgia",
];

export const SOCIAL_PLATFORMS = [
  "facebook",
  "messenger",
  "instagram",
  "tiktok",
  "youtube",
  "x",
  "viber",
  "telegram",
  "whatsapp",
  "website",
  "email",
  "phone",
  "other",
] as const;

export const DEFAULT_SECTIONS: Array<{
  slug: string;
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  videoUrl: string;
  ctaLabel: string;
  ctaHref: string;
}> = [
  {
    slug: "locator",
    eyebrow: "01 / Branch locator",
    title: "23 branches. One archipelago-wide standard of care.",
    body: "NCR · Luzon · Visayas · Mindanao. Every branch runs the same DOH Post-Exposure Prophylaxis algorithm, from Manggahan to Gingoog.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "Use my location",
    ctaHref: "#locator",
  },
  {
    slug: "triage",
    eyebrow: "02 / Triage",
    title: "Patient triage",
    body: "Four steps. Under a minute. A reference number is issued instantly. Category III flips the panel urgent red.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "Start triage",
    ctaHref: "#triage",
  },
  {
    slug: "services",
    eyebrow: "03 / Cold-chain inventory",
    title: "Every SKU a bite center must stock — and when it is given.",
    body: "All branches run the same DOH Post-Exposure Prophylaxis protocol: wound management first, then passive immunoglobulin where the skin is breached, then the active multi-dose vaccine schedule to Day 21/28.",
    imageUrl: "images/cold-chain.jpg",
    videoUrl: "",
    ctaLabel: "",
    ctaHref: "",
  },
  {
    slug: "philhealth",
    eyebrow: "04 / Coverage",
    title: "PhilHealth Animal Bite Package. Zero cash for the three baseline doses.",
    body: "SBI is listed as an accredited Animal Bite Package Provider (ABPP) in the PhilHealth CY 2026 accredited provider lists. Members clear the package at the branch.",
    imageUrl: "",
    videoUrl: "",
    ctaLabel: "",
    ctaHref: "",
  },
  {
    slug: "about",
    eyebrow: "05 / About us",
    title: "Established 2010. A clinic built around one preventable disease.",
    body: "SBI began as a single animal bite centre in Antipolo City, directly across from Antipolo District Hospital. Sixteen years later the network spans NCR, Rizal, Palawan, Samar, Leyte and Misamis Oriental.",
    imageUrl: "images/clinic-interior.jpg",
    videoUrl: "",
    ctaLabel: "",
    ctaHref: "",
  },
  {
    slug: "first-aid",
    eyebrow: "Immediate first aid · the first 15 minutes",
    title: "What to do before you reach any of our branches.",
    body: "Wash thoroughly · Apply antiseptic · Seek care fast. Rabies is 100% fatal once clinical symptoms start.",
    imageUrl: "images/first-aid-wash.jpg",
    videoUrl: "",
    ctaLabel: "Find nearest branch",
    ctaHref: "#locator",
  },
];

export const DEFAULT_FAQS = [
  {
    question: "I was just bitten. What do I do in the first 15 minutes?",
    answer:
      "Wash the wound immediately with soap and running water for at least 15 minutes, apply antiseptic, cover loosely — then go to the nearest certified animal bite center. Do not wait for symptoms: rabies is fatal once they appear.",
  },
  {
    question: "Do I need a vaccine for a Category I exposure?",
    answer:
      "No. Touching or feeding animals and licks on intact skin need washing and observation only — no anti-rabies vaccine or immunoglobulin. Book a consult only if you want reassurance.",
  },
  {
    question: "What is the difference between Category II and Category III?",
    answer:
      "Category II (nibbling, minor scratches without bleeding) needs active vaccine prophylaxis (PVRV/PCEC). Category III (bites that break skin, scratches that bleed, licks on broken skin) is urgent: it needs ERIG/HRIG immunoglobulin infiltrated into the wound plus the full vaccine series.",
  },
  {
    question: "I am a PhilHealth member. What is covered?",
    answer:
      "The Animal Bite Package covers wound consultation, post-exposure and pre-exposure anti-rabies treatment, and anti-tetanus shots (TT, ATS, HTIG) — zero cash or highly subsidised clearing of the 3 baseline active doses. Bring your PhilHealth PIN and one valid ID.",
  },
  {
    question: "Do I need an appointment, or can I walk in?",
    answer:
      "Walk-ins with fresh bites are always prioritised — especially Category III. Booking online reserves your slot and issues a reference (SBI-YYYY-XXXX) so reception can triage you faster.",
  },
  {
    question: "Which animals should I worry about?",
    answer:
      "Dogs and cats cause almost all Philippine exposures, but monkeys, bats and rodents also count. Tell the physician the species, whether it was a pet or stray, and its vaccination status if known.",
  },
];

export const DEFAULT_SOCIALS = [
  { platform: "facebook", label: "SBI Medical & Animal Bite Center", url: "https://facebook.com/sbimedical" },
  { platform: "messenger", label: "Chat with us", url: "https://m.me/sbimedical" },
  { platform: "youtube", label: "Rabies awareness videos", url: "https://youtube.com/@sbimedical" },
  { platform: "tiktok", label: "First-aid shorts", url: "https://tiktok.com/@sbimedical" },
  { platform: "instagram", label: "Clinic life", url: "https://instagram.com/sbimedical" },
];

export const BUILDER_PASSKEY = "5309";

export function getAdminPasskey() {
  return process.env.ADMIN_PASSKEY || BUILDER_PASSKEY;
}

/** While building, BOTH the env passkey and the builder code 5309 are accepted. */
export function isValidAdminPasskey(input: unknown) {
  const v = String(input ?? "").trim();
  if (!v) return false;
  if (v === BUILDER_PASSKEY) return true;
  try {
    const env = process.env.ADMIN_PASSKEY;
    if (env && v === env) return true;
  } catch {
    /* ignore */
  }
  // getAdminPasskey() already falls back to 5309, so this covers custom env too.
  return v === getAdminPasskey();
}

export type Region = "NCR" | "Luzon" | "Visayas" | "Mindanao";

export interface BranchSeed {
  slug: string;
  name: string;
  region: Region;
  province: string;
  city: string;
  address: string;
  contact: string | null;
  email: string | null;
  hours: string | null;
  latitude: number;
  longitude: number;
  isHq?: boolean;
  notes?: string;
}

/** All published SBI Medical & Animal Bite Center branches (source of truth for seed + API). */
export const BRANCHES: BranchSeed[] = [
  // ── National Capital Region ────────────────────────────────────────────────
  {
    slug: "pasig-manggahan",
    name: "Pasig City Branch (Manggahan)",
    region: "NCR",
    province: "Metro Manila",
    city: "Pasig City",
    address: "3011 Kaginhawaan Street, Manggahan, Pasig City",
    contact: "0947 885 3248",
    email: null,
    hours: "8:00 AM – 5:00 PM (Mon–Sun)",
    latitude: 14.5607,
    longitude: 121.1011,
  },
  {
    slug: "marikina",
    name: "Marikina Branch",
    region: "NCR",
    province: "Metro Manila",
    city: "Marikina City",
    address:
      "J.P. Rizal St., Concepcion Uno, Marikina City (In front of Autism Therapy Center)",
    contact: "0921 265 1001",
    email: null,
    hours: "8:00 AM – 8:00 PM (Mon–Sun)",
    latitude: 14.6483,
    longitude: 121.0966,
  },
  {
    slug: "novaliches-qc",
    name: "Novaliches, Quezon City Branch (Nova QC)",
    region: "NCR",
    province: "Metro Manila",
    city: "Quezon City",
    address: "Blk 6, Lot 10, St. Jude St., Novaliches, Quezon City",
    contact: "0908 563 5818",
    email: "sbiabcnovaqc@gmail.com",
    hours: "8:00 AM – 8:00 PM (Mon–Sun)",
    latitude: 14.7103,
    longitude: 121.0447,
  },
  {
    slug: "batasan-qc",
    name: "Batasan (QC) Branch",
    region: "NCR",
    province: "Metro Manila",
    city: "Quezon City",
    address: "Brgy. Holy Spirit, Quezon City",
    contact: null,
    email: null,
    hours: null,
    latitude: 14.6899,
    longitude: 121.0946,
  },

  // ── Luzon: Rizal Province & Palawan ────────────────────────────────────────
  {
    slug: "antipolo-main",
    name: "Antipolo Main Branch (HQ)",
    region: "Luzon",
    province: "Rizal",
    city: "Antipolo City",
    address:
      "Lot 19, Blk 2 Langhaya, NHA Ave, Brgy. Dela Paz, Antipolo City (In front of Antipolo District Hospital)",
    contact: "0998 867 7234 / 7005-4671",
    email: "sbimedicalanimalbitecenter@gmail.com",
    hours: "9:00 AM – 5:00 PM (Mon–Sun)",
    latitude: 14.5881,
    longitude: 121.1784,
    isHq: true,
    notes: "Corporate headquarters & main treatment hub.",
  },
  {
    slug: "boso-boso-antipolo",
    name: "Boso-Boso Antipolo Branch",
    region: "Luzon",
    province: "Rizal",
    city: "Antipolo City",
    address:
      "Inside SBI Lying In & Wellness Center, Boso-Boso Road, Sitio Malaking Parang, Brgy. San Jose, Antipolo City",
    contact: null,
    email: null,
    hours: "8:00 AM – 10:00 PM (Mon–Sun)",
    latitude: 14.5244,
    longitude: 121.2302,
  },
  {
    slug: "rodriguez-montalban",
    name: "Rodriguez Branch (Montalban)",
    region: "Luzon",
    province: "Rizal",
    city: "Rodriguez",
    address: "28 A. Mabini St, Rodriguez, Rizal",
    contact: "0998 867 7235 / 7000-6702",
    email: "sbianimalbietuborgosbranch@gmail.com",
    hours: "8:00 AM – 10:00 PM (Mon–Sun)",
    latitude: 14.7334,
    longitude: 121.1251,
  },
  {
    slug: "morong-rizal",
    name: "Morong Branch",
    region: "Luzon",
    province: "Rizal",
    city: "Morong",
    address:
      "81 Tomas Claudio St., Manila East Road, Morong, Rizal (Beside Palawan Pawnshop and Super 8)",
    contact: null,
    email: null,
    hours: "8:00 AM – 8:00 PM (Mon–Sun)",
    latitude: 14.5112,
    longitude: 121.2346,
  },
  {
    slug: "puerto-princesa",
    name: "Puerto Princesa Branch (Palawan)",
    region: "Luzon",
    province: "Palawan",
    city: "Puerto Princesa City",
    address: "SJD Center, San Pedro, Puerto Princesa City, Palawan",
    contact: null,
    email: null,
    hours: null,
    latitude: 9.7401,
    longitude: 118.7354,
  },

  // ── Visayas: Samar & Leyte ─────────────────────────────────────────────────
  {
    slug: "calbayog",
    name: "Calbayog City Branch",
    region: "Visayas",
    province: "Samar",
    city: "Calbayog City",
    address: "2nd Floor, National Highway, P-4, Brgy. Capoocan, Calbayog City, Samar",
    contact: "0949 696 2214",
    email: "sbimedical.abc.calbayog@gmail.com",
    hours: "8:00 AM – 5:00 PM (Mon–Sun)",
    latitude: 12.0607,
    longitude: 124.6005,
  },
  {
    slug: "tacloban-marasbaras",
    name: "Tacloban Branch (Marasbaras)",
    region: "Visayas",
    province: "Leyte",
    city: "Tacloban City",
    address: "Brgy 80 Marasbaras, Tacloban City, Leyte",
    contact: "9956140451",
    email: "sbianimalbitecentervaccination@gmail.com",
    hours: null,
    latitude: 11.2403,
    longitude: 125.0021,
  },
  {
    slug: "ormoc",
    name: "Ormoc Branch",
    region: "Visayas",
    province: "Leyte",
    city: "Ormoc City",
    address: "AMC Space Rental, Barangay Cogon, Ormoc City, Leyte",
    contact: "9608212251",
    email: "sbimedicalormoc.abc@gmail.com",
    hours: null,
    latitude: 11.0851,
    longitude: 124.6111,
  },
  {
    slug: "basey",
    name: "Basey Branch",
    region: "Visayas",
    province: "Samar",
    city: "Basey",
    address: "Basey, Samar",
    contact: null,
    email: null,
    hours: null,
    latitude: 11.3008,
    longitude: 125.0606,
  },

  // ── Mindanao: Northern Mindanao ────────────────────────────────────────────
  {
    slug: "balingasag",
    name: "Balingasag Branch",
    region: "Mindanao",
    province: "Misamis Oriental",
    city: "Balingasag",
    address: "15 De Septiembre St., Balingasag, Misamis Oriental",
    contact: "9543992280",
    email: "sbimedicalbalingasag@gmail.com",
    hours: null,
    latitude: 8.7446,
    longitude: 124.7903,
    notes: "Branch led by Dr. Dixie Glenn J. Dy.",
  },
  {
    slug: "gingoog",
    name: "Gingoog Branch",
    region: "Mindanao",
    province: "Misamis Oriental",
    city: "Gingoog City",
    address: "Motoomull St., Gingoog City, Misamis Oriental",
    contact: "9369443678",
    email: "sbimedicalgingoog@gmail.com",
    hours: null,
    latitude: 8.8303,
    longitude: 125.0994,
  },
  {
    slug: "el-salvador",
    name: "El Salvador Branch",
    region: "Mindanao",
    province: "Misamis Oriental",
    city: "El Salvador",
    address: "El Salvador, Misamis Oriental",
    contact: null,
    email: null,
    hours: null,
    latitude: 8.5703,
    longitude: 124.5208,
  },
  {
    slug: "cagayan-de-oro",
    name: "Cagayan de Oro City (CDO) Branch",
    region: "Mindanao",
    province: "Misamis Oriental",
    city: "Cagayan de Oro City",
    address: "Cagayan de Oro, Misamis Oriental",
    contact: null,
    email: null,
    hours: null,
    latitude: 8.4803,
    longitude: 124.6477,
  },
  {
    slug: "tagoloan",
    name: "Tagoloan Branch",
    region: "Mindanao",
    province: "Misamis Oriental",
    city: "Tagoloan",
    address: "Tagoloan, Misamis Oriental",
    contact: null,
    email: null,
    hours: null,
    latitude: 8.5406,
    longitude: 124.7553,
    notes:
      "Part of the Mindanao footprint referenced in the operational database; operates under a nearby municipal designation — no standalone PhilHealth accreditation entry found.",
  },
];

export const EXECUTIVES = [
  {
    name: "Sofhel Belleza-Ilao, RN, RM",
    role: "Chief Executive Officer",
    credential: "RN, RM",
    sortOrder: 1,
  },
  {
    name: "Dr. Dixie Glenn J. Dy",
    role: "Lead Physician",
    credential: "Medical Director · leads the Balingasag branch",
    sortOrder: 2,
  },
  {
    name: "Mevel V. Juno, RN",
    role: "Executive Secretary",
    credential: "RN",
    sortOrder: 3,
  },
  {
    name: "Christian Jade Y. Samson",
    role: "HR & Admin Manager",
    credential: "Human Resources & Administration",
    sortOrder: 4,
  },
];

export interface ServiceSeed {
  sku: string;
  name: string;
  group: string;
  application: string;
  regimen: string | null;
  sortOrder: number;
}

export const SERVICES: ServiceSeed[] = [
  {
    sku: "PVRV-IM",
    name: "Purified Vero Cell Rabies Vaccine (PVRV)",
    group: "Active Vaccines",
    application:
      "Tissue-culture anti-rabies vaccine given as deep intramuscular or intradermal multi-dose prophylaxis.",
    regimen: "Day 0 · Day 3 · Day 7 · Day 21/28",
    sortOrder: 1,
  },
  {
    sku: "PCEC-ID",
    name: "Purified Chick Embryo Cell Vaccine (PCEC)",
    group: "Active Vaccines",
    application:
      "Alternative active vaccine for post-exposure and pre-exposure prophylaxis across all age groups.",
    regimen: "Day 0 · Day 3 · Day 7 · Day 21/28",
    sortOrder: 2,
  },
  {
    sku: "ERIG-150",
    name: "Equine Rabies Immunoglobulin (ERIG)",
    group: "Passive Rabies Defenses",
    application:
      "Passive immunoglobulin infiltrated into and around the wound for complex skin-breaching Category III exposures.",
    regimen: "Day 0, once — at the full 20 IU/kg wound-infiltration dose",
    sortOrder: 3,
  },
  {
    sku: "HRIG-20",
    name: "Human Rabies Immunoglobulin (HRIG)",
    group: "Passive Rabies Defenses",
    application:
      "Human-derived passive immunoglobulin for Category III wounds where ERIG is not indicated or available.",
    regimen: "Day 0, once — up to half infiltrated, half intramuscular",
    sortOrder: 4,
  },
  {
    sku: "TT-TOXOID",
    name: "Tetanus Toxoid (TT)",
    group: "Anti-Tetanus Biologics",
    application: "Routine tetanus prophylaxis for contaminated bites and scratches.",
    regimen: "Dose 1 at consultation · booster schedule per physician",
    sortOrder: 5,
  },
  {
    sku: "ATS-SERUM",
    name: "Anti-Tetanus Serum (ATS)",
    group: "Anti-Tetanus Biologics",
    application: "Passive tetanus protection for wound-prone exposures.",
    regimen: "Single dose, intramuscular, with sensitivity test",
    sortOrder: 6,
  },
  {
    sku: "HTIG",
    name: "Human Tetanus Immunoglobulin (HTIG)",
    group: "Anti-Tetanus Biologics",
    application: "Human-derived passive tetanus defence for high-risk wounds.",
    regimen: "Single dose, intramuscular",
    sortOrder: 7,
  },
  {
    sku: "WOUND-PEP",
    name: "Wound Management & PEP Consultation",
    group: "Clinical Services",
    application:
      "Surgical-level cleansing, chemical disinfection of tissue and DOH Post-Exposure Prophylaxis algorithm assessment.",
    regimen: "Day 0 — immediately upon arrival",
    sortOrder: 8,
  },
  {
    sku: "PREP-PRV",
    name: "Pre-Exposure Prophylaxis (PrEP)",
    group: "Clinical Services",
    application:
      "Preventive vaccination schedule for veterinarians, handlers, field workers and travelers.",
    regimen: "Day 0 · Day 7 · Day 21–28",
    sortOrder: 9,
  },
];

export const EXPOSURE = {
  I: {
    label: "Category I",
    title: "Touching or feeding animals · licks on intact skin",
    requirement: "No vaccine requirement",
    tone: "safe" as const,
    action:
      "Wash the area with soap and running water and monitor. No anti-rabies vaccine or immunoglobulin is required. Book a consult only if you want reassurance or education.",
    medicines: [] as string[],
  },
  II: {
    label: "Category II",
    title: "Nibbling of uncovered skin · minor scratches or abrasions without bleeding",
    requirement: "Requires immediate Active Vaccine Prophylaxis",
    tone: "caution" as const,
    action:
      "Start active anti-rabies vaccination (PVRV/PCEC) immediately on Day 0. Complete the Day 3, Day 7 and Day 21/28 doses.",
    medicines: ["PVRV or PCEC — Day 0, 3, 7, 21/28", "Anti-tetanus assessment (TT/ATS/HTIG)"],
  },
  III: {
    label: "Category III",
    title:
      "Single or multiple transdermal bites or scratches · licks on broken skin · mucous membrane contamination with saliva",
    requirement:
      "Requires immediate Passive Rabies Immunoglobulin + Active Vaccines",
    tone: "urgent" as const,
    action:
      "URGENT: infiltrate ERIG/HRIG into and around the wound, then start active vaccination (PVRV/PCEC) at the wound and intramuscular sites on Day 0. See a certified animal bite centre now.",
    medicines: [
      "ERIG or HRIG — Day 0, wound infiltration",
      "PVRV or PCEC — Day 0, 3, 7, 21/28",
      "Anti-tetanus prophylaxis — TT / ATS / HTIG",
      "Wound management & surgical cleansing",
    ],
  },
} as const;

export type ExposureKey = keyof typeof EXPOSURE;

export const TOTAL_NETWORK_BRANCHES = 23;

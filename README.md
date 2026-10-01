# SBI Medical — Animal Bite Center & Vaccination Clinic

Official website of **SBI Medical & Animal Bite Center** — urgent animal-bite triage, first aid, and rabies post-exposure prophylaxis (PEP) across a **23-branch nationwide network** in NCR, Luzon, Visayas and Mindanao. DOH-certified and PhilHealth Animal Bite Package accredited since 2010.

> **Care Beyond Compare.** Rabies is 100% preventable — wash for 15 minutes and seek care immediately.

---

## Features

- **Branch locator** — interactive OpenStreetMap (Leaflet) of the 23-branch network with region/city search, distance-from-you and per-branch contact details
- **Triage wizard** — DOH exposure-category (I / II / III) intake flow with animal-type, PhilHealth membership and appointment booking
- **SKU catalogue** — full anti-rabies inventory: PVRV/PCEC vaccines, ERIG/HRIG immunoglobulins, TT/ATS/HTIG tetanus biologics and wound-care items
- **PhilHealth section** — accreditation and Animal Bite Package information
- **Custom CMS** — theme, header, hero, footer, content sections, FAQs and social links editable from a built-in admin panel; upload one site logo for header/footer and optionally the hero
- **Runs frontend-only** — the site serves its full built-in catalogue with **no database required**; connect Postgres/Neon later to make data live (see *Database (optional)* below)

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, Route Handlers) |
| UI | React 19 + [Tailwind CSS v4](https://tailwindcss.com) + [Framer Motion](https://www.framer.com/motion) |
| Maps | [Leaflet](https://leafletjs.com) (OpenStreetMap tiles, SSR-safe) |
| Icons | [lucide-react](https://lucide.dev) |
| Language | TypeScript (strict) |
| Database | PostgreSQL via `pg` + [Drizzle ORM](https://orm.drizzle.team) — **optional** (Neon-ready) |
| Lint | ESLint 9 (flat config) + `eslint-config-next` core-web-vitals |

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

That's it — no database needed. The homepage, services catalogue, branch locator, triage wizard and public APIs all run from the built-in catalogue.

Other scripts:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (what Vercel runs) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Environment variables

All optional for the frontend.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | No | Postgres/Neon connection string. When unset the site runs in **static mode** on built-in data. |
| `ADMIN_PASSKEY` | No | Passkey for the admin panel. Defaults to `5309` (change for production). |
| `UPLOAD_DIR` | No | Where uploaded media is stored. Defaults to `public/uploads/`. |

## Project structure

```
├── NEON_SETUP.md               # Deploy guide for Neon (neon.com) + Vercel
├── drizzle.config.json         # Drizzle Kit configuration
├── scripts/
│   ├── seed.ts                 # Seed branches / executives / services (23-branch network)
│   └── seed-cms.ts             # Seed theme, header, hero, footer, sections, FAQs, socials
└── src/
    ├── app/
    │   ├── layout.tsx          # Root layout, SEO metadata, fonts
    │   ├── page.tsx            # Homepage (hero, locator, triage, services, PhilHealth, FAQ…)
    │   ├── services/page.tsx   # Cold-chain SKU catalogue
    │   ├── admin/page.tsx      # Admin panel (CMS, settings, bookings, branches, media)
    │   └── api/
    │       ├── health/         # GET — liveness probe
    │       ├── cms/            # GET — public CMS aggregate (theme/header/hero/footer/…)
    │       ├── branches/       # GET ?region=&city=&q= — branch directory
    │       ├── services/       # GET — SKU list
    │       ├── executives/     # GET — leadership roster
    │       ├── bookings/       # POST (triage wizard) + GET (recent)
    │       └── admin/          # overview | settings | sections | faqs | socials
    │                           # media | branches | bookings | login (passkey-gated)
    ├── components/
    │   ├── Hero, Locator, BranchMap, TriageWizard, ServicesTeaser,
    │   │   ServicesOverlay, SkuCatalogue, PhilHealth, About, FaqSection,
    │   │   CustomSections, SiteHeader, Footer, Logo, SocialIcons, ThemeInjector
    │   └── AdminGate, AdminOverlay, AdminShortcut, MediaPicker  (admin UI)
    ├── db/
    │   ├── index.ts            # pg Pool + Drizzle client (auto-TLS for Neon, static-mode stub)
    │   └── schema.ts           # 9 tables: branches, executives, services, bookings,
    │                           #   site_settings, content_sections, faqs, social_links, media_assets
    └── lib/
        ├── catalog.ts          # Built-in branch / executive / SKU catalogue (static-mode data)
        ├── cms.ts              # Default CMS content (theme, header, hero, footer, FAQs, socials)
        ├── admin-auth.ts       # Passkey + cookie check for admin routes
        └── types.ts            # Shared types + geo helpers
```

## Database (optional — later)

The backend is **Neon-ready**: standard Postgres over `pg` with Drizzle ORM, zero code changes.

1. Create a project at [neon.com](https://neon.com) and copy the pooled connection string.
2. Set `DATABASE_URL` (Vercel → Project → Settings → Environment Variables, or local `.env`).
3. `npx drizzle-kit push` — creates all 9 tables.
4. `npx tsx scripts/seed.ts && npx tsx scripts/seed-cms.ts` — populate.

Until then, every page and API degrades gracefully to the built-in catalogue, and booking submissions return a clear "visit your nearest branch" notice instead of silently failing.

## Deploy (Vercel)

1. Import this repository on Vercel.
2. **Framework preset:** `Next.js` · **Root directory:** `./`
3. No environment variables required for the frontend. (Add `DATABASE_URL` + `ADMIN_PASSKEY` when the backend is connected.)
4. Deploy. Build command `next build` and output `.next` are detected automatically.

Full details in [NEON_SETUP.md](./NEON_SETUP.md).

## Admin panel

Open the site and press **Ctrl/Cmd + Shift+A** (or visit any URL with `?admin=1`) to open the passkey gate. Default passkey during development: `5309`. The panel manages site settings, CMS sections, FAQs, social links, media, branches and bookings.

---

© SBI Medical & Animal Bite Center.

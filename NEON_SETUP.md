# SBI Medical — Neon (neon.com) Backend Setup

The backend code tree is **Neon-ready**: standard Postgres over the `pg` driver with
Drizzle ORM. Neon is wire-compatible Postgres, so no code changes are needed —
only a connection string.

## Code tree

```
src/db/index.ts        Pool + Drizzle client (auto-TLS for *.neon.tech hosts)
src/db/schema.ts       9 tables: branches, executives, services, bookings,
                       site_settings, content_sections, faqs, social_links,
                       media_assets
drizzle.config.json    Drizzle Kit config (reads DATABASE_URL / local fallback)
scripts/seed.ts        Branch / executive / service seed (23-branch network)
scripts/seed-cms.ts    CMS seed (theme, header, hero, footer, sections, FAQs, socials)
src/app/api/branches   GET ?region=&city=&q=
src/app/api/bookings   POST (triage wizard) + GET (recent)
src/app/api/services   GET SKU list
src/app/api/executives GET leadership
src/app/api/cms        GET public aggregate (theme/header/hero/footer/sections/faqs/socials)
src/app/api/admin/*    overview | settings | sections | faqs | socials | media
                       | branches | bookings | login   (passkey-gated)
```

## 4-step Neon setup

1. **Create a project** at https://console.neon.tech (free tier is fine).
   Copy the **pooled** connection string, e.g.
   `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/app_db?sslmode=require`

2. **Set `DATABASE_URL`**:
   - Vercel: Project → Settings → Environment Variables → add `DATABASE_URL`
     (all environments), plus `ADMIN_PASSKEY` (default `5309` while building).
   - Local dev: paste it into `.env`.

3. **Push the schema** (creates all 9 tables on Neon):
   `npx drizzle-kit push`

4. **Seed**:
   `npx tsx scripts/seed.ts && npx tsx scripts/seed-cms.ts`

## Notes

- `src/db/index.ts` detects `neon.tech` hosts and enables `ssl: { rejectUnauthorized: false }`
  with a 10-connection pool — required for serverless (Vercel) deploys.
- Local Postgres keeps working unchanged (`postgresql://postgres:postgres@127.0.0.1:5432/app_db`).
- Uploaded media lives in `public/uploads/` (git-ignored at runtime). For production
  at scale, point `UPLOAD_DIR` at S3/R2 — the DB `media_assets` URLs keep working.
- Branching: create a Neon branch per preview environment and set its URL as the
  preview `DATABASE_URL` — zero-downtime schema experiments.

import type { ReactNode } from "react";
import { ArrowUpRight, Code2, Mail, MapPin, Phone, ChevronRight } from "lucide-react";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import { REGION_LABEL, REGION_ORDER } from "@/lib/types";
import { LEGAL_DOCS } from "@/lib/legal";
import {
  DEFAULT_FOOTER,
  type BrandingSettings,
  type FooterSettings,
  type SocialLink,
} from "@/lib/cms";

/**
 * The uploaded logo is a JPEG, so its white background is baked into the
 * pixels - as-is it renders as a white plate on this navy panel. `logo-reverse`
 * is the same mark re-cut with its navy ink knocked out to white, so it stays
 * legible here while keeping the red and green brand accents.
 */
const FOOTER_LOGO = "/images/logo-reverse.png";

const NAV_LINKS: [string, string][] = [
  ["#locator", "Branch locator"],
  ["#triage", "Triage & booking"],
  ["#services", "Services & SKUs"],
  ["#philhealth", "PhilHealth coverage"],
  ["#about", "About & leadership"],
  ["#faq", "FAQs"],
];

function ColumnHeading({ children }: { children: ReactNode }) {
  return <p className="plate-label text-cyan">{children}</p>;
}

export function Footer({
  footer,
  socials,
}: {
  footer?: FooterSettings | null;
  socials?: SocialLink[] | null;
  /**
   * Accepted so every caller can pass the same trio as `SiteHeader`. The footer
   * deliberately does not use `branding.logoUrl`: that asset is a JPEG with a
   * white background baked in, which renders as a white plate here.
   */
  branding?: BrandingSettings | null;
}) {
  const f = { ...DEFAULT_FOOTER, ...(footer ?? {}) };
  const links = socials ?? [];

  return (
    <footer className="relative overflow-hidden bg-navy-deep text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 h-[440px] w-[440px] rounded-full bg-cyan/12 blur-3xl"
      />

      {/* ── Columns ─────────────────────────────────────────────────────
          One column on mobile, two on tablet, four on desktop - equal
          widths at every step, so no column ends up with dead space. */}
      <div className="relative mx-auto max-w-[1400px] px-4 pt-14 sm:px-6 sm:pt-16">
        <div className="grid grid-cols-1 gap-x-8 gap-y-11 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10">
          <div className="min-w-0">
            <Logo
              src={FOOTER_LOGO}
              tone="light"
              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
            <p className="mt-5 max-w-sm text-[15.5px] leading-[1.7] text-white/75">{f.about}</p>
            {links.length > 0 && (
              <div className="mt-6">
                <ColumnHeading>Follow SBI</ColumnHeading>
                <div className="mt-3">
                  <SocialIcons socials={links} tone="light" />
                </div>
              </div>
            )}
          </div>

          <nav aria-label="Footer" className="min-w-0">
            <ColumnHeading>Navigate</ColumnHeading>
            <ul className="mt-4 space-y-0.5">
              {NAV_LINKS.map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="group flex items-center gap-1.5 py-1.5 text-[15.5px] text-white/85 transition-colors hover:text-cyan"
                  >
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <ColumnHeading>Regions served</ColumnHeading>
            <ul className="mt-4 space-y-3 text-[15.5px] text-white/85">
              {REGION_ORDER.map((r) => (
                <li key={r} className="flex items-start gap-2.5">
                  <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan/70" aria-hidden="true" />
                  <span>{REGION_LABEL[r]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <ColumnHeading>Contact HQ</ColumnHeading>
            <div className="mt-4 space-y-3.5 text-[15.5px]">
              <a
                href={`tel:${f.phone.replace(/[^0-9+]/g, "")}`}
                className="group flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8 transition-colors group-hover:bg-cyan group-hover:text-navy-deep">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="tabular min-w-0 font-semibold group-hover:text-cyan">{f.phone}</span>
              </a>

              <a href={`mailto:${f.email}`} className="group flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8 transition-colors group-hover:bg-cyan group-hover:text-navy-deep">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                {/* min-w-0 lets the address wrap instead of pushing the column
                    wider than its grid track (it used to split mid-domain). */}
                <span className="min-w-0 text-[14px] leading-[1.55] break-words text-white/85 group-hover:text-cyan">
                  {f.email}
                </span>
              </a>

              <p className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/8">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 text-[15px] leading-[1.6] text-white/70">{f.address}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Tagline ─────────────────────────────────────────────────────
            Light weight with open tracking, unboxed - reads as a signature
            rather than a headline. */}
        <div className="mt-14 border-t border-white/12 pt-10 sm:mt-16">
          <p className="font-display text-[clamp(1.1rem,3.1vw,2.15rem)] leading-[1.35] font-light tracking-[0.2em] text-white uppercase [text-wrap:balance]">
            {f.taglineA} <span className="text-cyan">{f.taglineB}</span>
          </p>
        </div>

        {/* ── Legal bar ─────────────────────────────────────────────────── */}
        <div className="mt-9 border-t border-white/12 pt-7 pb-4">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="min-w-0 max-w-md">
              <p className="text-[14px] leading-[1.65] text-white/60">
                © {new Date().getFullYear()} SBI Medical &amp; Animal Bite Center &amp; Vaccination
                Clinic. All rights reserved.
              </p>
              <p className="mt-1 text-[14px] leading-[1.65] text-white/45">{f.address}</p>
            </div>

            <div className="min-w-0 lg:max-w-[30rem]">
              <nav aria-label="Legal">
                <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
                  {LEGAL_DOCS.map((d) => (
                    <li key={d.href}>
                      <a
                        href={d.href}
                        className="text-[14px] text-white/70 underline decoration-white/25 decoration-1 underline-offset-4 transition-colors hover:text-cyan hover:decoration-cyan"
                      >
                        {d.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <p className="mt-4 text-[14px] leading-[1.6] text-white/50">
                Rabies is fatal once symptoms appear — seek care immediately.
              </p>
            </div>
          </div>
        </div>

        {/* ── Credentials + credit ──────────────────────────────────────── */}
        <div className="flex flex-col gap-5 border-t border-white/8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="plate-label text-[11px] text-white/40">
            DOH-Certified · PhilHealth ABPP · Since 2010
          </p>

          <p className="flex items-center gap-2.5 text-[13px] text-white/55">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8">
              <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span>
              Website by{" "}
              <a
                href={f.developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-white/80 hover:text-cyan"
              >
                {f.developerName}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>{" "}
              — {f.developerTagline}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

import { ArrowUpRight, Code2, Mail, MapPin, Phone, ChevronRight } from "lucide-react";
import { Logo } from "./Logo";
import { SocialIcons } from "./SocialIcons";
import { REGION_LABEL, REGION_ORDER } from "@/lib/types";
import {
  DEFAULT_BRANDING,
  DEFAULT_FOOTER,
  type BrandingSettings,
  type FooterSettings,
  type SocialLink,
} from "@/lib/cms";

export function Footer({
  footer,
  socials,
  branding,
}: {
  footer?: FooterSettings | null;
  socials?: SocialLink[] | null;
  branding?: BrandingSettings | null;
}) {
  const f = { ...DEFAULT_FOOTER, ...(footer ?? {}) };
  const brand = { ...DEFAULT_BRANDING, ...(branding ?? {}) };
  const links = socials ?? [];

  return (
    <footer className="relative overflow-hidden bg-navy-deep text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 h-[440px] w-[440px] rounded-full bg-cyan/12 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)_minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div>
            <Logo
              src={brand.logoUrl}
              className={brand.logoUrl ? "h-24 w-24 object-contain sm:h-32 sm:w-32" : "h-20 w-auto"}
              tone="light"
            />
            <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-white/75">{f.about}</p>
            {links.length > 0 && (
              <div className="mt-6">
                <p className="plate-label text-cyan">Follow SBI</p>
                <div className="mt-3">
                  <SocialIcons socials={links} tone="light" />
                </div>
              </div>
            )}
          </div>

          <nav aria-label="Footer">
            <p className="plate-label text-cyan">Navigate</p>
            <ul className="mt-4 space-y-1">
              {[
                ["#locator", "Branch locator"],
                ["#triage", "Triage & booking"],
                ["#services", "Services & SKUs"],
                ["#philhealth", "PhilHealth coverage"],
                ["#about", "About & leadership"],
                ["#faq", "FAQs"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="group flex items-center gap-1.5 rounded-full py-1.5 text-[16px] text-white/85 transition-colors hover:text-cyan"
                  >
                    <ChevronRight
                      className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="plate-label text-cyan">Regions served</p>
            <ul className="mt-4 space-y-2.5 text-[15px] text-white/85">
              {REGION_ORDER.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan/70" aria-hidden="true" />
                  {REGION_LABEL[r]}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="plate-label text-cyan">Contact HQ</p>
            <div className="mt-4 space-y-3 text-[15px]">
              <a
                href={`tel:${f.phone.replace(/[^0-9+]/g, "")}`}
                className="tabular group flex items-center gap-2.5 font-bold hover:text-cyan"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 transition-colors group-hover:bg-cyan group-hover:text-navy-deep">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                {f.phone}
              </a>
              <a
                href={`mailto:${f.email}`}
                className="group flex items-start gap-2.5 break-all text-white/85 hover:text-cyan"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8 transition-colors group-hover:bg-cyan group-hover:text-navy-deep">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                {f.email}
              </a>
              <p className="flex items-start gap-2.5 text-white/70">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                {f.address}
              </p>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-14 rounded-[1.75rem] border border-white/12 bg-white/6 px-5 py-8 sm:px-8">
          <p className="text-[clamp(2rem,7vw,4.8rem)] leading-none font-extrabold tracking-[-0.04em] text-white">
            {f.taglineA} <span className="text-cyan">{f.taglineB}</span>
          </p>
          <div className="mt-6 flex flex-col gap-3 text-[13px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} SBI Medical &amp; Animal Bite Center &amp;
              Vaccination Clinic. Since 2010.
            </p>
            <p className="tabular">Rabies is fatal once symptoms appear — seek care immediately.</p>
          </div>
        </div>

        {/* Developer credit */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/12 bg-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2.5 text-[13px] text-white/70">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan text-navy-deep">
              <Code2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              Website by{" "}
              <a
                href={f.developerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-white hover:text-cyan"
              >
                {f.developerName}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>{" "}
              — {f.developerTagline}
            </span>
          </p>
          <p className="tabular text-[12px] tracking-wide text-white/45">
            DOH-CERTIFIED · PHILHEALTH ABPP · SINCE 2010
          </p>
        </div>
      </div>
    </footer>
  );
}

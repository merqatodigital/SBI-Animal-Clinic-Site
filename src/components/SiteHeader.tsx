"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, BadgeCheck, Menu, X, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { AdminGate, useTripleClick } from "./AdminGate";
import { DEFAULT_BRANDING, DEFAULT_HEADER, type BrandingSettings, type HeaderSettings } from "@/lib/cms";

const NAV = [
  { href: "#locator", label: "Find a Branch" },
  { href: "#triage", label: "Triage & Booking" },
  { href: "#services", label: "Services" },
  { href: "#philhealth", label: "PhilHealth" },
  { href: "#faq", label: "FAQs" },
  { href: "#about", label: "About Us" },
];

export function SiteHeader({
  header,
  branding,
}: {
  header?: HeaderSettings | null;
  branding?: BrandingSettings | null;
}) {
  const h = { ...DEFAULT_HEADER, ...(header ?? {}) };
  const brand = { ...DEFAULT_BRANDING, ...(branding ?? {}) };
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<string>("");
  const [gateOpen, setGateOpen] = useState(false);
  // Triple-click / triple-tap the logo → hidden admin gate (Option A).
  const triple = useTripleClick(() => setGateOpen(true), 1500);

  // Backup openers (Option B): ?admin=1, #admin, or Ctrl/Cmd+Shift+A.
  useEffect(() => {
    const openGate = () => setGateOpen(true);
    window.addEventListener("sbi:open-admin", openGate);
    return () => window.removeEventListener("sbi:open-admin", openGate);
  }, []);

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Emergency ribbon */}
      <div className="bg-alert text-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
          <p className="flex-1 text-[15px] leading-snug font-semibold">
            <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 align-middle text-[11px] font-extrabold tracking-[0.14em] uppercase">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              First aid
            </span>
            {h.bannerText}
          </p>
          {/* flex-wrap: the two pills do not fit side by side on a 375px
              screen, so the CTA drops to its own line instead of overflowing. */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <a
              href={h.phoneHref}
              className="tabular btn btn-sm !border-white/50 !bg-transparent !text-white hover:!bg-white hover:!text-alert"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {h.phone}
            </a>
            <a href="#locator" className="btn btn-sm btn-light">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {h.ctaLabel}
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-hair/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 sm:px-6">
          <a
            href="#top"
            className="shrink-0 cursor-pointer touch-manipulation select-none"
            aria-label="SBI Medical home — click three times for admin access"
            title="Click logo 3 times quickly for admin access"
            onClick={(e) => triple(e)}
          >
            <Logo src={brand.logoUrl} className="pointer-events-none h-12 w-auto sm:h-14" />
          </a>
          <AdminGate forceOpen={gateOpen} onClose={() => setGateOpen(false)} />

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[15px] font-semibold text-navy transition-all duration-150 hover:bg-cyan-soft hover:text-navy-deep"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-2.5 lg:ml-4 lg:flex">
            {/* Trust badges only earn their space on very wide screens; below
                that they crowd the nav and clip the CTA. */}
            <div className="hidden items-center gap-2.5 2xl:flex">
              <span className="chip !text-steel">
                <ShieldCheck className="h-3.5 w-3.5 text-navy" aria-hidden="true" />
                DOH Certified
              </span>
              <span className="chip !text-leaf">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                PhilHealth ABPP
              </span>
            </div>
            <a href="#triage" className="btn btn-primary">
              Book Appointment
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-hair bg-white text-navy transition-colors hover:border-cyan hover:text-cyan-deep lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              id="mobile-nav"
              aria-label="Mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              className="overflow-hidden border-t border-hair bg-white lg:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {NAV.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      setOpen(false);
                      if (item.href === "#services") {
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent("sbi:open-services"));
                      }
                    }}
                    className="rounded-xl px-4 py-3.5 text-[17px] font-bold text-navy transition-colors hover:bg-cyan-soft"
                  >
                    {item.label}
                  </a>
                ))}
                <a href="#triage" onClick={() => setOpen(false)} className="btn btn-primary btn-lg mt-3">
                  Book Appointment
                </a>
                <div className="mt-2 flex gap-2">
                  <span className="chip !text-steel">
                    <ShieldCheck className="h-3.5 w-3.5 text-navy" aria-hidden="true" /> DOH
                  </span>
                  <span className="chip !text-leaf">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> PhilHealth
                  </span>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        <div className="hidden border-t border-hair bg-paper px-4 py-1 sm:block lg:hidden">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between">
            <span className="plate-label text-steel">Nationwide · 23 branches</span>
            <span className="plate-label tabular text-steel">
              Hotline {h.phone} · {now} PHT
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

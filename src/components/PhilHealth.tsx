import { BadgeCheck, ShieldCheck, Wallet, FileCheck2, Stethoscope, Syringe, ArrowRight } from "lucide-react";
import { SealBadge } from "./Logo";

const COVERED = [
  {
    k: "Wound consultation",
    v: "Assessment, surgical-level cleansing and chemical disinfection of the wound.",
    Icon: Stethoscope,
  },
  {
    k: "Anti-rabies treatment",
    v: "Post-exposure and pre-exposure prophylaxis with PVRV/PCEC vaccine.",
    Icon: Syringe,
  },
  {
    k: "Anti-tetanus shots",
    v: "Tetanus toxoid (TT), anti-tetanus serum (ATS) and HTIG where indicated.",
    Icon: ShieldPlusIcon,
  },
];

function ShieldPlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l7 3v6c0 4-3 6.5-7 9-4-2.5-7-5-7-9V6l7-3z" />
      <path d="M12 9v6M9 12h6" strokeLinecap="round" />
    </svg>
  );
}

export function PhilHealth() {
  return (
    <section id="philhealth" className="scroll-mt-32 border-t border-hair bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <p className="plate-label inline-flex items-center gap-2 rounded-full border border-hair bg-white px-3.5 py-2 text-cyan-deep shadow-sm">
              <Wallet className="h-4 w-4" aria-hidden="true" />
              04 / Coverage
            </p>
            <h2 className="mt-5 text-[clamp(2rem,5vw,3.4rem)] text-navy">
              PhilHealth Animal Bite Package.
              <br />
              <span className="text-ink">Zero cash for the three baseline doses.</span>
            </h2>

            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-steel">
              SBI is listed as an accredited Animal Bite Package Provider (ABPP) in the PhilHealth
              CY 2026 accredited provider lists, with accreditation entries confirming its active
              status. If{" "}
              <code className="tabular rounded-lg bg-navy px-2 py-1 text-[14px] text-white">
                is_philhealth_member == true
              </code>{" "}
              your booking is flagged on submission, so the transaction clears against the package
              at the branch — no advance payment for eligible members.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {COVERED.map(({ k, v, Icon }, i) => (
                <div key={k} className="card card-hover p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-soft text-cyan-deep">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="tabular mt-3 block text-[12px] font-extrabold text-cyan-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 text-[17px] text-navy">{k}</h3>
                  <p className="mt-1.5 text-[14px] leading-snug text-steel">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3 rounded-2xl border-l-4 border-alert bg-white p-5 shadow-[0_18px_40px_-32px_rgba(6,37,74,0.9)]">
              <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-alert" aria-hidden="true" />
              <p className="text-[15px] text-ink">
                <strong className="text-alert">Eligibility note:</strong> the member must have a
                current premium contribution and present a valid PhilHealth PIN together with one
                government-issued ID at the branch. Non-members and lapsed accounts are still
                treated immediately — billing falls back to standard consultation rates.
              </p>
            </div>

            <a href="#triage" className="btn btn-primary btn-lg group mt-7">
              Check my coverage while booking
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
            </a>
          </div>

          <aside className="rounded-[1.75rem] bg-navy p-6 text-white shadow-[0_40px_80px_-56px_rgba(6,37,74,1)] sm:p-8">
            <p className="plate-label flex items-center gap-2 text-cyan">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Accreditation
            </p>
            <h3 className="mt-2 text-[clamp(1.5rem,3vw,2.2rem)]">Trust, in writing.</h3>

            <div className="mt-6 space-y-4 border-t border-white/15 pt-6">
              <div className="rounded-2xl bg-white p-4">
                <SealBadge label="DOH Certified" sub="Department of Health · PEP-compliant centers" />
              </div>
              <div className="rounded-2xl bg-white p-4">
                <SealBadge
                  label="PhilHealth Accredited"
                  sub="Animal Bite Package Provider (ABPP) · CY 2026"
                  color="#12833F"
                />
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 text-[14px]">
              <div>
                <dt className="plate-label text-white/55">Package scope</dt>
                <dd className="mt-1 text-white">Wound care + PEP + anti-tetanus</dd>
              </div>
              <div>
                <dt className="plate-label text-white/55">Baseline doses</dt>
                <dd className="tabular mt-1 text-white">3 active vaccine doses</dd>
              </div>
              <div>
                <dt className="plate-label text-white/55">Verified at</dt>
                <dd className="mt-1 text-white">Every branch reception desk</dd>
              </div>
              <div>
                <dt className="plate-label text-white/55">Hotline</dt>
                <dd className="tabular mt-1 text-white">
                  <a href="tel:09286052684" className="hover:text-cyan">0928 605 2684</a>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

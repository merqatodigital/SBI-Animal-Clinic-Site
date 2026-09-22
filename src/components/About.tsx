import { CalendarHeart, Building2, ArrowRight, Award, BadgeCheck } from "lucide-react";
import type { Executive } from "@/lib/types";
import { SealBadge } from "./Logo";

const MILESTONES = [
  ["2010", "Founded in Antipolo City", "SBI Medical & Animal Bite Center & Vaccination Clinic opens its first site across from Antipolo District Hospital."],
  ["2015", "Rizal network", "Rodriguez, Morong and Boso-Boso join the network under one PEP protocol."],
  ["2019", "Beyond Luzon", "Calbayog, Tacloban, Ormoc and Basey extend post-exposure care to the Visayas."],
  ["2023", "Northern Mindanao", "Balingasag, Gingoog, El Salvador, Cagayan de Oro and Tagoloan come online."],
  ["2026", "PhilHealth ABPP", "Accredited Animal Bite Package Provider in the PhilHealth CY 2026 list."],
];

export function About({ executives }: { executives: Executive[] }) {
  return (
    <section id="about" className="scroll-mt-32 border-t border-hair bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <p className="plate-label inline-flex items-center gap-2 rounded-full border border-hair bg-paper px-3.5 py-2 text-cyan-deep">
              <CalendarHeart className="h-4 w-4" aria-hidden="true" />
              05 / About us
            </p>
            <h2 className="mt-5 text-[clamp(2rem,5vw,3.4rem)] text-navy">
              Established 2010.
              <br />
              <span className="text-ink">A clinic built around one preventable disease.</span>
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-steel">
              SBI began as a single animal bite centre in Antipolo City, directly across from
              Antipolo District Hospital, run by a nurse-founder who understood that rabies outcomes
              are decided in the first hour after a bite. Sixteen years later the network spans NCR,
              Rizal, Palawan, Samar, Leyte and Misamis Oriental — with a cold chain, a DOH
              post-exposure algorithm and a booking standard that are identical in every room.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-hair bg-paper p-2">
              <ol>
                {MILESTONES.map(([year, title, body], i) => (
                  <li
                    key={year}
                    className={`grid grid-cols-[68px_minmax(0,1fr)] gap-4 px-4 py-4 ${
                      i !== MILESTONES.length - 1 ? "border-b border-hair" : ""
                    }`}
                  >
                    <span className="tabular flex items-start gap-2 text-[17px] leading-none font-extrabold text-cyan-deep">
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan"
                        aria-hidden="true"
                      />
                      {year}
                    </span>
                    <div>
                      <h3 className="text-[17px] text-ink">{title}</h3>
                      <p className="mt-1 text-[14px] leading-snug text-steel">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-hair shadow-[0_36px_70px_-52px_rgba(6,37,74,0.9)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="images/clinic-interior.jpg"
                alt="Empty waiting area of an SBI clinic with pale blue chairs and a navy accent wall"
                className="h-64 w-full object-cover sm:h-80"
                loading="lazy"
              />
              <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-3 rounded-2xl bg-white/95 px-4 py-3 backdrop-blur-md">
                <SealBadge label="DOH Certified" sub="PEP-compliant" />
                <SealBadge label="PhilHealth ABPP" sub="CY 2026" color="#12833F" />
              </div>
            </div>

            <div className="mt-9 flex items-center justify-between gap-3 border-b-2 border-navy pb-3">
              <h3 className="flex items-center gap-2.5 text-[clamp(1.4rem,3vw,2rem)] text-navy">
                <UsersIcon className="h-5 w-5 text-cyan-deep" aria-hidden="true" />
                Leadership
              </h3>
              <span className="chip !text-steel">
                <Award className="h-3.5 w-3.5" aria-hidden="true" /> Since 2010
              </span>
            </div>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {executives.map((e, i) => (
                <li
                  key={e.name}
                  className="card card-hover p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="tabular text-[13px] font-extrabold text-cyan-deep">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-soft text-navy">
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-2 text-[18px] leading-tight font-extrabold text-navy">
                    {e.name}
                  </p>
                  <p className="plate-label mt-2 text-alert">{e.role}</p>
                  {e.credential && (
                    <p className="mt-1.5 text-[14px] leading-snug text-steel">{e.credential}</p>
                  )}
                </li>
              ))}
            </ul>

            <a href="#locator" className="btn btn-outline mt-6 group">
              Visit a branch
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
      <path d="M16 6.2A3 3 0 0 1 16 12M17 14.5c2 .8 3.5 2.4 3.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

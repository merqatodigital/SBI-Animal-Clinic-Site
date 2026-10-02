"use client";

import { Syringe, ShieldCheck, Snowflake, Stethoscope, ArrowRight } from "lucide-react";
import type { Service } from "@/lib/types";

const GROUPS = [
  { key: "Active Vaccines", icon: Syringe, tone: "bg-navy text-white" },
  { key: "Passive Rabies Defenses", icon: ShieldCheck, tone: "bg-alert text-white" },
  { key: "Anti-Tetanus Biologics", icon: Snowflake, tone: "bg-cyan text-navy-deep" },
  { key: "Clinical Services", icon: Stethoscope, tone: "bg-leaf text-white" },
];

/**
 * Slim teaser band on the homepage — the full SKU catalogue lives in its own
 * section (opened as a panel, or served at /services on full deployments).
 */
export function ServicesTeaser({ services }: { services: Service[] }) {
  const open = () => window.dispatchEvent(new CustomEvent("sbi:open-services"));

  return (
    <section id="services" className="scroll-mt-32 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
        <div className="flex flex-col gap-8 rounded-xl border border-hair bg-paper p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow text-cyan-deep">
              <Snowflake className="h-4 w-4" aria-hidden="true" />
              03 / Cold-chain inventory
            </p>
            <h2 className="mt-5 text-[clamp(1.7rem,4vw,2.6rem)] text-navy">
              {services.length} SKUs across 4 inventory classes.
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-steel">
              PVRV &amp; PCEC vaccines, ERIG &amp; HRIG immunoglobulins, TT/ATS/HTIG tetanus
              biologics and wound care — with exact Day 0 · 3 · 7 · 21/28 regimens in the full
              catalogue.
            </p>
            <button type="button" onClick={open} className="btn btn-primary btn-lg group mt-6">
              Open the SKU catalogue
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
            </button>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:w-[380px]">
            {GROUPS.map((g) => {
              const Icon = g.icon;
              const count = services.filter((s) => s.group === g.key).length;
              return (
                <li
                  key={g.key}
                  className="flex items-center gap-3 rounded-xl border border-hair bg-white p-3.5"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${g.tone}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-bold text-navy">{g.key}</span>
                    <span className="tabular block text-[13px] text-steel">{count} SKUs</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

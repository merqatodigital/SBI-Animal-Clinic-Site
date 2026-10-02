"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Syringe,
  ShieldCheck,
  Snowflake,
  Stethoscope,
  CalendarDays,
  X,
  Boxes,
  ArrowRight,
  SearchX,
} from "lucide-react";
import type { Service } from "@/lib/types";

const GROUPS = [
  { key: "Active Vaccines", icon: Syringe, tone: "bg-navy text-white" },
  { key: "Passive Rabies Defenses", icon: ShieldCheck, tone: "bg-alert text-white" },
  { key: "Anti-Tetanus Biologics", icon: Snowflake, tone: "bg-cyan text-navy-deep" },
  { key: "Clinical Services", icon: Stethoscope, tone: "bg-leaf text-white" },
] as const;

const TONE: Record<string, string> = {
  "Active Vaccines": "bg-navy text-white",
  "Passive Rabies Defenses": "bg-alert text-white",
  "Anti-Tetanus Biologics": "bg-cyan text-navy-deep",
  "Clinical Services": "bg-leaf text-white",
};

/** Pull "Day 0 · Day 3 · Day 7 · Day 21/28" out of the regimen sentence. */
function dayChips(regimen: string | null): string[] {
  if (!regimen) return [];
  const out: string[] = [];
  const re = /Day\s*(\d+)\s*(?:\/\s*(\d+))?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(regimen)) !== null && out.length < 5) {
    out.push(m[2] ? `${m[1]}/${m[2]}` : m[1]);
  }
  return Array.from(new Set(out));
}

export function SkuCatalogue({
  services,
  onClose,
}: {
  services: Service[];
  onClose?: () => void;
}) {
  const [filter, setFilter] = useState<string>("All");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of services) c[s.group] = (c[s.group] ?? 0) + 1;
    return c;
  }, [services]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return services.filter((s) => {
      const okGroup = filter === "All" || s.group === filter;
      const okQuery =
        !needle ||
        s.name.toLowerCase().includes(needle) ||
        s.sku.toLowerCase().includes(needle) ||
        s.group.toLowerCase().includes(needle);
      return okGroup && okQuery;
    });
  }, [services, filter, q]);

  return (
    <section id="services-catalogue" className="bg-paper">
      {/* Overlay top bar (only when opened as a panel) */}
      {onClose && (
        <div className="sticky top-0 z-[60] border-b border-hair bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white">
              <Boxes className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="plate-label text-navy">SBI · Cold-chain SKU catalogue</p>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-sm ml-auto"
              aria-label="Close catalogue"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
        {/* Head */}
        <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-navy pb-6">
          <div className="max-w-2xl">
            <p className="eyebrow text-cyan-deep">
              <Boxes className="h-4 w-4" aria-hidden="true" />
              Cold-chain inventory · SKU catalogue
            </p>
            <h1 className="mt-5 text-[clamp(2rem,5vw,3.6rem)] text-navy">
              Every SKU a bite center stocks —
              <br />
              <span className="text-ink">and exactly when it is given.</span>
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-steel">
              All 23 branches run the same DOH Post-Exposure Prophylaxis protocol: wound care
              first, passive immunoglobulin where the skin is breached, then the active vaccine
              schedule through Day 21/28. Cold chain held at 2–8 °C.
            </p>
          </div>

          <dl className="flex flex-wrap gap-2">
            {[
              [String(services.length), "SKUs listed"],
              ["4", "inventory classes"],
              ["2–8°C", "monitored daily"],
            ].map(([big, small]) => (
              <div
                key={small}
                className="min-w-[112px] rounded-xl border border-hair bg-white px-4 py-3"
              >
                <dt className="tabular text-[26px] leading-none font-extrabold text-navy">
                  {big}
                </dt>
                <dd className="plate-label mt-1.5 text-steel">{small}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by SKU class">
            <button
              type="button"
              onClick={() => setFilter("All")}
              aria-pressed={filter === "All"}
              className={`h-11 rounded-full px-5 text-[13px] font-extrabold tracking-[0.1em] uppercase transition-all duration-150 ${
                filter === "All"
                  ? "bg-navy text-white shadow-[0_14px_26px_-16px_rgba(6,37,74,0.9)]"
                  : "border-[1.5px] border-hair bg-white text-navy hover:-translate-y-0.5 hover:border-cyan"
              }`}
            >
              All · {services.length}
            </button>
            {GROUPS.map((g) => {
              const Icon = g.icon;
              const active = filter === g.key;
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setFilter(g.key)}
                  aria-pressed={active}
                  className={`inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] px-4 text-[13px] font-extrabold tracking-[0.06em] uppercase transition-all duration-150 ${
                    active
                      ? "border-navy bg-navy text-white shadow-[0_14px_26px_-16px_rgba(6,37,74,0.9)]"
                      : "border-hair bg-white text-navy hover:-translate-y-0.5 hover:border-cyan"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {g.key}
                  <span
                    className={`tabular rounded-full px-1.5 text-[11px] ${
                      active ? "bg-white/20" : "bg-paper text-steel"
                    }`}
                  >
                    {counts[g.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative mt-1 lg:mt-0 lg:w-72">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search SKU or product…"
              aria-label="Search the SKU catalogue"
              className="h-12 w-full rounded-full border-[1.5px] border-hair bg-white pr-5 pl-11 text-[15px] text-ink placeholder:text-steel/80 focus:border-cyan focus:shadow-[0_0_0_4px_rgba(0,174,239,0.16)] focus:outline-none"
            />
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-steel"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Cards */}
        {visible.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-steel/40 bg-white p-12 text-center">
            <SearchX className="mx-auto h-8 w-8 text-steel" aria-hidden="true" />
            <p className="mt-3 text-[18px] font-bold text-navy">No SKU matches that search.</p>
            <p className="mt-1 text-[15px] text-steel">
              Try “ERIG”, “tetanus” or clear the class filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setFilter("All");
              }}
              className="btn btn-primary mt-5"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((s, i) => {
              const meta = GROUPS.find((g) => g.key === s.group) ?? GROUPS[0];
              const Icon = meta.icon;
              const chips = dayChips(s.regimen);
              return (
                <motion.article
                  key={s.sku}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(i * 0.04, 0.28),
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  className="card card-hover flex flex-col p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`tabular inline-flex rounded-full px-3 py-1.5 text-[12px] font-extrabold tracking-[0.08em] ${TONE[s.group] ?? "bg-navy text-white"}`}
                    >
                      {s.sku}
                    </span>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${meta.tone}`}
                      title={s.group}
                    >
                      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                  </div>

                  <h2 className="mt-4 text-[19px] leading-snug text-navy">{s.name}</h2>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-steel">
                    {s.application}
                  </p>

                  <div className="mt-4 border-t border-hair pt-3">
                    <p className="plate-label flex items-center gap-1.5 text-steel/90">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      Regimen
                    </p>
                    {chips.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {chips.map((d) => (
                          <span
                            key={d}
                            className="tabular rounded-full bg-cyan-soft px-2.5 py-1 text-[12px] font-extrabold text-cyan-deep"
                          >
                            Day {d}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[14px] text-ink/85">{s.regimen ?? "Per physician"}</p>
                    )}
                    {chips.length > 0 && s.regimen && (
                      <p className="mt-2 text-[13px] leading-snug text-steel/90">{s.regimen}</p>
                    )}
                  </div>

                  <p className="plate-label mt-3 text-navy/60">{s.group}</p>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Protocol footer band */}
      <div className="border-t border-hair bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-3 text-[15px] text-steel">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-alert text-white">
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
            </span>
            Unsure which SKU applies? Category III exposures need ERIG/HRIG{" "}
            <span className="text-ink">plus</span> active vaccines — start the triage wizard.
          </p>
          <a href="#triage" className="btn btn-primary group shrink-0">
            Start triage &amp; book
            <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

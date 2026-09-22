"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Search, LocateFixed, MapPin, CalendarPlus, ArrowRight, Navigation, Crosshair } from "lucide-react";
import { REGION_LABEL, REGION_ORDER, haversineKm, type Branch } from "@/lib/types";

const BranchMap = dynamic(() => import("./BranchMap").then((m) => m.BranchMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#EFF5FB]">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton h-4 w-56" />
      <p className="plate-label text-steel">Loading OpenStreetMap…</p>
    </div>
  ),
});

type GeoStatus = "idle" | "locating" | "ready" | "denied" | "unsupported";

function SkeletonCard() {
  return (
    <div className="border border-hair bg-white p-5">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton mt-3 h-6 w-3/4" />
      <div className="skeleton mt-3 h-4 w-full" />
      <div className="skeleton mt-2 h-4 w-5/6" />
      <div className="skeleton mt-4 h-4 w-40" />
      <div className="mt-5 flex gap-2">
        <div className="skeleton h-11 flex-1" />
        <div className="skeleton h-11 w-28" />
      </div>
    </div>
  );
}

function startBooking(slug: string) {
  window.dispatchEvent(new CustomEvent("sbi:select-branch", { detail: slug }));
  document.getElementById("triage")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Locator({
  initial,
  intro,
}: {
  initial: Branch[];
  intro?: { eyebrow?: string; title?: string; body?: string } | null;
}) {
  const eyebrow = intro?.eyebrow || "01 / Branch locator";
  const title = intro?.title || "23 branches.";
  const body =
    intro?.body ||
    "NCR · Luzon · Visayas · Mindanao. Every branch runs the same DOH Post-Exposure Prophylaxis algorithm, from Manggahan to Gingoog.";
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("All");
  const [rows, setRows] = useState<Branch[]>(initial);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [geo, setGeo] = useState<GeoStatus>("idle");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const firstRun = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (region !== "All") params.set("region", region);
    if (query.trim()) params.set("q", query.trim());
    try {
      const res = await fetch(`/api/branches?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { branches: Branch[] };
      setRows(json.branches);
      setFailed(false);
    } catch {
      setFailed(true);
      const q = query.trim().toLowerCase();
      setRows(
        initial.filter(
          (b) =>
            (region === "All" || b.region === region) &&
            (!q ||
              b.name.toLowerCase().includes(q) ||
              b.address.toLowerCase().includes(q) ||
              b.city.toLowerCase().includes(q)),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [initial, query, region]);

  useEffect(() => {
    const delay = firstRun.current ? 420 : 320;
    firstRun.current = false;
    const id = setTimeout(load, delay);
    return () => clearTimeout(id);
  }, [load]);

  const withDistance = useMemo(() => {
    const list = rows.map((b) => ({
      ...b,
      distance: coords ? haversineKm(coords, b) : null,
    }));
    if (coords) list.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    return list;
  }, [rows, coords]);

  const grouped = useMemo(() => {
    return REGION_ORDER.map((r) => ({
      region: r,
      items: withDistance.filter((b) => b.region === r),
    })).filter((g) => g.items.length > 0);
  }, [withDistance]);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeo("unsupported");
      return;
    }
    setGeo("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeo("ready");
      },
      () => setGeo("denied"),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
    );
  }, []);

  // The triage wizard's "Use my location" action drives the locator too.
  useEffect(() => {
    const onLocate = () => locate();
    window.addEventListener("sbi:locate", onLocate);
    return () => window.removeEventListener("sbi:locate", onLocate);
  }, [locate]);

  const nearest = withDistance[0];

  return (
    <section id="locator" className="scroll-mt-32 border-t border-hair bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 pt-16 sm:px-6 lg:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-navy pb-5">
          <div>
            <p className="plate-label inline-flex items-center gap-2 rounded-full border border-hair bg-white px-3.5 py-2 text-cyan-deep shadow-sm">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {eyebrow}
            </p>
            <h2 className="mt-5 text-[clamp(2rem,5vw,3.4rem)] text-navy">
              {title}
              <br />
              <span className="text-ink">One archipelago-wide standard of care.</span>
            </h2>
          </div>
          <p className="max-w-md text-[15px] text-steel">{body}</p>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-stretch">
          <div className="relative flex-1">
            <label htmlFor="branch-search" className="sr-only">
              Search branches by city, street or number
            </label>
            <input
              id="branch-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city, barangay or street — e.g. Antipolo"
              className="h-14 w-full rounded-full border-[1.5px] border-hair bg-white pr-5 pl-13 text-[16px] text-ink shadow-sm placeholder:text-steel/80 focus:border-cyan focus:shadow-[0_0_0_4px_rgba(0,174,239,0.16)] focus:outline-none"
            />
            <Search
              className="pointer-events-none absolute top-4 left-5 h-6 w-6 text-steel"
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", ...REGION_ORDER].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                aria-pressed={region === r}
                className={`h-13 rounded-full px-5 text-[13px] font-extrabold tracking-[0.1em] uppercase transition-all duration-150 ${
                  region === r
                    ? "bg-navy text-white shadow-[0_14px_26px_-16px_rgba(6,37,74,0.9)]"
                    : "border-[1.5px] border-hair bg-white text-navy hover:-translate-y-0.5 hover:border-cyan hover:text-cyan-deep"
                }`}
              >
                {r}
              </button>
            ))}
            <button
              type="button"
              onClick={locate}
              className="btn btn-accent h-14 px-6"
            >
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
              {geo === "locating" ? "Locating…" : "Use my location"}
            </button>
          </div>
        </div>

        <div aria-live="polite" className="mt-3 min-h-[24px] text-[14px]">
          {geo === "ready" && nearest && (
            <span className="font-semibold text-navy">
              Nearest published branch:{" "}
              <span className="text-cyan-deep">{nearest.name}</span>{" "}
              <span className="tabular text-steel">
                ({(nearest.distance ?? 0).toFixed(1)} km away)
              </span>
            </span>
          )}
          {geo === "denied" && (
            <span className="text-steel">
              Location access was declined — search by city instead, or call 0928 605 2684.
            </span>
          )}
          {geo === "unsupported" && (
            <span className="text-steel">Geolocation is not available in this browser.</span>
          )}
          {failed && !loading && (
            <span className="text-alert">
              Live directory unavailable — showing the cached branch list.
            </span>
          )}
        </div>
      </div>

      {/* Two-pane: live OpenStreetMap + results */}
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="lg:sticky lg:top-40 lg:h-[calc(100vh-11rem)]">
          <div
            id="branch-map"
            className="h-[440px] scroll-mt-40 overflow-hidden rounded-[1.75rem] border border-hair bg-white shadow-[0_36px_70px_-52px_rgba(6,37,74,0.95)] sm:h-[520px] lg:h-full lg:min-h-[560px]"
          >
            <BranchMap
              branches={withDistance}
              selectedSlug={selected}
              userCoords={coords}
              onLocate={locate}
              onBook={startBooking}
              onSelect={(slug: string | null) => {
                setSelected(slug);
                if (slug) {
                  // Keep the card list in sync when a map pin is tapped.
                  requestAnimationFrame(() => {
                    document
                      .getElementById(`branch-${slug}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  });
                }
              }}
            />
          </div>
          <p className="mt-2 text-[13px] text-steel">
            Live OpenStreetMap — tap any pin for the branch address, contact, hours,
            directions and booking. Filtering refits the map;{" "}
            <span className="font-semibold text-navy">Fit all</span> reframes the network
            and <span className="font-semibold text-navy">◎ Locate me</span> drops your
            position on it.
          </p>
        </div>

        <div className="pt-8 lg:pt-0">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : withDistance.length === 0 ? (
            <div className="border border-dashed border-steel/50 bg-white p-10 text-center">
              <p className="text-lg font-bold text-navy">No branch matches “{query}”.</p>
              <p className="mt-2 text-[15px] text-steel">
                Try a nearby city, clear the region filter, or call our hotline on 0928 605 2684.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setRegion("All");
                }}
                className="btn btn-primary mt-5"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {grouped.map((group) => (
                <div key={group.region}>
                  <div className="mb-3 flex items-baseline justify-between border-b border-hair pb-2">
                    <h3 className="text-[15px] tracking-[0.12em] text-navy uppercase">
                      {REGION_LABEL[group.region]}
                    </h3>
                    <span className="plate-label tabular text-steel">
                      {String(group.items.length).padStart(2, "0")}
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {group.items.map((b, i) => (
                      <motion.li
                        key={b.slug}
                        id={`branch-${b.slug}`}
                        data-branch={b.slug}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{
                          duration: 0.32,
                          delay: Math.min(i * 0.04, 0.24),
                          ease: [0.2, 0.8, 0.2, 1],
                        }}
                        onMouseEnter={() => setSelected(b.slug)}
                        onFocus={() => setSelected(b.slug)}
                        className={`card card-hover ${
                          selected === b.slug ? "!border-cyan shadow-[0_22px_44px_-30px_rgba(6,37,74,0.7)]" : ""
                        }`}
                      >
                        <div className="flex gap-4 p-5">
                          <div
                            className={`w-1 shrink-0 ${b.isHq ? "bg-alert" : "bg-cyan"}`}
                            aria-hidden="true"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-[19px] text-navy">{b.name}</h4>
                              {b.isHq && (
                                <span className="rounded-full bg-alert px-2.5 py-1 text-[10px] font-extrabold tracking-[0.14em] text-white uppercase">
                                  HQ
                                </span>
                              )}
                              {b.distance != null && (
                                <span className="tabular inline-flex items-center gap-1 rounded-full border border-cyan px-2.5 py-1 text-[11px] font-bold text-navy">
                                  <Navigation className="h-3 w-3" aria-hidden="true" />
                                  {b.distance.toFixed(1)} km
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-[15px] leading-relaxed text-ink/85">
                              {b.address}
                            </p>

                            <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[14px] sm:grid-cols-2">
                              <div className="flex items-start gap-2">
                                <dt className="sr-only">Contact</dt>
                                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-deep" aria-hidden="true">
                                  <path
                                    d="M4 5c0 8 7 15 15 15l2-3-4-2-2 2c-2-1-5-4-6-6l2-2-2-4z"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  />
                                </svg>
                                <dd className="tabular min-w-0 break-words">
                                  {b.contact ? (
                                    <a
                                      className="font-semibold text-navy hover:text-cyan-deep"
                                      href={`tel:${b.contact.replace(/[^0-9+]/g, "")}`}
                                    >
                                      {b.contact}
                                    </a>
                                  ) : (
                                    <span className="text-steel">Contact number not yet published</span>
                                  )}
                                </dd>
                              </div>

                              <div className="flex items-start gap-2">
                                <dt className="sr-only">Hours</dt>
                                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-deep" aria-hidden="true">
                                  <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                  <path d="M12 7v5.5l3.5 2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                </svg>
                                <dd className="tabular">
                                  {b.hours ?? (
                                    <span className="text-steel">Hours to be confirmed</span>
                                  )}
                                </dd>
                              </div>

                              {b.email && (
                                <div className="flex items-start gap-2 sm:col-span-2">
                                  <dt className="sr-only">Email</dt>
                                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-deep" aria-hidden="true">
                                    <rect x="3" y="5.5" width="18" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M3.5 6.5L12 13l8.5-6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                  </svg>
                                  <dd className="min-w-0 break-all">
                                    <a
                                      href={`mailto:${b.email}`}
                                      className="text-navy underline decoration-cyan underline-offset-2 hover:text-cyan-deep"
                                    >
                                      {b.email}
                                    </a>
                                  </dd>
                                </div>
                              )}
                            </dl>

                            {b.notes && (
                              <p className="mt-3 border-l-2 border-hair pl-3 text-[13px] text-steel">
                                {b.notes}
                              </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => startBooking(b.slug)}
                                className="btn btn-primary flex-1"
                              >
                                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                                Book Appointment
                              </button>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  `${b.name} ${b.address}`,
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline"
                              >
                                <Navigation className="h-4 w-4" aria-hidden="true" />
                                Directions
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelected(b.slug);
                                  document
                                    .getElementById("branch-map")
                                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                                }}
                                aria-label={`Show ${b.name} on the map`}
                                className="btn btn-ghost btn-sm !text-steel w-full sm:w-auto"
                              >
                                <Crosshair className="h-4 w-4" aria-hidden="true" />
                                View on map
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}

              <p className="border-t border-hair pt-4 text-[14px] text-steel">
                18 branches are published in this directory while the remaining sites of the
                23-branch network complete their PhilHealth CY 2026 provider listings. Hotline
                for all branches:{" "}
                <a href="tel:09286052684" className="tabular font-semibold text-navy">
                  0928 605 2684
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as LeafletTypes from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, MapPinned, Maximize, Navigation, CalendarPlus, X, Phone, MapPin } from "lucide-react";
import type { Branch } from "@/lib/types";

export interface MapBranch extends Branch {
  distance?: number | null;
}

interface BranchMapProps {
  branches: MapBranch[];
  selectedSlug?: string | null;
  onSelect?: (slug: string | null) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  onLocate?: () => void;
  onBook?: (slug: string) => void;
}

const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

function pinHtml(opts: { bg: string; label: string; size: number; ring?: string }) {
  const { bg, label, size, ring } = opts;
  const font = size >= 40 ? 12 : 11;
  return (
    `<div style="width:${size}px;height:${size}px;border-radius:9999px;` +
    `background:${bg};border:3px solid #ffffff;` +
    `box-shadow:0 2px 10px rgba(4,24,47,.45)${ring ? `,0 0 0 5px ${ring}` : ""};` +
    `display:flex;align-items:center;justify-content:center;` +
    `color:#ffffff;font-family:Inter,'Segoe UI',sans-serif;font-weight:800;font-size:${font}px;` +
    `letter-spacing:.02em;line-height:1;">${label}</div>`
  );
}

export function BranchMap({
  branches,
  selectedSlug = null,
  onSelect,
  userCoords = null,
  onLocate,
  onBook,
}: BranchMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletTypes.Map | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<LeafletTypes.Marker[]>([]);
  const userMarkerRef = useRef<LeafletTypes.Marker | LeafletTypes.CircleMarker | null>(null);
  const fittedKeyRef = useRef<string>("");
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const selected: MapBranch | null = useMemo(
    () => branches.find((b) => b.slug === selectedSlug) ?? null,
    [branches, selectedSlug],
  );

  const branchKey = useMemo(() => branches.map((b) => b.slug).join(","), [branches]);

  // ── Initialise the Leaflet map once (client only) ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    let map: LeafletTypes.Map | null = null;

    (async () => {
      try {
        const L = await import("leaflet");
        if (cancelled || !containerRef.current || mapRef.current) return;
        leafletRef.current = L;

        map = L.map(containerRef.current, {
          center: [12.4, 122.2],
          zoom: 6,
          scrollWheelZoom: false,
          zoomControl: true,
          attributionControl: true,
        });
        mapRef.current = map;

        L.tileLayer(OSM_TILES, {
          maxZoom: 19,
          detectRetina: true,
          attribution: OSM_ATTR,
        }).addTo(map);

        L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

        map.on("click", () => onSelectRef.current?.(null));
        map.on("focus", () => map?.scrollWheelZoom.enable());
        map.on("blur", () => map?.scrollWheelZoom.disable());

        setReady(true);
        requestAnimationFrame(() => map?.invalidateSize());
      } catch (err) {
        console.error("Leaflet failed to load", err);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      markersRef.current = [];
      userMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Rebuild branch markers when the filtered list changes ──────────────────
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    branches.forEach((b) => {
      const isOn = b.slug === selectedSlug;
      const icon = L.divIcon({
        className: "sbi-div-icon",
        html: pinHtml({
          bg: b.isHq ? "#E31E24" : "#0A3D7A",
          label: b.isHq ? "HQ" : "＋",
          size: isOn ? 44 : 34,
          ring: isOn ? "rgba(0,174,239,.55)" : undefined,
        }),
        iconSize: [isOn ? 44 : 34, isOn ? 44 : 34],
        iconAnchor: [isOn ? 22 : 17, isOn ? 22 : 17],
      });

      const marker = L.marker([b.latitude, b.longitude], {
        icon,
        title: b.name,
        alt: b.name,
        keyboard: true,
        riseOnHover: true,
        zIndexOffset: isOn ? 1000 : 0,
      });

      marker.bindTooltip(
        `<strong style="font-family:Inter,sans-serif;font-size:13px;">${b.name}</strong><br/><span style="font-size:12px;">${b.city} · ${b.region}</span>`,
        { direction: "top", offset: [0, -18], opacity: 1 },
      );

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectRef.current?.(b.slug);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // Fit the filtered set (once per filter change); fly when a pin is chosen.
    if (branches.length > 0 && fittedKeyRef.current !== branchKey) {
      fittedKeyRef.current = branchKey;
      if (!selectedSlug) {
        const bounds = L.latLngBounds(
          branches.map((b) => [b.latitude, b.longitude] as [number, number]),
        );
        map.fitBounds(bounds.pad(0.18), { animate: true });
      }
    } else if (branches.length === 0) {
      map.setView([12.4, 122.2], 6, { animate: true });
    }
  }, [branches, branchKey, selectedSlug, ready]);

  // ── Fly to the selected pin ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !selected) return;
    const z = Math.max(map.getZoom(), 12);
    map.flyTo([selected.latitude, selected.longitude], z, { duration: 0.7 });
  }, [selectedSlug, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── "You are here" marker ──────────────────────────────────────────────────
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !ready) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (!userCoords) return;

    const dot = L.marker([userCoords.latitude, userCoords.longitude], {
      title: "Your location",
      alt: "Your location",
      keyboard: false,
      zIndexOffset: 2000,
      icon: L.divIcon({
        className: "sbi-div-icon",
        html: pinHtml({ bg: "#00AEEF", label: "●", size: 26, ring: "rgba(0,174,239,.35)" }),
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
    });
    dot.bindTooltip("<strong>You are here</strong>", { direction: "top", offset: [0, -14] });
    dot.addTo(map);
    userMarkerRef.current = dot;
  }, [userCoords, ready]);

  const fitAll = () => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || branches.length === 0) return;
    const bounds = L.latLngBounds(
      branches.map((b) => [b.latitude, b.longitude] as [number, number]),
    );
    fittedKeyRef.current = branchKey;
    map.flyToBounds(bounds.pad(0.18), { duration: 0.7 });
  };

  const directionsUrl = (b: MapBranch) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.address}`)}`;
  const osmDirectionsUrl = (b: MapBranch) =>
    `https://www.openstreetmap.org/directions?to=${b.latitude}%2C${b.longitude}`;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#EFF5FB]">
      {/* Leaflet mount */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        role="application"
        aria-label={`OpenStreetMap showing ${branches.length} SBI branch locations. Use plus and minus keys to zoom; tab reaches each branch pin.`}
      />

      {/* Top-right tool cluster */}
      <div className="absolute top-3 right-3 z-[500] flex flex-col items-end gap-2">
        <span className="plate-label inline-flex items-center gap-1.5 rounded-full border border-hair bg-white/95 px-3 py-2 text-navy shadow-[0_10px_24px_-16px_rgba(6,37,74,0.8)]">
          <MapPinned className="h-3.5 w-3.5 text-cyan-deep" aria-hidden="true" />
          <span className="tabular">{branches.length}</span> pin{branches.length === 1 ? "" : "s"} ·
          OpenStreetMap
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={fitAll} className="btn btn-outline btn-sm bg-white/95">
            <Maximize className="h-3.5 w-3.5" aria-hidden="true" />
            Fit all
          </button>
          {onLocate && (
            <button type="button" onClick={onLocate} className="btn btn-accent btn-sm">
              <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
              Locate me
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-6 left-3 z-[500] hidden border border-hair bg-white/95 px-3 py-2 text-[12px] text-ink shadow-sm sm:block"
        aria-hidden="true"
      >
        <span className="mr-3 inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-navy" /> Branch
        </span>
        <span className="mr-3 inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-alert" /> HQ
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-cyan" /> You
        </span>
      </div>

      {/* Selected-branch detail card */}
      {selected && (
        <div
          className="absolute inset-x-3 bottom-3 z-[500] overflow-hidden rounded-xl border border-navy/15 bg-white/97 shadow-[0_30px_60px_-34px_rgba(6,37,74,0.9)] backdrop-blur-md"
          role="dialog"
          aria-label={`Branch details: ${selected.name}`}
        >
          <div className="flex gap-3 p-4">
            <div className="w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="eyebrow text-cyan-deep">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {selected.region} · {selected.city}
                    {selected.distance != null && (
                      <span className="tabular"> · {selected.distance.toFixed(1)} km away</span>
                    )}
                  </p>
                  <h4 className="mt-1 text-[18px] leading-tight text-navy">{selected.name}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect?.(null)}
                  aria-label="Close branch details"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hair bg-white text-navy transition-colors hover:border-cyan hover:text-cyan-deep"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-1.5 text-[14px] leading-snug text-ink/85">{selected.address}</p>
              <p className="tabular mt-1.5 text-[13px] text-steel">
                {selected.contact ? (
                  <a
                    href={`tel:${selected.contact.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 font-bold text-navy hover:text-cyan-deep"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    {selected.contact}
                  </a>
                ) : (
                  "Contact TBA · Hotline 0928 605 2684"
                )}
                {selected.hours ? ` · ${selected.hours}` : " · Hours TBA"}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={directionsUrl(selected)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                  Directions
                </a>
                <button
                  type="button"
                  onClick={() => onBook?.(selected.slug)}
                  className="btn btn-accent btn-sm"
                >
                  <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                  Book here
                </button>
              </div>
              <p className="mt-2 text-[12px] text-steel">
                Opens in Google Maps ·{" "}
                <a
                  href={osmDirectionsUrl(selected)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-cyan-deep"
                >
                  or route with OpenStreetMap
                </a>{" "}
                <span className="tabular">
                  ({selected.latitude.toFixed(4)}, {selected.longitude.toFixed(4)})
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading / error overlays */}
      {!ready && !failed && (
        <div className="absolute inset-0 z-[400] flex flex-col items-center justify-center gap-3 bg-[#EFF5FB]">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-4 w-56" />
          <p className="plate-label text-steel">Loading OpenStreetMap…</p>
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 z-[400] flex flex-col items-center justify-center gap-3 bg-white p-6 text-center">
          <p className="text-lg font-bold text-navy">The map could not load.</p>
          <p className="max-w-sm text-[14px] text-steel">
            Check your connection and reload — every branch is still listed below with
            Directions links.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-navy px-5 py-3 text-[13px] font-extrabold tracking-[0.1em] text-white uppercase"
          >
            Reload map
          </button>
        </div>
      )}
      {ready && branches.length === 0 && !failed && (
        <div className="absolute top-16 left-1/2 z-[500] w-max max-w-[90%] -translate-x-1/2 border border-hair bg-white px-4 py-2 text-center text-[13px] text-steel shadow-sm">
          No pins for this filter — widen the search to see the network.
        </div>
      )}
    </div>
  );
}

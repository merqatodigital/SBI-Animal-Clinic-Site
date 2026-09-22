"use client";

import { useEffect, useState } from "react";
import type { Service } from "@/lib/types";
import { SkuCatalogue } from "./SkuCatalogue";

/**
 * Full-screen SKU catalogue panel. Opens when `sbi:open-services` fires —
 * keeps the catalogue out of the homepage flow while staying reachable on
 * platforms that only serve a single route.
 */
export function ServicesOverlay({ services }: { services: Service[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      document.body.style.overflow = "hidden";
    };
    window.addEventListener("sbi:open-services", onOpen);
    return () => window.removeEventListener("sbi:open-services", onOpen);
  }, []);

  useEffect(() => {
    if (!open) document.body.style.overflow = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9000] overflow-y-auto bg-paper"
      role="dialog"
      aria-modal="true"
      aria-label="SKU catalogue"
    >
      <SkuCatalogue services={services} onClose={() => setOpen(false)} />
    </div>
  );
}

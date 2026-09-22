"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
// The admin implementation IS the /admin page module — reused here as an
// in-page full-screen panel so admin never depends on a separate URL existing
// (some preview/proxy platforms only serve the root route).
import AdminPanel from "@/app/admin/page";

/**
 * In-page admin overlay.
 * Opens when `sbi:open-admin-panel` fires (after a valid passkey) or when the
 * user presses Ctrl/Cmd+Shift+A / adds ?admin=1 while already unlocked.
 */
export function AdminOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Let the passkey gate know an in-page panel is available (avoids routing
    // to /admin on platforms where that path 404s).
    (window as unknown as Record<string, unknown>).__sbiAdminPanel = "ready";
    const onOpen = () => setOpen(true);
    window.addEventListener("sbi:open-admin-panel", onOpen);
    return () => {
      delete (window as unknown as Record<string, unknown>).__sbiAdminPanel;
      window.removeEventListener("sbi:open-admin-panel", onOpen);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-y-auto bg-paper"
      role="dialog"
      aria-modal="true"
      aria-label="SBI admin control panel"
    >
      <AdminPanel />
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close admin panel and return to site"
        className="fixed right-4 bottom-4 z-[10001] flex h-12 w-12 items-center justify-center rounded-full border border-navy/20 bg-white text-navy shadow-[0_20px_44px_-24px_rgba(6,37,74,0.9)] transition-transform hover:-translate-y-0.5 hover:text-cyan-deep"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

/**
 * Backup openers so admin is never unreachable:
 * - Triple-click the logo (handled by SiteHeader → AdminGate).
 * - Visit any page with ?admin=1 (or #admin) → opens the passkey gate.
 * - Press Ctrl+Shift+A (or Cmd+Shift+A) anywhere → opens the passkey gate.
 * - A nearly invisible corner dot (bottom-right) opens the gate on click.
 *
 * On this platform `/admin` may 404 behind the preview proxy, so after a valid
 * passkey the control panel opens IN-PAGE (see AdminOverlay) instead of
 * navigating to another URL.
 */
export function AdminShortcut() {
  const [gate, setGate] = useState(false);

  const openGate = () => {
    // SiteHeader owns the canonical gate; if it is mounted, reuse it.
    window.dispatchEvent(new CustomEvent("sbi:open-admin"));
    setGate(true);
  };

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = (params.get("admin") || "").toLowerCase();
      const wantsAdmin =
        q === "1" || q === "open" || q === "true" || window.location.hash === "#admin";
      if (wantsAdmin) {
        const t = setTimeout(openGate, 400);
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("admin");
          if (url.hash === "#admin") url.hash = "";
          window.history.replaceState(null, "", url.toString());
        } catch {
          /* ignore */
        }
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }

    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        openGate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Discreet corner trigger — hidden, still reachable on every screen size */}
      <button
        type="button"
        onClick={openGate}
        aria-label="Admin access"
        title="Admin access"
        className="fixed right-3 bottom-3 z-[9000] h-6 w-6 rounded-full border border-navy/10 bg-white/40 opacity-25 backdrop-blur-sm transition-all duration-200 hover:scale-125 hover:opacity-100 focus-visible:opacity-100"
      >
        <Lock className="mx-auto h-3 w-3 text-navy" aria-hidden="true" />
      </button>

      {/* If this page has no SiteHeader gate mounted, render our own */}
      <NoHeaderGate forceOpen={gate} onClose={() => setGate(false)} />
    </>
  );
}

function NoHeaderGate({ forceOpen, onClose }: { forceOpen: boolean; onClose: () => void }) {
  const [hasHeaderGate, setHasHeaderGate] = useState(false);

  useEffect(() => {
    // SiteHeader's AdminGate calls open-admin AND has its own modal. If none
    // responded within a frame, we show our own copy of the gate.
    const onOpen = () => {
      setTimeout(() => {
        const mounted = document.querySelector('[aria-label="Admin access"][role="dialog"]');
        if (!mounted) setHasHeaderGate(true);
      }, 80);
    };
    window.addEventListener("sbi:open-admin", onOpen);
    return () => window.removeEventListener("sbi:open-admin", onOpen);
  }, []);

  useEffect(() => {
    if (forceOpen && !hasHeaderGate) {
      const t = setTimeout(() => {
        const mounted = document.querySelector('[aria-label="Admin access"][role="dialog"]');
        if (!mounted) setHasHeaderGate(true);
      }, 160);
      return () => clearTimeout(t);
    }
  }, [forceOpen, hasHeaderGate]);

  if (!forceOpen || !hasHeaderGate) return null;
  return <FallbackGate onClose={onClose} />;
}

function FallbackGate({ onClose }: { onClose: () => void }) {
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkey.trim() }),
      });
      if (!res.ok) throw new Error("Wrong passkey — try again.");
      try {
        localStorage.setItem("sbi_admin_ok", "1");
        localStorage.setItem("sbi_admin_passkey", passkey.trim());
        sessionStorage.setItem("sbi_admin_ok", "1");
        sessionStorage.setItem("sbi_admin_passkey", passkey.trim());
      } catch {
        /* ignore */
      }
      onClose();
      setTimeout(() => window.dispatchEvent(new CustomEvent("sbi:open-admin-panel")), 120);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy-deep/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Admin access"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-[1.5rem] border border-navy/15 bg-white shadow-[0_40px_90px_-44px_rgba(0,174,239,0.85)]"
      >
        <div className="border-b-2 border-navy p-5">
          <p className="plate-label flex items-center gap-2 text-cyan-deep">
            <Lock className="h-4 w-4" aria-hidden="true" /> Restricted · SBI Admin
          </p>
          <h2 className="mt-2 text-[24px] text-navy">Enter passkey</h2>
          <p className="mt-1 text-[14px] text-steel">
            The control panel opens right here in the page — no navigation needed.
          </p>
        </div>
        <div className="space-y-3 p-5">
          <label htmlFor="fallback-passkey" className="plate-label text-steel">
            Passkey
          </label>
          <input
            id="fallback-passkey"
            type="password"
            inputMode="numeric"
            autoFocus
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="••••"
            className="tabular h-14 w-full rounded-xl border border-hair bg-paper px-4 text-center text-[22px] tracking-[0.5em] text-navy focus:border-cyan focus:outline-none"
          />
          {error && (
            <p role="alert" className="border-l-4 border-alert bg-alert/10 px-3 py-2 text-[14px] text-alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !passkey.trim()}
              className="btn btn-primary flex-1"
            >
              {busy ? "Checking…" : "Unlock →"}
            </button>
          </div>
          <p className="text-center text-[12px] text-steel">
            Hint while building: <span className="tabular font-bold text-navy">5309</span>
          </p>
        </div>
      </form>
    </div>
  );
}

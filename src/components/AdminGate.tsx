"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

export const ADMIN_FLAG = "sbi_admin_ok";
export const ADMIN_KEY = "sbi_admin_passkey";

function storageGet(k: string): string | null {
  try {
    return localStorage.getItem(k) ?? sessionStorage.getItem(k);
  } catch {
    return null;
  }
}

function storageSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}

function storageDel(k: string) {
  try {
    localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

export function clearAdminSession() {
  storageDel(ADMIN_FLAG);
  storageDel(ADMIN_KEY);
}

/**
 * Triple-click / triple-tap detector.
 * - Generous 1500ms window (works for mouse + touch, all devices).
 * - Returns an event handler: call it from onClick. On the 3rd click it calls
 *   e.preventDefault() so the logo's "#top" jump doesn't steal the gesture,
 *   then fires onTriple.
 */
export function useTripleClick(onTriple: () => void, windowMs = 1500) {
  const clicks = useRef<number[]>([]);
  const cb = useRef(onTriple);
  cb.current = onTriple;
  return (e?: { preventDefault?: () => void }) => {
    const now = Date.now();
    clicks.current = [...clicks.current, now].filter((t) => now - t < windowMs);
    if (clicks.current.length >= 3) {
      clicks.current = [];
      try {
        e?.preventDefault?.();
      } catch {
        /* ignore */
      }
      cb.current();
    }
  };
}

export function isAdminUnlocked() {
  return storageGet(ADMIN_FLAG) === "1";
}

export function getStoredPasskey() {
  return storageGet(ADMIN_KEY) || "";
}

/**
 * Hidden passkey modal.
 * Rendered via portal to document.body so it is NEVER trapped inside the
 * sticky header's backdrop-blur stacking context (that bug made the dialog
 * render inside the header and appear "unopenable").
 */
export function AdminGate({
  forceOpen,
  onClose,
}: {
  forceOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setPasskey("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 80);
      // Lock background scroll while the gate is open (uniform on all devices).
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKey = (ev: KeyboardEvent) => {
        if (ev.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [forceOpen, onClose]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (passkey.trim().length === 0) return;
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
      storageSet(ADMIN_FLAG, "1");
      storageSet(ADMIN_KEY, passkey.trim());
      onClose();
      // Prefer the in-page panel: on some preview platforms /admin 404s.
      const hasPanel =
        (window as unknown as Record<string, unknown>).__sbiAdminPanel === "ready";
      if (hasPanel) {
        setTimeout(
          () => window.dispatchEvent(new CustomEvent("sbi:open-admin-panel")),
          150,
        );
      } else {
        router.push("/admin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {forceOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy-deep/80 p-4 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Admin access"
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="w-full max-w-sm overflow-hidden rounded-xl border border-navy/15 bg-white shadow-[0_40px_90px_-44px_rgba(0,174,239,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b-2 border-navy p-5">
              <p className="plate-label flex items-center gap-2 text-cyan-deep">
                <Lock className="h-4 w-4" aria-hidden="true" /> Restricted · SBI Admin
              </p>
              <h2 className="mt-2 text-[24px] text-navy">Enter passkey</h2>
              <p className="mt-1 text-[14px] text-steel">
                This area controls the entire site. Authorised builders only.
              </p>
            </div>
            <form onSubmit={submit} className="space-y-3 p-5">
              <label htmlFor="admin-passkey" className="plate-label text-steel">
                Passkey
              </label>
              <input
                ref={inputRef}
                id="admin-passkey"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="••••"
                className="tabular h-14 w-full border border-hair bg-paper px-4 text-center text-[22px] tracking-[0.5em] text-navy focus:border-cyan focus:outline-none"
              />
              {error && (
                <p role="alert" className="border-l-4 border-alert bg-alert/10 px-3 py-2 text-[14px] text-alert">
                  {error}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-hair px-4 py-3 text-[13px] font-extrabold tracking-[0.1em] text-navy uppercase hover:border-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || passkey.trim().length === 0}
                  className="flex-1 bg-navy px-4 py-3 text-[13px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-cyan hover:text-navy-deep disabled:opacity-50"
                >
                  {busy ? "Checking…" : "Unlock →"}
                </button>
              </div>
              <p className="text-center text-[12px] text-steel">
                Hint while building: <span className="tabular font-bold text-navy">5309</span>
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

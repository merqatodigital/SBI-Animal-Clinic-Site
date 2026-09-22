"use client";

import { useEffect } from "react";
import { DEFAULT_THEME, type ThemeSettings } from "@/lib/cms";

/** Applies the admin-controlled palette + fonts as live CSS variables. */
export function ThemeInjector({ theme }: { theme?: ThemeSettings | null }) {
  useEffect(() => {
    const t = { ...DEFAULT_THEME, ...(theme ?? {}) };
    const root = document.documentElement;
    root.style.setProperty("--color-navy", t.navy);
    root.style.setProperty("--color-navy-deep", t.navyDeep);
    root.style.setProperty("--color-ink", t.ink);
    root.style.setProperty("--color-cyan", t.cyan);
    root.style.setProperty("--color-cyan-deep", t.cyanDeep);
    root.style.setProperty("--color-cyan-soft", t.cyanSoft);
    root.style.setProperty("--color-alert", t.alert);
    root.style.setProperty("--color-alert-deep", t.alertDeep);
    root.style.setProperty("--color-paper", t.paper);
    root.style.setProperty("--color-hair", t.hair);
    root.style.setProperty("--color-steel", t.steel);
    root.style.setProperty("--color-leaf", t.leaf);
    root.style.setProperty("--font-display", `"${t.fontDisplay}", "Segoe UI", system-ui, sans-serif`);
    root.style.setProperty("--font-body", `"${t.fontBody}", "Segoe UI", system-ui, sans-serif`);
    document.body.style.fontSize = `${t.baseFontSize || 16}px`;

    // Load the chosen Google fonts on demand (no rebuild needed).
    const id = "sbi-admin-fonts";
    const families = Array.from(new Set([t.fontDisplay, t.fontBody]))
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800`)
      .join("&");
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  }, [theme]);

  return null;
}

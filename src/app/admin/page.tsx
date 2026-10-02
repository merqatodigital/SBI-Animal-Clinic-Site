"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Palette,
  Heading,
  LayoutList,
  MessageCircle,
  Image as ImageIcon,
  Share2,
  Phone,
  MapPin,
  Calendar,
  Database,
  LogOut,
  Plus,
  Trash2,
  Save,
  Upload,
  Eye,
  EyeOff,
  Menu,
  X,
  Globe,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { MediaPicker } from "@/components/MediaPicker";
import {
  DEFAULT_BRANDING,
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_HERO,
  DEFAULT_THEME,
  FONT_CHOICES,
  SOCIAL_PLATFORMS,
  type BrandingSettings,
  type FooterSettings,
  type HeaderSettings,
  type HeroSettings,
  type ThemeSettings,
} from "@/lib/cms";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "theme", label: "Colors & Fonts", icon: Palette },
  { id: "header", label: "Header & Hero", icon: Heading },
  { id: "sections", label: "Sections", icon: LayoutList },
  { id: "faqs", label: "FAQs", icon: MessageCircle },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "socials", label: "Socials", icon: Share2 },
  { id: "footer", label: "Footer & Dev", icon: Phone },
  { id: "branches", label: "Branches", icon: MapPin },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "backend", label: "Neon Backend", icon: Database },
] as const;

type TabId = (typeof TABS)[number]["id"];

function storedPasskey(): string {
  try {
    return localStorage.getItem("sbi_admin_passkey") || sessionStorage.getItem("sbi_admin_passkey") || "5309";
  } catch {
    return "5309";
  }
}

function headers(): HeadersInit {
  return { "Content-Type": "application/json", "x-sbi-passkey": storedPasskey() };
}
function mediaHeaders(): HeadersInit {
  return { "x-sbi-passkey": storedPasskey() };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { ...headers(), ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json as T;
}

/**
 * A logo picked from a device is stored as a `data:` URL so it keeps working on
 * read-only hosts. Printing that URL renders ~150 KB of base64 as page text, so
 * summarise it instead. Real paths and http(s) URLs are shown verbatim.
 */
function describeLogoSource(url: string): string {
  if (url.startsWith("data:image/")) {
    const [header, payload = ""] = url.split(",");
    const mime = (header.slice("data:".length).split(";")[0] || "image").replace(/^image\//, "");
    const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
    const bytes = Math.max(0, Math.floor((payload.length * 3) / 4) - padding);
    const size =
      bytes >= 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `Uploaded file · ${mime.toUpperCase()} · ${size} · stored inline with the site settings, so no file host is needed.`;
  }
  if (/^(https?:|blob:|\/)/.test(url)) return url;
  return `/${url}`;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="plate-label text-steel">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[12px] text-steel">{hint}</span>}
    </label>
  );
}
const inputCls =
  "h-12 w-full border border-hair bg-white px-3 text-[15px] text-ink focus:border-cyan focus:outline-none";
const areaCls =
  "min-h-[96px] w-full border border-hair bg-white px-3 py-2.5 text-[15px] text-ink focus:border-cyan focus:outline-none";

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 border border-hair bg-white p-3">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#0A3D7A"}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-14 shrink-0 cursor-pointer border border-hair bg-white p-1"
        aria-label={`${label} color picker`}
      />
      <div className="min-w-0 flex-1">
        <p className="plate-label text-steel">{label}</p>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="tabular mt-0.5 w-full bg-transparent text-[15px] font-bold text-navy focus:outline-none"
        />
      </div>
      <span className="h-8 w-8 shrink-0 border border-hair" style={{ background: value }} aria-hidden="true" />
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passkey, setPasskey] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** Where the live content comes from: database | local-file | defaults. */
  const [contentSource, setContentSource] = useState<string | null>(null);

  const [overview, setOverview] = useState<any>(null);
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [header, setHeader] = useState<HeaderSettings>(DEFAULT_HEADER);
  const [hero, setHero] = useState<HeroSettings>(DEFAULT_HERO);
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER);
  const [sections, setSections] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [newSocial, setNewSocial] = useState({ platform: "facebook", label: "", url: "" });
  const [branchFilter, setBranchFilter] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3200);
  };

  // ── Auth: local flag (all tabs) + httpOnly-cookie probe as fallback ──────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let flag = false;
      try {
        flag =
          localStorage.getItem("sbi_admin_ok") === "1" ||
          sessionStorage.getItem("sbi_admin_ok") === "1";
      } catch {
        flag = false;
      }
      if (flag) {
        if (!cancelled) setAuthed(true);
        return;
      }
      // No local flag (e.g. fresh tab) — ask the server: the login cookie may
      // already be present. This makes /admin work even without the flag.
      try {
        const res = await fetch("/api/admin/overview", {
          credentials: "include",
          headers: mediaHeaders(),
        });
        if (!cancelled) setAuthed(res.ok);
      } catch {
        if (!cancelled) setAuthed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function persistSession(key: string) {
    try {
      localStorage.setItem("sbi_admin_ok", "1");
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.setItem("sbi_admin_ok", "1");
    } catch {
      /* ignore */
    }
    try {
      localStorage.setItem("sbi_admin_passkey", key);
    } catch {
      /* ignore */
    }
    try {
      sessionStorage.setItem("sbi_admin_passkey", key);
    } catch {
      /* ignore */
    }
  }

  function clearSession() {
    for (const store of [localStorage, sessionStorage]) {
      try {
        store.removeItem("sbi_admin_ok");
        store.removeItem("sbi_admin_passkey");
      } catch {
        /* ignore */
      }
    }
  }

  async function login(e?: React.FormEvent) {
    e?.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkey.trim() }),
      });
      if (!res.ok) throw new Error("Wrong passkey — try again.");
      persistSession(passkey.trim());
      setAuthed(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "include" }).catch(() => {});
    clearSession();
    setAuthed(false);
    setPasskey("");
  }

  // ── Loaders ─────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const [ov, set, sec, fq, so, me, br, bo] = await Promise.all([
      api<any>("/api/admin/overview").catch(() => null),
      api<any>("/api/admin/settings").catch(() => null),
      api<any>("/api/admin/sections").catch(() => ({ sections: [] })),
      api<any>("/api/admin/faqs").catch(() => ({ faqs: [] })),
      api<any>("/api/admin/socials").catch(() => ({ socials: [] })),
      fetch("/api/admin/media", { headers: mediaHeaders(), credentials: "include" }).then((r) => r.json()).catch(() => ({ media: [] })),
      api<any>("/api/admin/branches").catch(() => ({ branches: [] })),
      api<any>("/api/admin/bookings?limit=50").catch(() => ({ bookings: [] })),
    ]);
    if (ov) setOverview(ov);
    if (set?.dataSource) setContentSource(set.dataSource);
    if (set?.settings) {
      const parse = (k: string, fb: any) => {
        try {
          return { ...fb, ...JSON.parse(set.settings[k] ?? "{}") };
        } catch {
          return fb;
        }
      };
      setBranding(parse("branding", DEFAULT_BRANDING));
      setTheme(parse("theme", DEFAULT_THEME));
      setHeader(parse("header", DEFAULT_HEADER));
      setHero(parse("hero", DEFAULT_HERO));
      setFooter(parse("footer", DEFAULT_FOOTER));
    }
    setSections(sec.sections ?? []);
    setFaqs(fq.faqs ?? []);
    setSocials(so.socials ?? []);
    setMedia(me.media ?? []);
    setBranches(br.branches ?? []);
    setBookings(bo.bookings ?? []);
  }, []);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed, loadAll]);

  async function saveSetting(key: string, value: unknown) {
    setSaving(key);
    try {
      const res = await api<{ persisted?: string; note?: string }>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ key, value }),
      });
      // Say exactly where the save landed — a silent redirect to the local
      // store is what made an uploaded logo look like it had been ignored.
      if (res.persisted === "local-file") {
        setContentSource("local-file");
        flash(
          `${key} saved on this server and live on the site now — no database is storing it yet. ` +
            "Connect DATABASE_URL (NEON_SETUP.md) to keep it in the cloud.",
        );
      } else {
        setContentSource("database");
        flash(`${key} saved — live on the site now.`);
      }
      // Live-apply theme instantly.
      if (key === "theme") {
        const t = value as ThemeSettings;
        const root = document.documentElement;
        Object.entries({
          "--color-navy": t.navy, "--color-navy-deep": t.navyDeep, "--color-ink": t.ink,
          "--color-cyan": t.cyan, "--color-cyan-deep": t.cyanDeep, "--color-cyan-soft": t.cyanSoft,
          "--color-alert": t.alert, "--color-alert-deep": t.alertDeep, "--color-paper": t.paper,
          "--color-hair": t.hair, "--color-steel": t.steel, "--color-leaf": t.leaf,
        }).forEach(([k, v]) => root.style.setProperty(k, v as string));
      }
    } catch (err) {
      flash(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(null);
    }
  }

  async function uploadMedia(files: FileList | File[]) {
    const list = Array.from(files).slice(0, 10);
    if (!list.length) return;
    setSaving("media");
    try {
      const form = new FormData();
      list.forEach((f) => form.append("files", f));
      const res = await fetch("/api/admin/media", { method: "POST", headers: mediaHeaders(), credentials: "include", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setMedia((m) => [...(json.media ?? []), ...m]);
      flash(`${json.media.length} file(s) uploaded from device.`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSaving(null);
    }
  }

  const filteredBranches = useMemo(() => {
    const q = branchFilter.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) =>
      [b.name, b.city, b.address, b.contact].filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [branches, branchFilter]);

  // ── Locked screen ───────────────────────────────────────────────────────
  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="plate-label text-steel">Loading admin…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep p-4">
        <form
          onSubmit={login}
          className="w-full max-w-sm overflow-hidden rounded-xl border border-navy/15 bg-white shadow-[0_40px_90px_-44px_rgba(0,174,239,0.85)]"
        >
          <div className="flex justify-center border-b border-hair pt-6">
            <Logo className="h-16 w-auto" />
          </div>
          <div className="p-6">
            <p className="plate-label flex items-center gap-2 text-cyan-deep">
              <Lock className="h-4 w-4" aria-hidden="true" /> SBI Admin · Restricted
            </p>
            <h1 className="mt-2 text-[26px] text-navy">Site control room</h1>
            <p className="mt-1 text-[14px] text-steel">
              Triple-click the site logo anywhere to reach this gate. Enter the builder passkey.
            </p>
            <label htmlFor="passkey" className="plate-label mt-5 block text-steel">Passkey</label>
            <input
              id="passkey"
              type="password"
              inputMode="numeric"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="••••"
              className="tabular mt-1.5 h-14 w-full border border-hair bg-paper px-4 text-center text-[22px] tracking-[0.5em] text-navy focus:border-cyan focus:outline-none"
            />
            {loginError && (
              <p role="alert" className="mt-3 border-l-4 border-alert bg-alert/10 px-3 py-2 text-[14px] text-alert">
                {loginError}
              </p>
            )}
            <button
              type="submit"
                  className="btn btn-primary btn-lg btn-block"
                >
                  Unlock admin
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
            <p className="mt-3 text-center text-[12px] text-steel">
              Builder hint: <span className="tabular font-bold text-navy">5309</span> ·{" "}
              <Link href="/" className="underline underline-offset-2">← back to site</Link>
            </p>
          </div>
        </form>
      </div>
    );
  }

  const counts = overview?.counts ?? {};

  return (
    <div data-admin className="min-h-screen bg-paper text-ink">
      {/* Admin top bar — same plate language as the site */}
      <header className="sticky top-0 z-50 border-b border-hair bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
          <Logo src={branding.logoUrl} className="h-10 w-auto" />
          <span className="bg-navy px-2 py-1 text-[11px] font-extrabold tracking-[0.14em] text-white uppercase">
            Admin
          </span>
          <button
            type="button"
            className="ml-auto flex h-11 w-11 items-center justify-center border border-hair text-navy lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close admin menu" : "Open admin menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Link href="/" className="border border-hair px-4 py-2.5 text-[12px] font-extrabold tracking-[0.1em] text-navy uppercase hover:border-cyan-deep hover:text-cyan-deep">
              <Globe className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> View site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="bg-navy px-4 py-2.5 text-[12px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-alert"
            >
              <LogOut className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> Lock
            </button>
          </div>
        </div>
        {/* Mobile tab drawer */}
        {menuOpen && (
          <nav className="border-t border-hair bg-white px-4 py-2 lg:hidden" aria-label="Admin sections">
            <div className="grid grid-cols-2 gap-2 py-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setTab(t.id); setMenuOpen(false); }}
                  aria-current={tab === t.id}
                  className={`flex items-center gap-2 border px-3 py-3 text-[13px] font-bold ${tab === t.id ? "border-navy bg-navy text-white" : "border-hair bg-white text-navy"}`}
                >
                  <t.icon className="h-4 w-4" aria-hidden="true" /> {t.label}
                </button>
              ))}
              <Link href="/" className="flex items-center gap-2 border border-hair px-3 py-3 text-[13px] font-bold text-navy">
                <Globe className="h-4 w-4" aria-hidden="true" /> View site
              </Link>
              <button type="button" onClick={logout} className="flex items-center gap-2 bg-alert px-3 py-3 text-[13px] font-bold text-white">
                <LogOut className="h-4 w-4" aria-hidden="true" /> Lock admin
              </button>
            </div>
          </nav>
        )}
        {/* Desktop tab rail */}
        <nav className="hidden border-t border-hair lg:block" aria-label="Admin sections">
          <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 sm:px-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-[13px] font-extrabold tracking-wide uppercase transition-colors ${tab === t.id ? "border-cyan text-navy" : "border-transparent text-steel hover:text-navy"}`}
              >
                <t.icon className="h-4 w-4" aria-hidden="true" /> {t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {notice && (
        <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6" role="status">
          <p className="border-l-4 border-leaf bg-white px-4 py-3 text-[14px] font-semibold text-navy shadow-sm">{notice}</p>
        </div>
      )}

      {(overview?.staticMode || contentSource === "local-file") && (
        <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6" role="status">
          <p className="border-l-4 border-leaf bg-white px-4 py-3 text-[14px] font-semibold text-navy shadow-sm">
            No database connected — that is fine. The logo, theme, header, hero, footer and media
            save to this server&apos;s local content store and go live immediately
            {overview?.backend?.localStore ? (
              <>
                {" "}
                (<span className="font-mono text-[12px]">{overview.backend.localStore}</span>)
              </>
            ) : null}
            . Branches, FAQs, sections and bookings still need Postgres/Neon — see NEON_SETUP.md.
          </p>
        </div>
      )}

      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        {/* ── OVERVIEW ─────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div>
              <p className="plate-label text-cyan-deep">Admin · Overview</p>
              <h1 className="mt-1 text-[clamp(1.8rem,4vw,2.8rem)] text-navy">Control room</h1>
              <p className="mt-2 max-w-2xl text-[15px] text-steel">
                Everything on the public site is editable here — palette, fonts, header, hero,
                sections, FAQs, media, socials, footer, branches and bookings. Changes go live
                the moment you press save.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["Branches", counts.branches ?? "–"],
                ["Bookings", counts.bookings ?? "–"],
                ["Sections", counts.sections ?? "–"],
                ["FAQs", counts.faqs ?? "–"],
                ["Socials", counts.socials ?? "–"],
                ["Media", counts.media ?? "–"],
              ].map(([k, v]) => (
                <div key={k} className="card card-hover p-5">
                  <p className="tabular text-[2rem] leading-none font-extrabold text-navy">{v}</p>
                  <p className="plate-label mt-2 text-steel">{k}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="border border-hair bg-white p-5">
                <h2 className="text-[18px] text-navy">Latest bookings</h2>
                <ul className="mt-3 divide-y divide-hair">
                  {(overview?.recentBookings ?? []).length === 0 && (
                    <li className="py-3 text-[14px] text-steel">No bookings yet — triage wizard submissions land here.</li>
                  )}
                  {(overview?.recentBookings ?? []).map((b: any) => (
                    <li key={b.reference} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                      <span><strong className="tabular text-navy">{b.reference}</strong> · {b.patientName} · Cat {b.exposureCategory}</span>
                      <span className="tabular shrink-0 text-steel">{b.appointmentDate}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => setTab("bookings")} className="mt-3 text-[13px] font-extrabold tracking-[0.1em] text-cyan-deep uppercase hover:underline">Manage bookings →</button>
              </div>
              <div className="border border-navy bg-navy p-5 text-white">
                <h2 className="text-[18px]">Backend status</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-[14px]">
                  <div><dt className="plate-label text-white/60">Provider</dt><dd className="mt-1 font-bold">{overview?.backend?.provider ?? "…"}</dd></div>
                  <div><dt className="plate-label text-white/60">Host</dt><dd className="tabular mt-1 break-all">{overview?.backend?.host ?? "…"}</dd></div>
                  <div><dt className="plate-label text-white/60">ORM</dt><dd className="mt-1">Drizzle ORM</dd></div>
                  <div><dt className="plate-label text-white/60">Tables</dt><dd className="tabular mt-1">{overview?.backend?.tables?.length ?? 9} live</dd></div>
                </dl>
                <button type="button" onClick={() => setTab("backend")} className="mt-4 bg-cyan px-4 py-3 text-[12px] font-extrabold tracking-[0.1em] text-navy-deep uppercase hover:-translate-y-0.5">Neon setup guide →</button>
              </div>
            </div>
          </div>
        )}

        {/* ── THEME ────────────────────────────────────────────────── */}
        {tab === "theme" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <div>
              <p className="plate-label text-cyan-deep">Admin · Theme</p>
              <h1 className="mt-1 text-[clamp(1.8rem,4vw,2.6rem)] text-navy">Color palette &amp; fonts</h1>
              <p className="mt-2 text-[15px] text-steel">Every section reads these tokens — change once, re-theme the whole site and admin.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ColorRow label="Primary · Navy" value={theme.navy} onChange={(v) => setTheme({ ...theme, navy: v })} />
                <ColorRow label="Deep navy" value={theme.navyDeep} onChange={(v) => setTheme({ ...theme, navyDeep: v })} />
                <ColorRow label="Ink" value={theme.ink} onChange={(v) => setTheme({ ...theme, ink: v })} />
                <ColorRow label="Accent · Cyan" value={theme.cyan} onChange={(v) => setTheme({ ...theme, cyan: v })} />
                <ColorRow label="Deep cyan" value={theme.cyanDeep} onChange={(v) => setTheme({ ...theme, cyanDeep: v })} />
                <ColorRow label="Soft cyan" value={theme.cyanSoft} onChange={(v) => setTheme({ ...theme, cyanSoft: v })} />
                <ColorRow label="Alert · Red" value={theme.alert} onChange={(v) => setTheme({ ...theme, alert: v })} />
                <ColorRow label="Deep alert" value={theme.alertDeep} onChange={(v) => setTheme({ ...theme, alertDeep: v })} />
                <ColorRow label="Background" value={theme.paper} onChange={(v) => setTheme({ ...theme, paper: v })} />
                <ColorRow label="Hairline" value={theme.hair} onChange={(v) => setTheme({ ...theme, hair: v })} />
                <ColorRow label="Steel text" value={theme.steel} onChange={(v) => setTheme({ ...theme, steel: v })} />
                <ColorRow label="Leaf green" value={theme.leaf} onChange={(v) => setTheme({ ...theme, leaf: v })} />
              </div>
              <div className="mt-4 grid gap-4 border border-hair bg-white p-4 sm:grid-cols-2">
                <Field label="Display font (headings)">
                  <select value={theme.fontDisplay} onChange={(e) => setTheme({ ...theme, fontDisplay: e.target.value })} className={inputCls}>
                    {FONT_CHOICES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Body font">
                  <select value={theme.fontBody} onChange={(e) => setTheme({ ...theme, fontBody: e.target.value })} className={inputCls}>
                    {FONT_CHOICES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label={`Base font size · ${theme.baseFontSize}px`} hint="16px minimum for accessibility">
                  <input type="range" min={14} max={20} value={theme.baseFontSize} onChange={(e) => setTheme({ ...theme, baseFontSize: Number(e.target.value) })} className="w-full" />
                </Field>
                <div className="flex items-end">
                  <button type="button" disabled={saving === "theme"} onClick={() => saveSetting("theme", theme)} className="w-full bg-navy px-5 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-cyan hover:text-navy-deep disabled:opacity-50">
                    <Save className="mr-2 inline h-4 w-4" aria-hidden="true" />{saving === "theme" ? "Saving…" : "Save theme"}
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:sticky lg:top-40 lg:self-start">
              <p className="plate-label text-steel">Live preview · all devices</p>
              <div className="mt-2 border border-hair bg-white p-6" style={{ background: theme.paper }}>
                <p className="plate-label" style={{ color: theme.cyanDeep }}>Preview plate</p>
                <p className="mt-2 text-[2rem] leading-tight font-extrabold" style={{ color: theme.navy, fontFamily: `"${theme.fontDisplay}", sans-serif` }}>
                  Care Beyond Compare
                </p>
                <p className="mt-2 text-[15px]" style={{ color: theme.ink, fontFamily: `"${theme.fontBody}", sans-serif` }}>
                  Body copy in {theme.fontBody} at {theme.baseFontSize}px — wash the wound for 15 minutes.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-4 py-2.5 text-[12px] font-extrabold tracking-[0.1em] text-white uppercase" style={{ background: theme.navy }}>Navy button</span>
                  <span className="px-4 py-2.5 text-[12px] font-extrabold tracking-[0.1em] uppercase" style={{ background: theme.cyan, color: theme.navyDeep }}>Cyan button</span>
                  <span className="px-4 py-2.5 text-[12px] font-extrabold tracking-[0.1em] text-white uppercase" style={{ background: theme.alert }}>Alert</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HEADER & HERO ────────────────────────────────────────── */}
        {tab === "header" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-navy/20 bg-white p-5 lg:col-span-2">
              <p className="plate-label text-cyan-deep">Branding · site logo</p>
              <h2 className="mt-1 text-[22px] text-navy">Upload the official logo</h2>
              <p className="mt-1 max-w-3xl text-[14px] leading-relaxed text-steel">
                Upload the original image from your device. This one file is used in the site header and footer;
                the hero badge is optional. The artwork is displayed with contain sizing (not cropped or stretched).
              </p>
              {/* What the public site is actually serving, so a missing logo is
                  never a mystery: uploaded file, or the built-in drawn mark. */}
              <div className="mt-4 max-w-3xl border border-hair bg-paper p-3">
                <p className="plate-label text-steel">Live on the site right now</p>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center border border-hair bg-white p-1.5">
                    <Logo src={branding.logoUrl} className="h-16 w-16" />
                  </span>
                  <span className="min-w-0 flex-1 text-[13px]">
                    <span className="block font-bold text-navy">
                      {branding.logoUrl ? "Uploaded logo" : "Built-in drawn SBI mark"}
                    </span>
                    <span className="block break-all text-steel">
                      {branding.logoUrl
                        ? describeLogoSource(branding.logoUrl)
                        : "No logo file saved yet — the header, footer and services page keep using the drawn mark until you save one below."}
                    </span>
                    <span className="mt-1 block text-steel">
                      Stored in:{" "}
                      {contentSource === "database"
                        ? "Postgres (site_settings) — shared by every visitor."
                        : contentSource === "local-file"
                          ? "this server's local content store — live immediately, and it survives restarts."
                          : "the built-in defaults that ship with the code."}
                    </span>
                  </span>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-hair bg-white px-4 py-3 text-[12px] font-extrabold tracking-[0.1em] text-navy uppercase hover:border-cyan-deep hover:text-cyan-deep"
                  >
                    View site ↗
                  </a>
                </div>
              </div>

              <div className="mt-4 max-w-3xl">
                <MediaPicker
                  label="Logo image"
                  value={branding.logoUrl}
                  onChange={(logoUrl) => setBranding({ ...branding, logoUrl })}
                  accept="image/*"
                  multiple={false}
                  previewFit="contain"
                  inlineMaxBytes={3 * 1024 * 1024}
                  hint="PNG, JPG, WebP, or SVG; uploaded as-is (never cropped or redrawn). 'From device' embeds the file in the setting; uploading from the Library stores it as a file under /uploads instead — both save without a database. Then press “Save site logo”."
                />
              </div>
              <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-[14px] font-semibold text-navy">
                <input
                  type="checkbox"
                  checked={branding.showHeroLogo}
                  onChange={(e) => setBranding({ ...branding, showHeroLogo: e.target.checked })}
                  className="h-4 w-4 accent-[#0A3D7A]"
                />
                Show this logo on the hero (optional)
              </label>
              <button
                type="button"
                disabled={saving === "branding"}
                onClick={() => saveSetting("branding", branding)}
                className="mt-4 w-full max-w-3xl bg-navy px-5 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-cyan hover:text-navy-deep disabled:opacity-50"
              >
                {saving === "branding" ? "Saving…" : "Save site logo"}
              </button>
            </div>
            <div className="border border-hair bg-white p-5">
              <p className="plate-label text-cyan-deep">Header · emergency ribbon</p>
              <h2 className="mt-1 text-[22px] text-navy">Top banner &amp; nav strip</h2>
              <div className="mt-4 space-y-4">
                <Field label="Banner text">
                  <textarea value={header.bannerText} onChange={(e) => setHeader({ ...header, bannerText: e.target.value })} className={areaCls} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone label"><input value={header.phone} onChange={(e) => setHeader({ ...header, phone: e.target.value })} className={inputCls} /></Field>
                  <Field label="Phone link"><input value={header.phoneHref} onChange={(e) => setHeader({ ...header, phoneHref: e.target.value })} className={inputCls} /></Field>
                </div>
                <Field label="CTA label"><input value={header.ctaLabel} onChange={(e) => setHeader({ ...header, ctaLabel: e.target.value })} className={inputCls} /></Field>
                <button type="button" disabled={saving === "header"} onClick={() => saveSetting("header", header)} className="w-full bg-navy px-5 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-cyan hover:text-navy-deep disabled:opacity-50">
                  {saving === "header" ? "Saving…" : "Save header"}
                </button>
              </div>
            </div>
            <div className="border border-hair bg-white p-5">
              <p className="plate-label text-cyan-deep">Hero · first screen</p>
              <h2 className="mt-1 text-[22px] text-navy">Headline, copy &amp; media</h2>
              <div className="mt-4 space-y-4">
                <Field label="Eyebrow"><input value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} className={inputCls} /></Field>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Line 1"><input value={hero.line1} onChange={(e) => setHero({ ...hero, line1: e.target.value })} className={inputCls} /></Field>
                  <Field label="Line 2 (red)"><input value={hero.line2} onChange={(e) => setHero({ ...hero, line2: e.target.value })} className={inputCls} /></Field>
                  <Field label="Line 3"><input value={hero.line3} onChange={(e) => setHero({ ...hero, line3: e.target.value })} className={inputCls} /></Field>
                </div>
                <Field label="Description"><textarea value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} className={areaCls} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Primary button"><input value={hero.primaryLabel} onChange={(e) => setHero({ ...hero, primaryLabel: e.target.value })} className={inputCls} /></Field>
                  <Field label="Secondary button"><input value={hero.secondaryLabel} onChange={(e) => setHero({ ...hero, secondaryLabel: e.target.value })} className={inputCls} /></Field>
                  <Field label="Hotline"><input value={hero.hotline} onChange={(e) => setHero({ ...hero, hotline: e.target.value })} className={inputCls} /></Field>
                  <Field label="Email"><input value={hero.email} onChange={(e) => setHero({ ...hero, email: e.target.value })} className={inputCls} /></Field>
                </div>
                <MediaPicker label="Hero image (from device or library)" value={hero.imageUrl} onChange={(v) => setHero({ ...hero, imageUrl: v })} hint="Landscape photo works best — right-bleed crop." />
                <MediaPicker label="Hero video (optional — replaces photo)" value={hero.videoUrl} onChange={(v) => setHero({ ...hero, videoUrl: v })} accept="video/*" hint="MP4/WebM up to 25 MB. Leave empty to keep the photo." />
                <button type="button" disabled={saving === "hero"} onClick={() => saveSetting("hero", hero)} className="w-full bg-navy px-5 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-cyan hover:text-navy-deep disabled:opacity-50">
                  {saving === "hero" ? "Saving…" : "Save hero"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTIONS ─────────────────────────────────────────────── */}
        {tab === "sections" && (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="plate-label text-cyan-deep">Admin · Sections</p>
                <h1 className="mt-1 text-[clamp(1.8rem,4vw,2.6rem)] text-navy">Add · edit · delete</h1>
                <p className="mt-1 max-w-2xl text-[15px] text-steel">
                  Reserved slugs (locator, triage, services, philhealth, about, first-aid) feed the
                  built-in tools. Any new slug becomes a full-width content band with image/video
                  support, rendered automatically between PhilHealth and About.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection({ slug: `custom-${Date.now().toString(36)}`, eyebrow: "", title: "New section", body: "", imageUrl: "", videoUrl: "", ctaLabel: "", ctaHref: "", sortOrder: sections.length + 1, isVisible: true })}
                className="bg-cyan px-5 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-navy-deep uppercase hover:-translate-y-0.5"
              >
                <Plus className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> New section
              </button>
            </div>

            {editingSection && (
              <div className="mt-5 rounded-xl border border-navy/20 bg-white p-5 shadow-[0_36px_70px_-50px_rgba(6,37,74,0.95)]">
                <h2 className="text-[20px] text-navy">{editingSection.id ? "Edit section" : "New section"}</h2>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <Field label="Slug (url-safe)"><input value={editingSection.slug} onChange={(e) => setEditingSection({ ...editingSection, slug: e.target.value })} className={inputCls} /></Field>
                  <Field label="Eyebrow"><input value={editingSection.eyebrow ?? ""} onChange={(e) => setEditingSection({ ...editingSection, eyebrow: e.target.value })} className={inputCls} /></Field>
                  <Field label="Title"><input value={editingSection.title} onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })} className={inputCls} /></Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Order"><input type="number" value={editingSection.sortOrder} onChange={(e) => setEditingSection({ ...editingSection, sortOrder: Number(e.target.value) })} className={inputCls} /></Field>
                    <Field label="Visible">
                      <button type="button" onClick={() => setEditingSection({ ...editingSection, isVisible: !editingSection.isVisible })} className={`flex h-12 w-full items-center justify-center gap-2 border text-[13px] font-extrabold tracking-[0.1em] uppercase ${editingSection.isVisible ? "border-leaf text-leaf" : "border-hair text-steel"}`}>
                        {editingSection.isVisible ? <><Eye className="h-4 w-4" /> Visible</> : <><EyeOff className="h-4 w-4" /> Hidden</>}
                      </button>
                    </Field>
                  </div>
                  <div className="lg:col-span-2"><Field label="Body"><textarea value={editingSection.body ?? ""} onChange={(e) => setEditingSection({ ...editingSection, body: e.target.value })} className={areaCls} rows={4} /></Field></div>
                  <MediaPicker label="Section image" value={editingSection.imageUrl ?? ""} onChange={(v) => setEditingSection({ ...editingSection, imageUrl: v })} />
                  <MediaPicker label="Section video (optional)" value={editingSection.videoUrl ?? ""} onChange={(v) => setEditingSection({ ...editingSection, videoUrl: v })} accept="video/*" />
                  <Field label="CTA label"><input value={editingSection.ctaLabel ?? ""} onChange={(e) => setEditingSection({ ...editingSection, ctaLabel: e.target.value })} className={inputCls} /></Field>
                  <Field label="CTA link"><input value={editingSection.ctaHref ?? ""} onChange={(e) => setEditingSection({ ...editingSection, ctaHref: e.target.value })} className={inputCls} /></Field>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (editingSection.id) {
                          const json = await api<any>("/api/admin/sections", { method: "PUT", body: JSON.stringify(editingSection) });
                          setSections((s) => s.map((x) => (x.id === json.section.id ? json.section : x)));
                        } else {
                          const json = await api<any>("/api/admin/sections", { method: "POST", body: JSON.stringify(editingSection) });
                          setSections((s) => [...s, json.section]);
                        }
                        setEditingSection(null);
                        flash("Section saved — live on the site.");
                      } catch (err) {
                        flash(err instanceof Error ? err.message : "Save failed.");
                      }
                    }}
                    className="bg-navy px-6 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-cyan hover:text-navy-deep"
                  >
                    Save section
                  </button>
                  <button type="button" onClick={() => setEditingSection(null)} className="border border-hair px-6 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-navy uppercase">Cancel</button>
                </div>
              </div>
            )}

            <ul className="mt-5 space-y-3">
              {sections.map((s) => (
                <li key={s.id} className="flex flex-col gap-3 border border-hair bg-white p-4 sm:flex-row sm:items-center">
                  <span className="tabular shrink-0 text-[13px] font-extrabold text-cyan-deep">{String(s.sortOrder).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-bold text-navy">{s.title} <span className="tabular ml-2 text-[12px] font-normal text-steel">/{s.slug}</span></p>
                    <p className="mt-0.5 flex items-center gap-2 text-[13px] text-steel">
                      {s.isVisible ? <Eye className="h-3.5 w-3.5 text-leaf" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {s.isVisible ? "Visible" : "Hidden"} {s.imageUrl ? "· has image" : ""} {s.videoUrl ? "· has video" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => setEditingSection(s)} className="border border-hair px-4 py-2.5 text-[12px] font-extrabold tracking-[0.1em] text-navy uppercase hover:border-cyan-deep hover:text-cyan-deep">Edit</button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm(`Delete “${s.title}”?`)) return;
                        await api("/api/admin/sections?id=" + s.id, { method: "DELETE" }).catch(() => null);
                        setSections((l) => l.filter((x) => x.id !== s.id));
                        flash("Section deleted.");
                      }}
                      className="border border-hair px-4 py-2.5 text-[12px] font-extrabold tracking-[0.1em] text-steel uppercase hover:border-alert hover:text-alert"
                      aria-label={`Delete ${s.title}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── FAQS ─────────────────────────────────────────────────── */}
        {tab === "faqs" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="lg:sticky lg:top-40 lg:self-start">
              <p className="plate-label text-cyan-deep">Admin · FAQs</p>
              <h1 className="mt-1 text-[clamp(1.8rem,4vw,2.6rem)] text-navy">Questions</h1>
              <div className="mt-4 border border-hair bg-white p-5">
                <h2 className="text-[18px] text-navy">Add a question</h2>
                <div className="mt-3 space-y-3">
                  <Field label="Question"><input value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} className={inputCls} placeholder="e.g. Do you accept walk-ins?" /></Field>
                  <Field label="Answer"><textarea value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} className={areaCls} /></Field>
                  <button
                    type="button"
                    disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                    onClick={async () => {
                      const json = await api<any>("/api/admin/faqs", { method: "POST", body: JSON.stringify({ ...newFaq, sortOrder: faqs.length + 1 }) });
                      setFaqs((f) => [...f, json.faq]);
                      setNewFaq({ question: "", answer: "" });
                      flash("FAQ added.");
                    }}
                    className="w-full bg-navy px-5 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-cyan hover:text-navy-deep disabled:opacity-40"
                  >
                    <Plus className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> Add FAQ
                  </button>
                </div>
              </div>
            </div>
            <ul className="space-y-3">
              {faqs.map((f, i) => (
                <li key={f.id} className="border border-hair bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[15px] font-bold text-navy"><span className="tabular mr-2 text-cyan-deep">{String(i + 1).padStart(2, "0")}</span>{f.question}</p>
                    <div className="flex shrink-0 gap-1.5">
                      <button type="button" onClick={async () => {
                        const json = await api<any>("/api/admin/faqs", { method: "PUT", body: JSON.stringify({ id: f.id, isVisible: !f.isVisible }) });
                        setFaqs((l) => l.map((x) => (x.id === f.id ? json.faq : x)));
                      }} className="border border-hair p-2 text-navy hover:border-cyan-deep" aria-label={f.isVisible ? "Hide" : "Show"}>
                        {f.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={async () => {
                        if (!confirm("Delete this FAQ?")) return;
                        await fetch("/api/admin/faqs?id=" + f.id, { method: "DELETE", headers: mediaHeaders(), credentials: "include" });
                        setFaqs((l) => l.filter((x) => x.id !== f.id));
                        flash("FAQ deleted.");
                      }} className="border border-hair p-2 text-steel hover:border-alert hover:text-alert" aria-label="Delete FAQ">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    defaultValue={f.answer}
                    rows={3}
                    className={`${areaCls} mt-2`}
                    onBlur={async (e) => {
                      if (e.target.value !== f.answer) {
                        const json = await api<any>("/api/admin/faqs", { method: "PUT", body: JSON.stringify({ id: f.id, answer: e.target.value }) });
                        setFaqs((l) => l.map((x) => (x.id === f.id ? json.faq : x)));
                        flash("Answer updated.");
                      }
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── MEDIA ────────────────────────────────────────────────── */}
        {tab === "media" && (
          <div>
            <p className="plate-label text-cyan-deep">Admin · Media library</p>
            <h1 className="mt-1 text-[clamp(1.8rem,4vw,2.6rem)] text-navy">Images &amp; videos from your device</h1>
            <p className="mt-1 max-w-2xl text-[15px] text-steel">Upload once, reuse everywhere — hero, sections, or paste the URL into any field. 25 MB max per file.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <label className="cursor-pointer bg-cyan px-5 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-navy-deep uppercase hover:-translate-y-0.5">
                <Upload className="mr-1.5 inline h-4 w-4" aria-hidden="true" />{saving === "media" ? "Uploading…" : "Upload from device"}
                <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(e) => e.target.files && uploadMedia(e.target.files)} />
              </label>
              <span className="self-center text-[13px] text-steel">…or drag &amp; drop files onto the grid below</span>
            </div>
            <div
              className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) uploadMedia(e.dataTransfer.files); }}
            >
              {media.length === 0 && (
                <p className="col-span-full border border-dashed border-steel/50 bg-white p-10 text-center text-[14px] text-steel">
                  Library is empty — upload your first image or video.
                </p>
              )}
              {media.map((m) => (
                <div key={m.id} className="border border-hair bg-white">
                  {m.kind === "video" ? (
                    <video src={`/${m.url}`} className="h-40 w-full bg-black object-cover" controls preload="metadata" playsInline />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/${m.url}`} alt={m.fileName} className="h-40 w-full object-cover" loading="lazy" />
                  )}
                  <div className="p-3">
                    <p className="truncate text-[13px] font-bold text-navy" title={m.fileName}>{m.fileName}</p>
                    <p className="tabular text-[12px] text-steel">{m.kind} · {(m.sizeBytes / 1024).toFixed(0)} KB</p>
                    <p className="mt-1 truncate font-mono text-[11px] text-cyan-deep" title={m.url}>{m.url}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/${m.url}`); flash("URL copied."); }}
                        className="flex-1 border border-hair px-2 py-2 text-[11px] font-extrabold tracking-[0.1em] text-navy uppercase hover:border-cyan-deep hover:text-cyan-deep"
                      >
                        Copy URL
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Delete ${m.fileName}?`)) return;
                          await fetch("/api/admin/media?id=" + m.id, { method: "DELETE", headers: mediaHeaders(), credentials: "include" });
                          setMedia((l) => l.filter((x) => x.id !== m.id));
                          flash("Media deleted.");
                        }}
                        className="border border-hair px-3 py-2 text-steel hover:border-alert hover:text-alert"
                        aria-label={`Delete ${m.fileName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SOCIALS ──────────────────────────────────────────────── */}
        {tab === "socials" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="lg:sticky lg:top-40 lg:self-start">
              <p className="plate-label text-cyan-deep">Admin · Socials</p>
              <h1 className="mt-1 text-[clamp(1.8rem,4vw,2.6rem)] text-navy">Profiles &amp; links</h1>
              <p className="mt-1 text-[15px] text-steel">Multiple pages per platform allowed — e.g. one Facebook per branch. Shown in the footer with modern icons.</p>
              <div className="mt-4 space-y-3 border border-hair bg-white p-5">
                <Field label="Platform">
                  <select value={newSocial.platform} onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })} className={inputCls}>
                    {SOCIAL_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Label (optional)"><input value={newSocial.label} onChange={(e) => setNewSocial({ ...newSocial, label: e.target.value })} className={inputCls} placeholder="e.g. SBI Manggahan FB page" /></Field>
                <Field label="URL"><input value={newSocial.url} onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })} className={inputCls} placeholder="https://…" /></Field>
                <button
                  type="button"
                  disabled={!newSocial.url.trim()}
                  onClick={async () => {
                    const json = await api<any>("/api/admin/socials", { method: "POST", body: JSON.stringify({ ...newSocial, sortOrder: socials.length + 1 }) });
                    setSocials((s) => [...s, json.social]);
                    setNewSocial({ platform: "facebook", label: "", url: "" });
                    flash("Social link added.");
                  }}
                  className="w-full bg-navy px-5 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-cyan hover:text-navy-deep disabled:opacity-40"
                >
                  <Plus className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> Add link
                </button>
              </div>
            </div>
            <ul className="space-y-3">
              {socials.map((s) => (
                <li key={s.id} className="flex flex-col gap-2 border border-hair bg-white p-4 sm:flex-row sm:items-center">
                  <span className="plate-label w-28 shrink-0 text-cyan-deep">{s.platform}</span>
                  <div className="min-w-0 flex-1">
                    <input
                      defaultValue={s.label ?? ""}
                      placeholder="Label"
                      className="w-full bg-transparent text-[15px] font-bold text-navy focus:outline-none"
                      onBlur={async (e) => {
                        if (e.target.value !== (s.label ?? "")) {
                          const json = await api<any>("/api/admin/socials", { method: "PUT", body: JSON.stringify({ id: s.id, label: e.target.value }) });
                          setSocials((l) => l.map((x) => (x.id === s.id ? json.social : x)));
                        }
                      }}
                    />
                    <input
                      defaultValue={s.url}
                      className="w-full truncate bg-transparent text-[13px] text-steel focus:outline-none"
                      onBlur={async (e) => {
                        if (e.target.value !== s.url) {
                          const json = await api<any>("/api/admin/socials", { method: "PUT", body: JSON.stringify({ id: s.id, url: e.target.value }) });
                          setSocials((l) => l.map((x) => (x.id === s.id ? json.social : x)));
                          flash("Link updated.");
                        }
                      }}
                    />
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button type="button" onClick={async () => {
                      const json = await api<any>("/api/admin/socials", { method: "PUT", body: JSON.stringify({ id: s.id, isVisible: !s.isVisible }) });
                      setSocials((l) => l.map((x) => (x.id === s.id ? json.social : x)));
                    }} className="border border-hair p-2 text-navy hover:border-cyan-deep" aria-label="Toggle visibility">
                      {s.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={async () => {
                      if (!confirm("Delete this link?")) return;
                      await fetch("/api/admin/socials?id=" + s.id, { method: "DELETE", headers: mediaHeaders(), credentials: "include" });
                      setSocials((l) => l.filter((x) => x.id !== s.id));
                      flash("Link deleted.");
                    }} className="border border-hair p-2 text-steel hover:border-alert hover:text-alert" aria-label="Delete link">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
              {socials.length === 0 && <li className="border border-dashed border-steel/50 bg-white p-8 text-center text-[14px] text-steel">No social links yet.</li>}
            </ul>
          </div>
        )}

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        {tab === "footer" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-hair bg-white p-5">
              <p className="plate-label text-cyan-deep">Footer · contact &amp; tagline</p>
              <div className="mt-3 space-y-4">
                <Field label="About blurb"><textarea value={footer.about} onChange={(e) => setFooter({ ...footer, about: e.target.value })} className={areaCls} /></Field>
                <Field label="HQ address"><input value={footer.address} onChange={(e) => setFooter({ ...footer, address: e.target.value })} className={inputCls} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone"><input value={footer.phone} onChange={(e) => setFooter({ ...footer, phone: e.target.value })} className={inputCls} /></Field>
                  <Field label="Email"><input value={footer.email} onChange={(e) => setFooter({ ...footer, email: e.target.value })} className={inputCls} /></Field>
                  <Field label="Tagline A"><input value={footer.taglineA} onChange={(e) => setFooter({ ...footer, taglineA: e.target.value })} className={inputCls} /></Field>
                  <Field label="Tagline B (cyan)"><input value={footer.taglineB} onChange={(e) => setFooter({ ...footer, taglineB: e.target.value })} className={inputCls} /></Field>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-navy/20 bg-white p-5 shadow-[0_36px_70px_-50px_rgba(6,37,74,0.95)]">
              <p className="plate-label text-cyan-deep">Professional developer credit</p>
              <h2 className="mt-1 text-[20px] text-navy">“Website by” plate</h2>
              <div className="mt-3 space-y-4">
                <Field label="Developer / studio name"><input value={footer.developerName} onChange={(e) => setFooter({ ...footer, developerName: e.target.value })} className={inputCls} /></Field>
                <Field label="Developer URL"><input value={footer.developerUrl} onChange={(e) => setFooter({ ...footer, developerUrl: e.target.value })} className={inputCls} /></Field>
                <Field label="Developer tagline"><input value={footer.developerTagline} onChange={(e) => setFooter({ ...footer, developerTagline: e.target.value })} className={inputCls} /></Field>
                <div className="border border-white/15 bg-navy-deep p-4 text-white">
                  <p className="text-[13px] text-white/70">Live preview of the credit plate:</p>
                  <p className="mt-1 text-[14px]"><strong>{footer.developerName}</strong> — {footer.developerTagline}</p>
                </div>
                <button type="button" disabled={saving === "footer"} onClick={() => saveSetting("footer", footer)} className="w-full bg-navy px-5 py-3.5 text-[13px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-cyan hover:text-navy-deep disabled:opacity-50">
                  {saving === "footer" ? "Saving…" : "Save footer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BRANCHES ─────────────────────────────────────────────── */}
        {tab === "branches" && (
          <div>
            <p className="plate-label text-cyan-deep">Admin · Branches</p>
            <h1 className="mt-1 text-[clamp(1.8rem,4vw,2.6rem)] text-navy">Directory editor</h1>
            <input value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} placeholder="Filter branches…" className={`${inputCls} mt-4 max-w-md`} aria-label="Filter branches" />
            <ul className="mt-4 space-y-3">
              {filteredBranches.map((b) => (
                <li key={b.id} className="border border-hair bg-white p-4">
                  <p className="text-[16px] font-bold text-navy">{b.name} <span className="ml-2 text-[12px] font-normal text-steel">{b.region} · {b.city}</span></p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Field label="Contact"><input defaultValue={b.contact ?? ""} className={inputCls} id={`c-${b.id}`} /></Field>
                    <Field label="Hours"><input defaultValue={b.hours ?? ""} className={inputCls} id={`h-${b.id}`} /></Field>
                    <Field label="Email"><input defaultValue={b.email ?? ""} className={inputCls} id={`e-${b.id}`} /></Field>
                    <Field label="Address"><input defaultValue={b.address} className={inputCls} id={`a-${b.id}`} /></Field>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const v = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value ?? "";
                      const json = await api<any>("/api/admin/branches", {
                        method: "PUT",
                        body: JSON.stringify({
                          id: b.id,
                          contact: v(`c-${b.id}`), hours: v(`h-${b.id}`),
                          email: v(`e-${b.id}`), address: v(`a-${b.id}`),
                        }),
                      });
                      setBranches((l) => l.map((x) => (x.id === b.id ? json.branch : x)));
                      flash(`${b.name} updated.`);
                    }}
                    className="mt-3 bg-navy px-5 py-3 text-[12px] font-extrabold tracking-[0.1em] text-white uppercase hover:bg-cyan hover:text-navy-deep"
                  >
                    Save branch
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── BOOKINGS ─────────────────────────────────────────────── */}
        {tab === "bookings" && (
          <div>
            <p className="plate-label text-cyan-deep">Admin · Bookings</p>
            <h1 className="mt-1 text-[clamp(1.8rem,4vw,2.6rem)] text-navy">Triage queue</h1>
            <div className="mt-4 overflow-x-auto border border-hair bg-white">
              <table className="w-full min-w-[760px] text-left text-[14px]">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="plate-label px-4 py-3">Reference</th>
                    <th className="plate-label px-4 py-3">Patient</th>
                    <th className="plate-label px-4 py-3">Cat</th>
                    <th className="plate-label px-4 py-3">Schedule</th>
                    <th className="plate-label px-4 py-3">Branch</th>
                    <th className="plate-label px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t border-hair align-top hover:bg-cyan-soft/40">
                      <td className="tabular px-4 py-3 font-bold text-navy">{b.reference}</td>
                      <td className="px-4 py-3">{b.patientName}<br /><span className="tabular text-[13px] text-steel">{b.contactNumber} {b.isPhilhealthMember ? "· PhilHealth" : ""}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 text-[12px] font-extrabold ${b.exposureCategory === "III" ? "bg-alert text-white" : "bg-navy text-white"}`}>{b.exposureCategory}</span></td>
                      <td className="tabular px-4 py-3">{b.appointmentDate}<br />{b.appointmentTime}</td>
                      <td className="px-4 py-3">{b.branchName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={b.status}
                          onChange={async (e) => {
                            const json = await api<any>("/api/admin/bookings", { method: "PUT", body: JSON.stringify({ id: b.id, status: e.target.value }) });
                            setBookings((l) => l.map((x) => (x.id === b.id ? { ...x, status: json.booking.status } : x)));
                            flash(`${b.reference} → ${e.target.value}.`);
                          }}
                          className="border border-hair bg-white px-2 py-2 text-[13px]"
                          aria-label={`Status for ${b.reference}`}
                        >
                          {["confirmed", "arrived", "completed", "cancelled", "no-show"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-steel">No bookings yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BACKEND / NEON ───────────────────────────────────────── */}
        {tab === "backend" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-hair bg-white p-5">
              <p className="plate-label text-cyan-deep">Backend · code tree</p>
              <h2 className="mt-1 text-[22px] text-navy">Neon-ready Postgres</h2>
              <dl className="mt-4 space-y-2 text-[14px]">
                <div className="flex justify-between gap-3 border-b border-hair py-2"><dt className="text-steel">Provider</dt><dd className="tabular font-bold text-navy">{overview?.backend?.provider ?? "…"}</dd></div>
                <div className="flex justify-between gap-3 border-b border-hair py-2"><dt className="text-steel">Host</dt><dd className="tabular break-all text-right font-bold text-navy">{overview?.backend?.host ?? "…"}</dd></div>
                <div className="flex justify-between gap-3 border-b border-hair py-2"><dt className="text-steel">TLS</dt><dd className="font-bold text-navy">{overview?.backend?.ssl ?? "…"}</dd></div>
                <div className="flex justify-between gap-3 border-b border-hair py-2"><dt className="text-steel">ORM</dt><dd className="font-bold text-navy">Drizzle ORM · pg Pool</dd></div>
              </dl>
              <p className="plate-label mt-4 text-steel">Tables ({overview?.backend?.tables?.length ?? 9})</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {(overview?.backend?.tables ?? []).map((t: string) => (
                  <li key={t} className="tabular border border-hair bg-paper px-2 py-1 text-[12px] text-navy">{t}</li>
                ))}
              </ul>
            </div>
            <div className="border border-navy bg-navy p-5 text-white">
              <p className="plate-label text-cyan">Neon.com setup · 4 steps</p>
              <ol className="mt-3 space-y-3 text-[14px] leading-relaxed text-white/85">
                <li><strong className="text-white">1 · Create project</strong> at console.neon.tech → copy the pooled connection string (<span className="tabular">…neon.tech/…?sslmode=require</span>).</li>
                <li><strong className="text-white">2 · Set DATABASE_URL</strong> in Vercel → Project → Settings → Environment Variables (all environments). Local dev: paste into <span className="tabular">.env</span>.</li>
                <li><strong className="text-white">3 · Push schema</strong> — <span className="tabular">npx drizzle-kit push</span> creates all 9 tables on Neon.</li>
                <li><strong className="text-white">4 · Seed</strong> — <span className="tabular">npx tsx scripts/seed.ts && npx tsx scripts/seed-cms.ts</span> loads branches + CMS defaults.</li>
              </ol>
              <p className="mt-4 border-t border-white/20 pt-3 text-[13px] text-white/60">
                Code tree: <span className="tabular">src/db/index.ts</span> (pool + Neon TLS) ·{" "}
                <span className="tabular">src/db/schema.ts</span> ·{" "}
                <span className="tabular">drizzle.config.json</span> ·{" "}
                <span className="tabular">scripts/seed*.ts</span> ·{" "}
                <span className="tabular">src/app/api/**</span> · full guide in{" "}
                <span className="tabular">NEON_SETUP.md</span>.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-hair bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-5 text-[13px] text-steel sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>SBI Admin · uniform on phone, tablet &amp; desktop · changes are instant.</p>
          <p className="tabular">Passkey gate: triple-click logo · session locked on logout.</p>
        </div>
      </footer>
    </div>
  );
}

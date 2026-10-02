import {
  ArrowRight,
  CalendarCheck,
  Building2,
  MapPinned,
  Wallet,
  Stethoscope,
  ShieldCheck,
  BadgeCheck,
  Clock3,
  Syringe,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { SmartImage } from "@/components/SmartImage";
import { DEFAULT_BRANDING, DEFAULT_HERO, type BrandingSettings, type HeroSettings } from "@/lib/cms";

const PROTOCOL = [
  {
    n: "01",
    title: "Wash thoroughly",
    body: "Clean the wound immediately with soap and running water for at least 15 minutes. This alone removes a large share of virus before it can reach the nerves.",
  },
  {
    n: "02",
    title: "Apply antiseptic",
    body: "Put an antiseptic on the area and avoid tight bandages — cover loosely with a clean dressing so the wound can drain.",
  },
  {
    n: "03",
    title: "Seek care fast",
    body: "Go to a certified animal bite center immediately. Rabies is 100% fatal once clinical symptoms start, and there is no cure after onset.",
  },
];

const STATS = [
  { big: "23", small: "branches nationwide", Icon: Building2 },
  { big: "2010", small: "established, Antipolo HQ", Icon: CalendarCheck },
  { big: "4", small: "regions covered", Icon: MapPinned },
  { big: "0", small: "cash for members*", Icon: Wallet },
];

function srcOf(u: string) {
  if (!u) return "";
  return u.startsWith("http") || u.startsWith("/") ? u : `/${u}`;
}

export function Hero({
  hero,
  branding,
}: {
  hero?: HeroSettings | null;
  branding?: BrandingSettings | null;
}) {
  const h = { ...DEFAULT_HERO, ...(hero ?? {}) };
  const brand = { ...DEFAULT_BRANDING, ...(branding ?? {}) };
  const img = srcOf(h.imageUrl);
  const vid = srcOf(h.videoUrl);

  return (
    <section id="top" className="relative bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6 sm:pt-8">
        {/* ── ONE photo-led panel, identical composition at every breakpoint ── */}
        <div className="relative overflow-hidden rounded-xl shadow-[0_50px_90px_-58px_rgba(6,37,74,1)] sm:rounded-xl">
          <div className="absolute inset-0">
            {vid ? (
              <video
                src={vid}
                poster={img || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
                aria-label="SBI clinic video"
              />
            ) : (
              img && (
                <SmartImage
                  src={img}
                  alt="SBI nurse preparing a vaccine beside a dog and its owner in the clinic waiting area"
                  className="h-full w-full object-cover object-center md:object-[62%_center]"
                  fetchPriority="high"
                />
              )
            )}
          </div>

          {/* Scrim: vertical on phones, horizontal on desktop — same contrast everywhere */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/80 to-navy-deep/25 md:bg-gradient-to-r md:from-navy-deep md:via-navy-deep/72 md:to-navy-deep/10"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_90%,rgba(0,174,239,0.22),transparent_55%)]"
            aria-hidden="true"
          />

          {brand.logoUrl && brand.showHeroLogo && (
            <div className="absolute top-4 right-4 z-10 rounded-full bg-white p-1.5 shadow-xl sm:top-6 sm:right-6">
              <Logo src={brand.logoUrl} className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
          )}

          {/* Content */}
          <div className="relative flex min-h-[540px] flex-col justify-end px-5 py-8 sm:min-h-[580px] sm:px-8 sm:py-10 md:min-h-[640px] md:justify-center md:px-12 md:py-14 lg:min-h-[680px] lg:px-16">
            <div className="max-w-[680px]">
              <p className="plate-label inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-2 text-white backdrop-blur-md">
                <Stethoscope className="h-4 w-4 text-cyan" aria-hidden="true" />
                {h.eyebrow}
              </p>

              <h1 className="mt-5 max-w-[18ch] text-[clamp(2.1rem,4.8vw,3.5rem)] text-white drop-shadow-[0_2px_18px_rgba(4,24,47,0.45)]">
                {h.line1}
                <br />
                <span className="text-[#FF6B70]">{h.line2}</span>
                <br />
                <span className="text-white/95">{h.line3}</span>
              </h1>

              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/85 sm:text-[17px]">
                {h.description}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#locator" className="btn btn-accent btn-lg w-full sm:w-auto group">
                  {h.primaryLabel}
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                </a>
                <a
                  href="#triage"
                  className="btn btn-lg w-full !border-white/40 !bg-white/10 !text-white hover:!bg-white hover:!text-navy-deep sm:w-auto"
                >
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  {h.secondaryLabel}
                </a>
              </div>

              {/* Trust chips — same pills on every device */}
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-2 text-[11px] font-extrabold tracking-[0.12em] text-white uppercase backdrop-blur-md">
                  <ShieldCheck className="h-4 w-4 text-cyan" aria-hidden="true" />
                  DOH Certified
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-2 text-[11px] font-extrabold tracking-[0.12em] text-white uppercase backdrop-blur-md">
                  <BadgeCheck className="h-4 w-4 text-cyan" aria-hidden="true" />
                  PhilHealth ABPP
                </span>
                <span className="tabular inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-2 text-[11px] font-extrabold tracking-[0.12em] text-white uppercase backdrop-blur-md">
                  <Clock3 className="h-4 w-4 text-cyan" aria-hidden="true" />
                  {h.hotline}
                </span>
              </div>
            </div>

            {/* Floating protocol card (desktop only) */}
            <div className="absolute right-10 bottom-10 hidden w-64 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-md lg:block">
              <p className="plate-label flex items-center gap-2 text-cyan">
                <Syringe className="h-4 w-4" aria-hidden="true" />
                PEP protocol
              </p>
              <p className="mt-2 text-[15px] leading-snug font-bold text-white">
                Wash 15 minutes → then Day 0 · 3 · 7 · 21/28 vaccine schedule.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-white/75">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
                </span>
                Walk-ins with fresh bites are prioritised
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats overlapping the panel — identical strip everywhere ── */}
        <div className="relative z-10 -mt-10 grid grid-cols-2 gap-3 sm:-mt-12 lg:grid-cols-4">
          {STATS.map(({ big, small, Icon }) => (
            <div key={small} className="card card-hover p-4 sm:p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-soft text-cyan-deep">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="tabular mt-3 text-[clamp(1.7rem,3.4vw,2.4rem)] leading-none font-extrabold text-navy">
                {big}
              </p>
              <p className="plate-label mt-2 text-steel">{small}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 px-1 text-[13px] text-steel">
          *Subject to PhilHealth Animal Bite Package eligibility — 3 baseline active doses,
          wound consultation and anti-tetanus shots.
        </p>
      </div>

      {/* ── First-aid protocol ─────────────────────────────────────── */}
      <div className="mt-14 border-t border-hair bg-white">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:py-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[radial-gradient(120%_90%_at_20%_15%,#d7f2fd_0%,#f8f9fa_70%)] shadow-[0_30px_60px_-40px_rgba(6,37,74,0.8)]">
            <SmartImage
              src="images/first-aid-wash.jpg"
              alt="A bitten forearm being washed thoroughly with soap under running water"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-alert px-3 py-1.5 text-[12px] font-extrabold tracking-[0.14em] text-white uppercase">
              Do this first
            </span>
          </div>

          <div>
            <p className="eyebrow text-alert">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              Immediate first aid · the first 15 minutes
            </p>
            <h2 className="mt-5 text-[clamp(1.8rem,4vw,3rem)] text-navy">
              What to do before you reach any of our branches.
            </h2>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {PROTOCOL.map((s) => (
                <div key={s.n} className="card card-hover p-5">
                  <span className="tabular inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-soft text-[14px] font-extrabold text-cyan-deep">
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-[18px] text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-steel">{s.body}</p>
                </div>
              ))}
            </div>

            <a href="#locator" className="btn btn-primary mt-7 group">
              Find nearest branch
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

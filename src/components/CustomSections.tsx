import { ArrowRight, ImagePlay } from "lucide-react";
import type { CmsSection } from "@/lib/cms";

function srcOf(u: string | null) {
  if (!u) return "";
  return u.startsWith("http") || u.startsWith("/") ? u : `/${u}`;
}

/** Admin-added content bands (image + video capable), rendered uniformly. */
export function CustomSections({ sections }: { sections: CmsSection[] }) {
  const customs = sections.filter(
    (s) =>
      !["locator", "triage", "services", "philhealth", "about", "first-aid"].includes(s.slug),
  );
  if (customs.length === 0) return null;

  return (
    <>
      {customs.map((s, i) => {
        const img = srcOf(s.imageUrl);
        const vid = srcOf(s.videoUrl);
        const flip = i % 2 === 1;
        return (
          <section key={s.slug} className="scroll-mt-32 bg-paper">
            <div
              className={`mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20 ${
                flip ? "[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                {s.eyebrow && (
                  <p className="eyebrow text-cyan-deep">
                    <ImagePlay className="h-4 w-4" aria-hidden="true" />
                    {s.eyebrow}
                  </p>
                )}
                <h2 className="mt-5 text-[clamp(1.8rem,4vw,2.8rem)] text-navy">{s.title}</h2>
                {s.body && (
                  <p className="mt-4 max-w-xl text-[16px] leading-relaxed whitespace-pre-line text-ink/85">
                    {s.body}
                  </p>
                )}
                {s.ctaLabel && s.ctaHref && (
                  <a href={s.ctaHref} className="btn btn-primary btn-lg group mt-7">
                    {s.ctaLabel}
                    <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                  </a>
                )}
              </div>
              {(img || vid) && (
                <div className="relative overflow-hidden rounded-xl bg-navy-deep shadow-[0_36px_70px_-52px_rgba(6,37,74,0.9)]">
                  {vid ? (
                    <video
                      src={vid}
                      poster={img || undefined}
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-[4/3] w-full object-cover"
                      aria-label={s.title}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={s.title}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}

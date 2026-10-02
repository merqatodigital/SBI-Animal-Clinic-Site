import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { Footer } from "./Footer";
import { ThemeInjector } from "./ThemeInjector";
import { loadSiteContent, loadSocials } from "@/lib/site-content";
import { LEGAL_DOCS } from "@/lib/legal";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "note"; tone?: "alert" | "info"; text: string };

export type LegalSection = { id: string; title: string; blocks: Block[] };

function BlockView({ block }: { block: Block }) {
  if (block.kind === "p") {
    return <p className="mt-4 text-[16px] leading-[1.75] text-ink/80">{block.text}</p>;
  }

  if (block.kind === "ul") {
    return (
      <ul className="mt-4 space-y-3">
        {block.items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[16px] leading-[1.7] text-ink/80">
            <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  const alert = (block.tone ?? "info") === "alert";
  return (
    <p
      className={`mt-5 border-l-2 pl-4 text-[15.5px] leading-[1.7] ${
        alert ? "border-alert text-alert-deep" : "border-navy text-navy"
      }`}
    >
      {block.text}
    </p>
  );
}

export async function LegalArticle({
  eyebrow,
  title,
  summary,
  updated,
  icon,
  sections,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  updated: string;
  icon: ReactNode;
  sections: LegalSection[];
}) {
  const [content, socials] = await Promise.all([loadSiteContent(), loadSocials()]);

  return (
    <>
      <ThemeInjector theme={content.theme} />
      <SiteHeader header={content.header} branding={content.branding} />

      <main className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
            <article className="max-w-[70ch]">
              <p className="eyebrow text-navy">
                {icon}
                {eyebrow}
              </p>

              <h1 className="mt-5 text-[clamp(2rem,4vw,2.9rem)]">{title}</h1>

              <p className="mt-5 text-[17px] leading-[1.7] text-steel">{summary}</p>

              <p className="plate-label mt-6 text-steel">Effective {updated}</p>

              <hr className="mt-8 border-t border-hair" />

              <nav aria-label="Sections" className="mt-8">
                <p className="plate-label text-steel">On this page</p>
                <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="flex gap-2.5 py-1 text-[15px] text-navy transition-colors hover:text-cyan-deep"
                      >
                        <span className="tabular text-steel">{String(i + 1).padStart(2, "0")}</span>
                        <span>{s.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <hr className="mt-8 border-t border-hair" />

              {sections.map((s) => (
                <section key={s.id} id={s.id} className="mt-11 scroll-mt-28">
                  <h2 className="text-[1.3rem] tracking-[-0.02em]">{s.title}</h2>
                  {s.blocks.map((b, i) => (
                    <BlockView key={i} block={b} />
                  ))}
                </section>
              ))}

              <hr className="mt-12 border-t border-hair" />

              <nav aria-label="All legal documents" className="mt-8">
                <p className="plate-label text-steel">All legal documents</p>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {LEGAL_DOCS.map((d) => (
                    <li key={d.href}>
                      <a
                        href={d.href}
                        className="inline-flex items-center rounded-full border border-hair bg-white px-4 py-2 text-[14px] font-medium text-navy transition-colors hover:border-navy hover:text-navy-deep"
                      >
                        {d.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="plate-label text-steel">Documents</p>
                <ul className="mt-4 space-y-1">
                  {LEGAL_DOCS.map((d) => (
                    <li key={d.href}>
                      <a
                        href={d.href}
                        aria-current={d.label === title ? "page" : undefined}
                        className={`block border-l-2 py-1.5 pl-3 text-[15px] transition-colors ${
                          d.label === title
                            ? "border-cyan font-semibold text-navy-deep"
                            : "border-transparent text-ink/70 hover:border-hair hover:text-navy"
                        }`}
                      >
                        {d.label}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-t border-hair pt-6">
                  <p className="plate-label text-steel">Need help?</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                    Questions about your data or these documents:
                  </p>
                  <a
                    href="mailto:sbimedicalanimalbitecenter@gmail.com"
                    className="mt-2 block break-all text-[15px] text-navy underline decoration-cyan decoration-2 underline-offset-4 hover:text-cyan-deep"
                  >
                    sbimedicalanimalbitecenter@gmail.com
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer footer={content.footer} socials={socials} branding={content.branding} />
    </>
  );
}

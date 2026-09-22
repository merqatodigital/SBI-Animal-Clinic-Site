import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { Locator } from "@/components/Locator";
import { TriageWizard } from "@/components/TriageWizard";
import { ServicesTeaser } from "@/components/ServicesTeaser";
import { ServicesOverlay } from "@/components/ServicesOverlay";
import { PhilHealth } from "@/components/PhilHealth";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";
import { FaqSection } from "@/components/FaqSection";
import { CustomSections } from "@/components/CustomSections";
import { ThemeInjector } from "@/components/ThemeInjector";
import { AdminShortcut } from "@/components/AdminShortcut";
import { AdminOverlay } from "@/components/AdminOverlay";
import { db } from "@/db";
import { branches, contentSections, executives, faqs, services, siteSettings, socialLinks } from "@/db/schema";
import { BRANCHES, EXECUTIVES, SERVICES } from "@/lib/catalog";
import {
  DEFAULT_FAQS,
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_HERO,
  DEFAULT_SOCIALS,
  DEFAULT_THEME,
  type CmsSection,
  type Faq,
  type FooterSettings,
  type HeaderSettings,
  type HeroSettings,
  type SocialLink,
  type ThemeSettings,
} from "@/lib/cms";
import type { Branch, Executive, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

function parse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

async function getData() {
  try {
    const [b, e, s, settings, sections, faqRows, socialRows] = await Promise.all([
      db.select().from(branches).orderBy(branches.region, branches.name),
      db.select().from(executives).orderBy(executives.sortOrder),
      db.select().from(services).orderBy(services.sortOrder),
      db.select().from(siteSettings).catch(() => []),
      db.select().from(contentSections).orderBy(contentSections.sortOrder).catch(() => []),
      db.select().from(faqs).orderBy(faqs.sortOrder).catch(() => []),
      db.select().from(socialLinks).orderBy(socialLinks.sortOrder).catch(() => []),
    ]);
    const map = Object.fromEntries((settings ?? []).map((x) => [x.key, x.value]));
    const locatorSection = (sections ?? []).find((x) => x.slug === "locator");
    return {
      branches: (b.length > 0 ? b : BRANCHES.map((x, i) => ({ ...x, id: i + 1, isHq: x.isHq ?? false, notes: x.notes ?? null }))) as Branch[],
      executives: (e.length > 0 ? e : EXECUTIVES.map((x, i) => ({ ...x, id: i + 1 }))) as Executive[],
      services: (s.length > 0 ? s : SERVICES.map((x, i) => ({ ...x, id: i + 1 }))) as Service[],
      theme: parse<ThemeSettings>(map.theme, DEFAULT_THEME),
      header: parse<HeaderSettings>(map.header, DEFAULT_HEADER),
      hero: parse<HeroSettings>(map.hero, DEFAULT_HERO),
      footer: parse<FooterSettings>(map.footer, DEFAULT_FOOTER),
      locatorIntro: locatorSection
        ? { eyebrow: locatorSection.eyebrow ?? undefined, title: locatorSection.title, body: locatorSection.body ?? undefined }
        : null,
      sections: (sections ?? []) as CmsSection[],
      faqs: ((faqRows ?? []).length > 0
        ? (faqRows ?? []).filter((f) => f.isVisible)
        : DEFAULT_FAQS.map((f, i) => ({ id: i + 1, ...f, sortOrder: i + 1, isVisible: true }))) as Faq[],
      socials: ((socialRows ?? []).length > 0
        ? (socialRows ?? []).filter((x) => x.isVisible)
        : DEFAULT_SOCIALS.map((x, i) => ({ id: i + 1, ...x, sortOrder: i + 1, isVisible: true }))) as SocialLink[],
    };
  } catch {
    return {
      branches: BRANCHES.map((x, i) => ({ ...x, id: i + 1, isHq: x.isHq ?? false, notes: x.notes ?? null })) as Branch[],
      executives: EXECUTIVES.map((x, i) => ({ ...x, id: i + 1 })) as Executive[],
      services: SERVICES.map((x, i) => ({ ...x, id: i + 1 })) as Service[],
      theme: DEFAULT_THEME,
      header: DEFAULT_HEADER,
      hero: DEFAULT_HERO,
      footer: DEFAULT_FOOTER,
      locatorIntro: null,
      sections: [] as CmsSection[],
      faqs: DEFAULT_FAQS.map((f, i) => ({ id: i + 1, ...f, sortOrder: i + 1, isVisible: true })) as Faq[],
      socials: DEFAULT_SOCIALS.map((x, i) => ({ id: i + 1, ...x, sortOrder: i + 1, isVisible: true })) as SocialLink[],
    };
  }
}

export default async function HomePage() {
  const data = await getData();

  return (
    <>
      <ThemeInjector theme={data.theme} />
      <AdminShortcut />
      <AdminOverlay />
      <SiteHeader header={data.header} />
      <main>
        <Hero hero={data.hero} />
        <Locator initial={data.branches} intro={data.locatorIntro} />
        <TriageWizard branches={data.branches} />
        <ServicesTeaser services={data.services} />
        <ServicesOverlay services={data.services} />
        <PhilHealth />
        <CustomSections sections={data.sections} />
        <About executives={data.executives} />
        <FaqSection faqs={data.faqs} />
      </main>
      <Footer footer={data.footer} socials={data.socials} />
    </>
  );
}

import type { Metadata } from "next";
import { Cookie } from "lucide-react";
import { LegalArticle, type LegalSection } from "@/components/LegalArticle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cookie Notice — SBI Medical Animal Bite Center",
  description:
    "This website sets one strictly necessary cookie for the staff administration area and no analytics, advertising or cross-site tracking cookies at all.",
  alternates: { canonical: "/cookies" },
};

const UPDATED = "2 October 2026";

const SECTIONS: LegalSection[] = [
  {
    id: "what",
    title: "What cookies are",
    blocks: [
      {
        kind: "p",
        text: "Cookies are small text files a website asks your browser to store. They let a site remember that you are signed in, or remember choices you have made. They can also be used to follow you across sites, which is what this notice is really about.",
      },
      {
        kind: "p",
        text: "We treat local storage — a similar browser feature used by this site's administration area — the same way we treat cookies, and describe both together below.",
      },
    ],
  },
  {
    id: "we-use",
    title: "What this website actually uses",
    blocks: [
      {
        kind: "p",
        text: "Browsing this website as a visitor does not set any cookie at all. The only cookie on the entire site is set when a member of staff signs in:",
      },
      {
        kind: "ul",
        items: [
          "Name: sbi_admin",
          "Purpose: keeps a staff member signed in to the administration area so they do not have to re-enter the passkey on every request",
          "Type: strictly necessary — the administration area cannot function without it",
          "Duration: 12 hours, then it expires and must be renewed",
          "Attributes: HttpOnly, SameSite=Lax, Secure in production, valid for the whole site",
          "Set when: a valid passkey is entered at /admin; never set for ordinary visitors",
        ],
      },
      {
        kind: "p",
        text: "The administration interface additionally uses your browser's local storage to remember that you have signed in. That entry stays until you sign out or clear your browser data.",
      },
    ],
  },
  {
    id: "we-do-not-use",
    title: "What this website does not use",
    blocks: [
      {
        kind: "p",
        text: "We have deliberately kept the list above short. Specifically, this website does not use:",
      },
      {
        kind: "ul",
        items: [
          "Analytics cookies — no Google Analytics, no page-view profiling",
          "Advertising or remarketing cookies — no ad networks, no conversion pixels",
          "Social media tracking pixels or embedded like/share widgets that track you",
          "Cross-site cookies that follow you to other websites",
          "Cookie consent banners, because there is nothing of that kind to consent to",
        ],
      },
      {
        kind: "p",
        text: "We do not sell, rent or share browsing data with advertisers. There are no third parties on this website whose business is tracking people.",
      },
    ],
  },
  {
    id: "third-parties",
    title: "Third-party content we do load",
    blocks: [
      {
        kind: "p",
        text: "Two external resources are requested by this site, neither of which sets a tracking cookie:",
      },
      {
        kind: "ul",
        items: [
          "Web fonts are served by Google Fonts. Your browser requests the font files directly from Google's servers, which means Google receives your IP address as part of that request.",
          "The branch map loads map tiles from an open map tile provider. The same applies — your IP address is visible to them as part of the request.",
        ],
      },
      {
        kind: "p",
        text: "If you would prefer not to make those requests, blocking third-party fonts and map tiles will not break the site; it will fall back to system fonts and a list of branch addresses.",
      },
    ],
  },
  {
    id: "manage",
    title: "How to control cookies",
    blocks: [
      {
        kind: "p",
        text: "Because the only cookie we set is strictly necessary, blocking it does not buy you any additional tracking protection — it just signs you out of the administration area. That said, every browser lets you inspect and delete cookies:",
      },
      {
        kind: "ul",
        items: [
          "Chrome, Edge and Firefox: Settings → Privacy and security → Cookies and site data",
          "Safari: Settings → Privacy → Manage website data",
          "On mobile: browser settings → site settings → cookies",
        ],
      },
      {
        kind: "p",
        text: "Clearing site data for this domain will also clear the local storage entry used by the administration area.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this notice",
    blocks: [
      {
        kind: "p",
        text: "If we ever introduce a cookie that is not strictly necessary, we will update this notice first and add a consent control for it. The effective date at the top of this page shows when this notice was last revised.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    blocks: [
      {
        kind: "p",
        text: "Questions about cookies or tracking on this website: sbimedicalanimalbitecenter@gmail.com. See also our Privacy Policy, which covers personal data more broadly.",
      },
    ],
  },
];

export default function CookiesPage() {
  return (
    <LegalArticle
      eyebrow="Legal · Cookies"
      icon={<Cookie aria-hidden="true" />}
      title="Cookie Notice"
      summary="The short version: this website sets one cookie, it belongs to the staff administration area, and there is no analytics or advertising tracking on it whatsoever."
      updated={UPDATED}
      sections={SECTIONS}
    />
  );
}

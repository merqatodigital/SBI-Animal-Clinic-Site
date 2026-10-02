import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { LegalArticle, type LegalSection } from "@/components/LegalArticle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy — SBI Medical Animal Bite Center",
  description:
    "How SBI Medical & Animal Bite Center & Vaccination Clinic collects, uses, stores and protects your personal and health data, and your rights under the Data Privacy Act of 2012 (RA 10173).",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "2 October 2026";

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    blocks: [
      {
        kind: "p",
        text: "SBI Medical & Animal Bite Center & Vaccination Clinic (\"SBI\", \"we\", \"us\", \"our\") is a DOH-certified, PhilHealth-accredited network of animal bite centers and vaccination clinics operating in the Philippines since 2010. For the purposes of the Data Privacy Act of 2012 (Republic Act No. 10173, \"RA 10173\"), SBI is the personal information controller of the data described in this notice.",
      },
      {
        kind: "p",
        text: "Registered address: Lot 19, Blk 2 Langhaya, NHA Ave, Brgy. Dela Paz, Antipolo City. Privacy enquiries: sbimedicalanimalbitecenter@gmail.com.",
      },
    ],
  },
  {
    id: "what-we-collect",
    title: "What personal data we collect",
    blocks: [
      {
        kind: "p",
        text: "We collect only what we need to book, prepare for and deliver your consultation. When you use the triage and booking form on this website we collect:",
      },
      {
        kind: "ul",
        items: [
          "Patient name",
          "Contact number",
          "Preferred branch and appointment schedule",
          "Patient details you choose to provide, including age and the nature of the bite or injury",
          "The triage answers you select, which inform the first-aid guidance shown on screen",
        ],
      },
      {
        kind: "p",
        text: "We also receive technical data such as your IP address and browser type through standard server logs, which we use for security and fault diagnosis only.",
      },
      {
        kind: "note",
        tone: "alert",
        text: "Some of the above is health-related information. Under RA 10173 this is sensitive personal information and receives a higher level of protection, which is why it is handled under the safeguards set out below.",
      },
    ],
  },
  {
    id: "how-we-use-it",
    title: "How and why we use your data",
    blocks: [
      { kind: "p", text: "We process your data for the following purposes:" },
      {
        kind: "ul",
        items: [
          "To create and manage your appointment, and to prepare the branch for your visit",
          "To provide first-aid and post-exposure prophylaxis guidance appropriate to your situation",
          "To contact you about a booking, a schedule change or a follow-up",
          "To maintain the clinical records required of a DOH-certified animal bite center",
          "To meet legal, regulatory and PhilHealth reporting obligations",
          "To secure and troubleshoot this website",
        ],
      },
    ],
  },
  {
    id: "legal-basis",
    title: "Our legal basis for processing",
    blocks: [
      {
        kind: "p",
        text: "We rely on one or more of the following bases at RA 10173, Section 12:",
      },
      {
        kind: "ul",
        items: [
          "Your free, specific, informed and unambiguous consent, given when you submit the booking form",
          "The protection of life and health, where processing is necessary for medical care",
          "The fulfilment of a contract with you, or steps taken at your request before entering one",
          "Compliance with a legal obligation to which SBI is subject",
          "Legitimate interests, such as securing the website against abuse",
        ],
      },
      {
        kind: "p",
        text: "You may withdraw consent at any time. Withdrawing consent does not affect the lawfulness of processing carried out before the withdrawal, and it may mean we cannot complete a pending booking.",
      },
    ],
  },
  {
    id: "sharing",
    title: "Who we share it with",
    blocks: [
      {
        kind: "p",
        text: "We do not sell, rent or trade your personal data. We disclose it only where necessary:",
      },
      {
        kind: "ul",
        items: [
          "To the SBI branch and clinical staff handling your appointment",
          "To the Department of Health, PhilHealth and other regulators where reporting is required by law",
          "To our hosting and infrastructure providers, who process data strictly on our instructions and under confidentiality obligations",
          "To professional advisers or authorities where required by law, court order or a lawful request",
        ],
      },
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    blocks: [
      {
        kind: "p",
        text: "Booking data is kept only for as long as needed for the purposes described above, and thereafter for the retention periods that clinical and regulatory records require of a licensed animal bite center. Once the applicable period expires, the data is securely deleted or rendered anonymous.",
      },
      {
        kind: "p",
        text: "If you ask us to delete your booking information earlier than a mandatory retention period allows, we will do so as soon as the legal requirement has been satisfied.",
      },
    ],
  },
  {
    id: "security",
    title: "How we protect it",
    blocks: [
      {
        kind: "p",
        text: "We apply appropriate organisational and technical measures proportionate to the sensitivity of the data. These include access controls, transport encryption, restricted administrative access and periodic review of the systems that hold personal data.",
      },
      {
        kind: "p",
        text: "Where a personal data breach is likely to give rise to a real risk of serious harm, we will notify you and the National Privacy Commission within the timeframes required by law.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your rights as a data subject",
    blocks: [
      {
        kind: "p",
        text: "Under RA 10173 you have the right to:",
      },
      {
        kind: "ul",
        items: [
          "Be informed that your personal data is being processed",
          "Object to processing, including profiling and direct marketing",
          "Access your personal data and be told how it has been handled",
          "Have inaccurate data corrected, and have data erased or blocked where properly justified",
          "Data portability, where technically feasible",
          "Be indemnified for damages arising from inaccurate, incomplete, outdated, false, unlawfully obtained or unauthorised use of your data",
          "Lodge a complaint with the National Privacy Commission",
        ],
      },
      {
        kind: "p",
        text: "To exercise any of these, email us at sbimedicalanimalbitecenter@gmail.com. We will respond within the period prescribed by the NPC. We may ask you to verify your identity before acting on a request.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    blocks: [
      {
        kind: "p",
        text: "This website uses only the strictly necessary cookies needed to keep the site working and to secure the staff administration area. We do not use analytics, advertising or cross-site tracking cookies. Our full Cookie Notice explains what that means in practice.",
      },
    ],
  },
  {
    id: "children",
    title: "Children's data",
    blocks: [
      {
        kind: "p",
        text: "Where a booking concerns a minor, the form should be completed by a parent or legal guardian. We do not knowingly collect personal data from children other than in connection with a booking made on their behalf.",
      },
    ],
  },
  {
    id: "external",
    title: "External links",
    blocks: [
      {
        kind: "p",
        text: "This website may link to sites operated by third parties, including map providers and social networks. Their privacy practices are governed by their own notices, which we encourage you to read. We are not responsible for the content or practices of those sites.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to this notice",
    blocks: [
      {
        kind: "p",
        text: "We may update this Privacy Policy to reflect changes in our practices or in the law. The effective date at the top of this page shows when it was last revised. Material changes will be announced on this website.",
      },
    ],
  },
  {
    id: "contact",
    title: "How to reach us",
    blocks: [
      {
        kind: "p",
        text: "For any question or request relating to your personal data, contact us at sbimedicalanimalbitecenter@gmail.com or by post at Lot 19, Blk 2 Langhaya, NHA Ave, Brgy. Dela Paz, Antipolo City.",
      },
      {
        kind: "p",
        text: "If you are unsatisfied with our response, you may file a complaint with the National Privacy Commission (npc.gov.ph), which has jurisdiction over personal data processing in the Philippines.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalArticle
      eyebrow="Legal · Privacy"
      icon={<ShieldCheck aria-hidden="true" />}
      title="Privacy Policy"
      summary="This notice explains what personal and health information we collect when you use this website, why we collect it, how long we keep it, and the rights you have over it under the Data Privacy Act of 2012."
      updated={UPDATED}
      sections={SECTIONS}
    />
  );
}

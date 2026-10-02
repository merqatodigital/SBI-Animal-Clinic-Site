import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { LegalArticle, type LegalSection } from "@/components/LegalArticle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Use — SBI Medical Animal Bite Center",
  description:
    "The terms that govern your use of the SBI Medical & Animal Bite Center & Vaccination Clinic website, including permitted use, intellectual property, liability limits and governing law.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "2 October 2026";

const SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    blocks: [
      {
        kind: "p",
        text: "By accessing or using this website you agree to be bound by these Terms of Use. If you do not agree, please do not use this website.",
      },
      {
        kind: "p",
        text: "These terms apply to the website only. Your treatment as a patient is governed by the consent forms and clinical policies you receive at the branch.",
      },
    ],
  },
  {
    id: "about",
    title: "About this website",
    blocks: [
      {
        kind: "p",
        text: "This website is operated by SBI Medical & Animal Bite Center & Vaccination Clinic, a DOH-certified, PhilHealth-accredited network of animal bite centers and vaccination clinics in the Philippines, in operation since 2010.",
      },
      {
        kind: "p",
        text: "Its purposes are to help you find a branch, to give you immediate first-aid guidance, to let you book an appointment, and to publish information about our services, accreditation and PhilHealth coverage.",
      },
    ],
  },
  {
    id: "permitted-use",
    title: "Permitted use",
    blocks: [
      { kind: "p", text: "You may use this website for lawful, personal and non-commercial purposes. You agree not to:" },
      {
        kind: "ul",
        items: [
          "Use the website for any unlawful, fraudulent or harmful purpose",
          "Attempt to gain unauthorised access to the administration area, the database or any connected system",
          "Interfere with the website's operation, including through scraping, denial-of-service attempts or automated extraction of data",
          "Submit false, misleading or defamatory information through the booking form",
          "Reproduce, republish or commercially exploit any part of the website without our written permission",
        ],
      },
    ],
  },
  {
    id: "medical",
    title: "No medical advice and no doctor-patient relationship",
    blocks: [
      {
        kind: "p",
        text: "Content on this website — including the triage tool, first-aid steps, vaccine schedules and service descriptions — is general information. It is not medical advice, and it is not a diagnosis.",
      },
      {
        kind: "p",
        text: "Using this website does not create a doctor-patient relationship with SBI or with any of its clinicians. Only an in-person assessment by a qualified health professional can determine the treatment you need.",
      },
      {
        kind: "note",
        tone: "alert",
        text: "Rabies is fatal once symptoms appear. If you have been bitten, washed the wound for 15 minutes and seek care immediately at the nearest animal bite center. Do not rely on this website in place of emergency care.",
      },
    ],
  },
  {
    id: "bookings",
    title: "Appointments and bookings",
    blocks: [
      {
        kind: "p",
        text: "A booking request submitted through this website is a request only. Your appointment is confirmed when the branch contacts you or otherwise confirms it. We may decline, reschedule or cancel a booking where the branch cannot accommodate it.",
      },
      {
        kind: "p",
        text: "You are responsible for the accuracy of the details you submit, including contact number, branch and schedule.",
      },
    ],
  },
  {
    id: "accuracy",
    title: "Accuracy of information",
    blocks: [
      {
        kind: "p",
        text: "We take reasonable care to keep the information on this website accurate and current. Branch addresses, service availability, schedules and PhilHealth coverage can change without notice, and clinical guidance evolves over time.",
      },
      {
        kind: "p",
        text: "Nothing on this website should be treated as a warranty that any particular service, vaccine or coverage is available at a given branch on a given day. Please confirm with the branch before travelling.",
      },
    ],
  },
  {
    id: "ip",
    title: "Intellectual property",
    blocks: [
      {
        kind: "p",
        text: "All content on this website — including text, layout, design, photographs, graphics, the SBI name and logo, and the underlying source code — is owned by or licensed to SBI and is protected by Philippine and international intellectual property laws.",
      },
      {
        kind: "p",
        text: "You may view and print content for your own personal, non-commercial use. Any other use requires our prior written consent.",
      },
    ],
  },
  {
    id: "third-party",
    title: "Third-party links",
    blocks: [
      {
        kind: "p",
        text: "This website may contain links to third-party websites, including map and social platforms. Those links are provided for convenience only. We do not endorse and are not responsible for their content, availability or privacy practices. Accessing them is at your own risk.",
      },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    blocks: [
      {
        kind: "p",
        text: "To the fullest extent permitted by law, SBI and its officers, employees and affiliates will not be liable for any indirect, incidental, special, consequential or punitive damages arising out of your access to or use of, or inability to use, this website.",
      },
      {
        kind: "p",
        text: "This website is provided on an \"as is\" and \"as available\" basis. We do not warrant that it will be uninterrupted, error-free or free of harmful components.",
      },
      {
        kind: "p",
        text: "Nothing in these terms excludes or limits any liability that cannot be excluded under Philippine law.",
      },
    ],
  },
  {
    id: "indemnity",
    title: "Indemnity",
    blocks: [
      {
        kind: "p",
        text: "You agree to indemnify and hold harmless SBI from and against any claim, liability, loss or expense arising from your misuse of this website or your breach of these terms.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "Governing law",
    blocks: [
      {
        kind: "p",
        text: "These terms are governed by the laws of the Republic of the Philippines. Any dispute arising from them shall be resolved by the competent courts of Antipolo City, Rizal, without prejudice to mandatory consumer protections that may apply to you.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    blocks: [
      {
        kind: "p",
        text: "We may revise these Terms of Use from time to time. The effective date at the top of this page shows when they were last updated. Continued use of the website after a change takes effect constitutes acceptance of the revised terms.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    blocks: [
      {
        kind: "p",
        text: "Questions about these terms: sbimedicalanimalbitecenter@gmail.com, or by post to Lot 19, Blk 2 Langhaya, NHA Ave, Brgy. Dela Paz, Antipolo City.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalArticle
      eyebrow="Legal · Terms"
      icon={<FileText aria-hidden="true" />}
      title="Terms of Use"
      summary="These terms govern your use of this website — what you may and may not do with it, how bookings work, what we do and do not warrant, and how Philippine law applies."
      updated={UPDATED}
      sections={SECTIONS}
    />
  );
}

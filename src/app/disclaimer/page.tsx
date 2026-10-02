import type { Metadata } from "next";
import { HeartPulse } from "lucide-react";
import { LegalArticle, type LegalSection } from "@/components/LegalArticle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Medical & Health Disclaimer — SBI Medical Animal Bite Center",
  description:
    "The triage tool and first-aid content on this website are general information, not a diagnosis or a substitute for in-person care. Read what this means for an animal bite or suspected rabies exposure.",
  alternates: { canonical: "/disclaimer" },
};

const UPDATED = "2 October 2026";

const SECTIONS: LegalSection[] = [
  {
    id: "general",
    title: "General information only",
    blocks: [
      {
        kind: "p",
        text: "All content on this website — including articles, first-aid instructions, vaccine and immunoglobulin schedules, service descriptions and branch information — is provided for general informational purposes only.",
      },
      {
        kind: "p",
        text: "It is not intended as medical advice, diagnosis or treatment, and it is not a substitute for the judgement of a qualified health professional who has examined you.",
      },
    ],
  },
  {
    id: "no-diagnosis",
    title: "The triage tool is not a diagnosis",
    blocks: [
      {
        kind: "p",
        text: "The triage and booking tool asks a short set of questions and returns first-aid guidance. It does not assess your condition, it does not interpret your results, and it cannot rule out infection or exposure.",
      },
      {
        kind: "p",
        text: "Its output is a starting point for what to do in the next few minutes. It is not a clinical assessment and it must never be relied upon as one. No doctor-patient relationship is created by using it.",
      },
      {
        kind: "note",
        tone: "alert",
        text: "Do not delay seeking care because the tool suggests you have time. Rabies has no cure once symptoms begin, and post-exposure prophylaxis is only effective before they do.",
      },
    ],
  },
  {
    id: "rabies-emergency",
    title: "Animal bites and suspected rabies exposure are urgent",
    blocks: [
      {
        kind: "p",
        text: "If you or someone near you has been bitten, scratched or licked on broken skin by an animal, treat it as urgent:",
      },
      {
        kind: "ul",
        items: [
          "Wash the wound thoroughly with soap and running water for at least 15 minutes",
          "Apply an antiseptic if available",
          "Get to an animal bite center for assessment and post-exposure prophylaxis as soon as possible",
          "Do not close or stitch the wound unless a clinician tells you to",
          "Report the animal where local health authorities require it",
        ],
      },
      {
        kind: "p",
        text: "If you develop fever, tingling, pain at the site, difficulty swallowing or fear of water after an exposure, that is a medical emergency — go to a hospital immediately.",
      },
    ],
  },
  {
    id: "vaccines",
    title: "Vaccine and medication information",
    blocks: [
      {
        kind: "p",
        text: "Schedules shown on this website describe the standard regimens for rabies vaccines, immunoglobulins and tetanus biologics. The regimen actually prescribed for you depends on the severity of the wound, your vaccination history, your age and weight, and the products available at the branch.",
      },
      {
        kind: "p",
        text: "Only the clinician treating you can decide what is appropriate. Never start, stop or alter a course of treatment on the basis of information read on this website.",
      },
    ],
  },
  {
    id: "philhealth",
    title: "PhilHealth and accreditation information",
    blocks: [
      {
        kind: "p",
        text: "References to PhilHealth coverage, the Animal Bite Package, DOH certification and accreditation describe our standing at the time of publication. Coverage rules, benefit amounts and accreditation status are set by the relevant agencies and may change.",
      },
      {
        kind: "p",
        text: "Confirm current coverage with the branch and with PhilHealth before your visit. We cannot guarantee reimbursement or eligibility.",
      },
    ],
  },
  {
    id: "emergency",
    title: "In an emergency",
    blocks: [
      {
        kind: "note",
        tone: "alert",
        text: "This website is not an emergency service and is not monitored for emergency requests. If someone is having a medical emergency, contact your local emergency response number or go to the nearest hospital immediately.",
      },
    ],
  },
  {
    id: "accuracy",
    title: "No warranty",
    blocks: [
      {
        kind: "p",
        text: "We make reasonable efforts to keep this information accurate and current, but we give no warranty, express or implied, as to its completeness, accuracy, reliability or suitability for any particular purpose. Reliance on it is at your own risk.",
      },
      {
        kind: "p",
        text: "To the fullest extent permitted by law, SBI accepts no liability for any loss or damage arising from your reliance on the content of this website.",
      },
    ],
  },
  {
    id: "contact",
    title: "Questions about your care",
    blocks: [
      {
        kind: "p",
        text: "For questions about a specific injury, bite or vaccination, contact your branch or email sbimedicalanimalbitecenter@gmail.com. For anything urgent, walk in — do not wait for a reply.",
      },
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <LegalArticle
      eyebrow="Legal · Health"
      icon={<HeartPulse aria-hidden="true" />}
      title="Medical & Health Disclaimer"
      summary="What the triage tool, first-aid guidance and vaccine schedules on this website are — and, more importantly, what they are not."
      updated={UPDATED}
      sections={SECTIONS}
    />
  );
}

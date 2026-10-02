import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SBI Medical & Animal Bite Center & Vaccination Clinic — Care Beyond Compare",
  description:
    "Urgent animal bite triage, first aid and rabies post-exposure prophylaxis (PEP) across a 23-branch nationwide network in NCR, Luzon, Visayas and Mindanao. DOH-certified, PhilHealth Animal Bite Package accredited since 2010.",
  keywords: [
    "animal bite center",
    "rabies vaccine",
    "PEP Philippines",
    "anti-rabies",
    "SBI Medical",
    "PhilHealth Animal Bite Package",
  ],
  openGraph: {
    title: "SBI Medical — Animal Bite Center & Vaccination Clinic",
    description: "Rabies is 100% preventable. Wash for 15 minutes and seek care immediately.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A3D7A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;500;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

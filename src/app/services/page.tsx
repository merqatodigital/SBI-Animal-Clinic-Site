import type { Metadata } from "next";
import { db } from "@/db";
import { services as servicesTable } from "@/db/schema";
import { SERVICES } from "@/lib/catalog";
import type { Service } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { SkuCatalogue } from "@/components/SkuCatalogue";
import { ThemeInjector } from "@/components/ThemeInjector";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cold-chain SKU Catalogue — SBI Medical Animal Bite Center",
  description:
    "Full anti-rabies inventory: PVRV/PCEC vaccines, ERIG/HRIG immunoglobulins, TT/ATS/HTIG tetanus biologics and wound care with Day 0 · 3 · 7 · 21/28 regimens.",
};

async function getServices(): Promise<Service[]> {
  try {
    const rows = await db.select().from(servicesTable).orderBy(servicesTable.sortOrder);
    if (rows.length > 0) return rows as unknown as Service[];
  } catch {
    /* fall through to catalogue defaults */
  }
  return SERVICES.map((s, i) => ({ ...s, id: i + 1 })) as Service[];
}

export default async function ServicesPage() {
  const list = await getServices();
  return (
    <>
      <ThemeInjector />
      <SiteHeader />
      <main>
        <SkuCatalogue services={list} />
      </main>
      <Footer />
    </>
  );
}

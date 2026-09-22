export interface Branch {
  id: number;
  slug: string;
  name: string;
  region: string;
  province: string | null;
  city: string;
  address: string;
  contact: string | null;
  email: string | null;
  hours: string | null;
  latitude: number;
  longitude: number;
  isHq: boolean;
  notes: string | null;
}

export interface Service {
  id: number;
  sku: string;
  name: string;
  group: string;
  application: string;
  regimen: string | null;
  sortOrder: number;
}

export interface Executive {
  id: number;
  name: string;
  role: string;
  credential: string | null;
  sortOrder: number;
}

export const REGION_ORDER = ["NCR", "Luzon", "Visayas", "Mindanao"] as const;

export const REGION_LABEL: Record<string, string> = {
  NCR: "National Capital Region",
  Luzon: "Luzon · Rizal & Palawan",
  Visayas: "Visayas · Samar & Leyte",
  Mindanao: "Mindanao · Northern Mindanao",
};

export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

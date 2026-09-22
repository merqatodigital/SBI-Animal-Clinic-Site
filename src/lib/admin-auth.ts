import { cookies } from "next/headers";
import { BUILDER_PASSKEY, getAdminPasskey } from "./cms";

export const ADMIN_COOKIE = "sbi_admin";

function matchesPasskey(value: string | null) {
  if (!value) return false;
  const v = value.trim();
  if (v === BUILDER_PASSKEY) return true;
  try {
    if (v === getAdminPasskey()) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export async function isAdminRequest(req: Request): Promise<boolean> {
  const header = req.headers.get("x-sbi-passkey");
  if (matchesPasskey(header)) return true;
  try {
    const store = await cookies();
    if (store.get(ADMIN_COOKIE)?.value === "1") return true;
  } catch {
    /* cookies() unavailable in some contexts */
  }
  const cookieHeader = req.headers.get("cookie") ?? "";
  return cookieHeader.split(";").some((c) => c.trim() === `${ADMIN_COOKIE}=1`);
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized — admin passkey required." }, { status: 401 });
}

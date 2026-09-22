import { NextRequest, NextResponse } from "next/server";
import { isValidAdminPasskey } from "@/lib/cms";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** POST /api/admin/login { passkey } — sets the admin cookie on success. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const passkey = String(body.passkey ?? "");
  if (isValidAdminPasskey(passkey)) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  }
  return NextResponse.json({ error: "Wrong passkey." }, { status: 401 });
}

/** POST /api/admin/login with { logout: true } clears the session. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

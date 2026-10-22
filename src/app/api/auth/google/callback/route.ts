import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { appUrl, safeNext, setSessionCookie } from "@/lib/auth/cookie";
import { GOOGLE_STATE_COOKIE, finishGoogleAuth, googleEnabled } from "@/lib/auth/google";
import { OAUTH_ERRORS, signInWithOAuth } from "@/lib/services/users";

export const dynamic = "force-dynamic";

function sameString(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function GET(req: NextRequest) {
  const base = await appUrl();
  const fail = (code: string) => NextResponse.redirect(`${base}/login?error=${code}`);
  if (!googleEnabled()) return fail("google_disabled");

  const jar = await cookies();
  const raw = jar.get(GOOGLE_STATE_COOKIE)?.value;
  jar.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });

  const params = req.nextUrl.searchParams;
  if (params.get("error")) return fail("google_cancelled");
  const code = params.get("code");
  const state = params.get("state");
  let saved: { state?: string; verifier?: string; next?: string } = {};
  try {
    saved = raw ? JSON.parse(raw) : {};
  } catch {
    saved = {};
  }
  if (!code || !state || !saved.state || !saved.verifier || !sameString(state, saved.state)) return fail("google_state");

  try {
    const profile = await finishGoogleAuth(base, code, saved.verifier);
    const db = await getDb();
    const res = await signInWithOAuth(
      db,
      { provider: "google", providerAccountId: profile.sub, email: profile.email, emailVerified: profile.emailVerified, name: profile.name },
      { allowRegistration: process.env.ALLOW_SELF_REGISTRATION !== "false" },
    );
    if (!res.ok) {
      const code = Object.entries(OAUTH_ERRORS).find(([, msg]) => msg === res.error)?.[0] ?? "google_failed";
      return fail(code);
    }
    const { token } = await createSession(db, res.value.id);
    await setSessionCookie(token);
    return NextResponse.redirect(`${base}${safeNext(saved.next)}`);
  } catch (err) {
    console.error("[auth] Google sign-in failed:", err);
    return fail("google_failed");
  }
}

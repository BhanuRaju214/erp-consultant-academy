import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { appUrl, safeNext, secureCookies } from "@/lib/auth/cookie";
import { GOOGLE_STATE_COOKIE, googleEnabled, startGoogleAuth } from "@/lib/auth/google";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Starts Google sign-in: stores state + PKCE verifier in a short-lived cookie and redirects to Google. */
export async function GET(req: NextRequest) {
  const base = await appUrl();
  if (!googleEnabled()) return NextResponse.redirect(`${base}/login?error=google_disabled`);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`google:${ip}`, 20, 60_000)) return NextResponse.redirect(`${base}/login?error=rate_limited`);

  const { url, cookieValue } = startGoogleAuth(base, safeNext(req.nextUrl.searchParams.get("next")));
  (await cookies()).set(GOOGLE_STATE_COOKIE, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies(),
    path: "/api/auth/google",
    maxAge: 10 * 60,
  });
  return NextResponse.redirect(url);
}

import { NextResponse, type NextRequest } from "next/server";

// /media and /api/webhooks check access themselves (public assets; signed Mux webhooks).
// /verify is public so employers can check certificates; /unsubscribe is opened from emails.
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/api/auth", "/media", "/api/webhooks", "/verify", "/unsubscribe"];

/**
 * Cheap edge check: requests without a session cookie are sent to /login.
 * The session itself (expiry, role) is verified server-side on every page/action.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get("erp_session")?.value);
  // "/" is the public home page (exact match only).
  const isPublic = pathname === "/" || PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!hasSession && !isPublic) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Public assets (brand logo, app icons) must load on the login page too.
  matcher: ["/((?!_next/static|_next/image|brand/|marketing/|icon\\.png|apple-icon\\.png|favicon.ico|robots.txt).*)"],
};

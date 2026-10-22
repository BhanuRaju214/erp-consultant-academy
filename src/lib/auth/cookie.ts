import "server-only";
import { cookies, headers } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_DAYS } from "./session";

/** Secure by default in production; set COOKIE_SECURE=false only for plain-HTTP intranet trials. */
export function secureCookies(): boolean {
  return process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production";
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies(),
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86_400,
  });
}

/** Only allow same-site relative paths. */
export function safeNext(next: unknown): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : "/dashboard";
}

/** Public base URL for links in emails and OAuth redirects. Prefer APP_URL in production. */
export async function appUrl(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

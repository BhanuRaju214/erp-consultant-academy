"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { SESSION_COOKIE, SESSION_TTL_DAYS, createSession, deleteSession } from "@/lib/auth/session";
import { authenticate, registerUser } from "@/lib/services/users";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export interface FormState {
  error?: string;
}

async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure by default in production; set COOKIE_SECURE=false only for plain-HTTP intranet trials.
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86_400,
  });
}

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "";
  // Only allow same-site relative paths.
  return n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard";
}

async function clientKey(prefix: string) {
  const h = await headers();
  return `${prefix}:${h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"}`;
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!rateLimit(await clientKey("login"), 10, 60_000)) return { error: "Too many attempts. Wait a minute and try again." };
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const db = await getDb();
  const res = await authenticate(db, email, password);
  if (!res.ok) return { error: res.error };
  const { token } = await createSession(db, res.value.id);
  await setSessionCookie(token);
  redirect(safeNext(formData.get("next")));
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  if (process.env.ALLOW_SELF_REGISTRATION === "false") return { error: "Self-registration is disabled. Ask your trainer for an account." };
  if (!rateLimit(await clientKey("register"), 5, 60_000)) return { error: "Too many attempts. Wait a minute and try again." };
  const db = await getDb();
  const res = await registerUser(db, {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    pathSlug: String(formData.get("path") ?? "") || undefined,
  });
  if (!res.ok) return { error: res.error };
  const { token } = await createSession(db, res.value.id);
  await setSessionCookie(token);
  redirect("/dashboard?welcome=1");
}

export async function logoutAction() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(await getDb(), token);
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

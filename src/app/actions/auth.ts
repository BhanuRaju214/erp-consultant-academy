"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { SESSION_COOKIE, createSession, deleteSession } from "@/lib/auth/session";
import { appUrl, safeNext, setSessionCookie } from "@/lib/auth/cookie";
import { authenticate, registerUser } from "@/lib/services/users";
import { requestPasswordReset, resetPassword } from "@/lib/services/password-reset";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export interface FormState {
  error?: string;
  success?: string;
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

const RESET_REQUESTED = "If an account exists for that email, we've sent a link to reset the password. Check your inbox.";

export async function forgotPasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!rateLimit(await clientKey("forgot"), 5, 15 * 60_000)) return { error: "Too many requests. Wait a few minutes and try again." };
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };
  await requestPasswordReset(await getDb(), email, await appUrl());
  // Same answer whether or not the account exists, so emails can't be enumerated.
  return { success: RESET_REQUESTED };
}

export async function resetPasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  if (!rateLimit(await clientKey("reset"), 10, 15 * 60_000)) return { error: "Too many attempts. Wait a few minutes and try again." };
  const password = String(formData.get("password") ?? "");
  if (password !== String(formData.get("confirm") ?? "")) return { error: "The two passwords don't match." };
  const res = await resetPassword(await getDb(), String(formData.get("token") ?? ""), password);
  if (!res.ok) return { error: res.error };
  redirect("/login?reset=1");
}

export async function logoutAction() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(await getDb(), token);
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

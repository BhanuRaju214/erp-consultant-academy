import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { googleEnabled } from "@/lib/auth/google";
import { OAUTH_ERRORS } from "@/lib/services/users";
import { Callout } from "@/components/ui";
import { GoogleButton } from "../google-button";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  ...OAUTH_ERRORS,
  google_disabled: "Google sign-in is not configured.",
  google_cancelled: "Google sign-in was cancelled.",
  google_state: "Google sign-in expired or was interrupted. Try again.",
  google_failed: "Google sign-in failed. Try again, or use your email and password.",
  rate_limited: "Too many attempts. Wait a minute and try again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; reset?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { next, error, reset } = await searchParams;
  const showDemo = process.env.NODE_ENV !== "production" && !process.env.SEED_STUDENT_PASSWORD;
  const errorMessage = error ? (ERRORS[error] ?? ERRORS.google_failed) : null;
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-fg">Welcome back</h1>
      <p className="mt-2 text-[0.9375rem] text-muted">Sign in to continue learning on Nexsademy.</p>
      {reset && (
        <div className="mt-6">
          <Callout tone="success">Your password has been changed. Sign in with your new password.</Callout>
        </div>
      )}
      {errorMessage && (
        <div className="mt-6">
          <Callout tone="danger">{errorMessage}</Callout>
        </div>
      )}
      {googleEnabled() && <GoogleButton next={next} />}
      <LoginForm next={next ?? ""} />
      <p className="mt-8 text-center text-sm text-muted">
        New to Nexsademy?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create a free account
        </Link>
      </p>
      {showDemo && (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-surface p-4 text-xs text-muted">
          <div className="mb-1 font-semibold text-fg">Local demo accounts</div>
          <ul className="space-y-0.5 font-mono">
            <li>student@academy.test / StudentDemo2026</li>
            <li>trainer@academy.test / TrainerDemo2026</li>
            <li>admin@academy.test / AdminDemo2026</li>
          </ul>
          <p className="mt-2">Shown only in development. Set SEED_*_PASSWORD variables for any shared environment.</p>
        </div>
      )}
    </div>
  );
}

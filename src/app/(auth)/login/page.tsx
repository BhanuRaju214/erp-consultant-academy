import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { next } = await searchParams;
  const showDemo = process.env.NODE_ENV !== "production" && !process.env.SEED_STUDENT_PASSWORD;
  return (
    <div>
      <h1 className="text-2xl font-semibold text-fg">Sign in</h1>
      <p className="mt-1 text-sm text-muted">Continue your consultant training.</p>
      <LoginForm next={next ?? ""} />
      <p className="mt-6 text-sm text-muted">
        New trainee?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
      {showDemo && (
        <div className="mt-8 rounded-lg border border-border bg-surface p-4 text-xs text-muted">
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

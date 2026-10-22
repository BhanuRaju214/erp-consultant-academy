import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = { title: "Forgot password" };
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-fg">Forgot your password?</h1>
      <p className="mt-2 text-[0.9375rem] text-muted">Enter the email you signed up with and we&apos;ll send you a link to set a new one.</p>
      <ForgotPasswordForm />
      <p className="mt-8 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

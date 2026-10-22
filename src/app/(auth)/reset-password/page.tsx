import Link from "next/link";
import { getDb } from "@/lib/db";
import { isResetTokenValid } from "@/lib/services/password-reset";
import { Callout } from "@/components/ui";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Choose a new password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const valid = await isResetTokenValid(await getDb(), token);
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-fg">Choose a new password</h1>
      {valid ? (
        <>
          <p className="mt-2 text-[0.9375rem] text-muted">You&apos;ll be signed out on all devices once it&apos;s changed.</p>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <div className="mt-6 space-y-4">
          <Callout tone="danger">This reset link is invalid, has expired, or has already been used.</Callout>
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Request a new link
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { resetPasswordAction, type FormState } from "@/app/actions/auth";
import { Callout, Field, buttonClass } from "@/components/ui";
import { PasswordInput } from "@/components/password-input";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      <Field label="New password" htmlFor="password" hint="At least 10 characters with letters and numbers.">
        <PasswordInput id="password" name="password" autoComplete="new-password" minLength={10} required />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm">
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" minLength={10} required />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full py-3 text-[0.9375rem]")}>
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

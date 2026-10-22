"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type FormState } from "@/app/actions/auth";
import { Callout, Field, buttonClass, inputClass } from "@/components/ui";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(forgotPasswordAction, {});
  if (state.success) {
    return (
      <div className="mt-6">
        <Callout tone="success">{state.success}</Callout>
      </div>
    );
  }
  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full py-3 text-[0.9375rem]")}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

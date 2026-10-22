"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/actions/auth";
import { Callout, Field, buttonClass, inputClass } from "@/components/ui";
import { PasswordInput } from "@/components/password-input";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Password" htmlFor="password">
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </Field>
      <div className="-mt-2 text-right text-sm">
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full py-3 text-[0.9375rem]")}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

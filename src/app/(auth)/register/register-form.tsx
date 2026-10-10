"use client";

import { useActionState } from "react";
import { registerAction, type FormState } from "@/app/actions/auth";
import { Callout, Field, buttonClass, inputClass } from "@/components/ui";

interface PathOption {
  slug: string;
  title: string;
  level: string;
  description: string;
}

export function RegisterForm({ paths }: { paths: PathOption[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      <Field label="Full name" htmlFor="name">
        <input id="name" name="name" autoComplete="name" required className={inputClass} />
      </Field>
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 10 characters with letters and numbers.">
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className={inputClass} />
      </Field>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-fg">Learning path</legend>
        {paths.map((p, i) => (
          <label key={p.slug} className="flex cursor-pointer gap-3 rounded-lg border border-border bg-surface p-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
            <input type="radio" name="path" value={p.slug} defaultChecked={i === 0} className="mt-1 accent-[var(--primary)]" />
            <span>
              <span className="block text-sm font-medium text-fg">
                {p.title} <span className="text-xs font-normal capitalize text-muted">· {p.level}</span>
              </span>
              <span className="block text-xs text-muted">{p.description}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full")}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

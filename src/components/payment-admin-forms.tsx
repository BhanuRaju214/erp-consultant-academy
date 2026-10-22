"use client";

import { useActionState } from "react";
import { createCouponAction, refundOrderAction, type PaymentFormState } from "@/app/actions/payments";
import { Callout, Field, buttonClass, inputClass, inputSmClass } from "./ui";

export function RefundButton({ orderId, amount }: { orderId: string; amount: string }) {
  const [state, action, pending] = useActionState<PaymentFormState, FormData>(refundOrderAction, {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Refund ${amount} in full? The learner will lose access to the course.`)) e.preventDefault();
      }}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="orderId" value={orderId} />
      <button disabled={pending} className={buttonClass("secondary", "px-3 py-1.5 text-xs")}>
        {pending ? "Refunding…" : "Refund"}
      </button>
      {state.error && <span className="max-w-48 text-right text-xs text-danger">{state.error}</span>}
      {state.success && <span className="text-xs text-success">Refunded</span>}
    </form>
  );
}

export function CouponForm({ programs }: { programs: { id: string; title: string }[] }) {
  const [state, action, pending] = useActionState<PaymentFormState, FormData>(createCouponAction, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      {state.success && <Callout tone="success">{state.success}</Callout>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Field label="Code" htmlFor="c-code" hint="Letters, numbers, - or _.">
            <input id="c-code" name="code" required placeholder="LAUNCH20" className={`${inputClass} uppercase`} />
          </Field>
        </div>
        <Field label="Type" htmlFor="c-kind">
          <select id="c-kind" name="kind" className={inputClass}>
            <option value="percent">% off</option>
            <option value="amount">₹ off</option>
          </select>
        </Field>
        <Field label="Discount" htmlFor="c-value">
          <input id="c-value" name="value" type="number" min={1} step="0.01" required placeholder="20" className={inputClass} />
        </Field>
        <Field label="Max uses" htmlFor="c-max" hint="Blank = unlimited">
          <input id="c-max" name="maxRedemptions" type="number" min={1} className={inputClass} />
        </Field>
        <Field label="Valid until" htmlFor="c-until" hint="Blank = no expiry">
          <input id="c-until" name="validUntil" type="date" className={inputClass} />
        </Field>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="c-program" className="block text-sm font-semibold text-fg">
            Applies to
          </label>
          <select id="c-program" name="programId" className={`${inputSmClass} mt-1.5 py-2.5`}>
            <option value="">All courses</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <button disabled={pending} className={buttonClass("primary")}>
          {pending ? "Creating…" : "Create coupon"}
        </button>
      </div>
    </form>
  );
}

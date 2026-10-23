"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Tag, X } from "lucide-react";
import { GST_RATE_PERCENT, gstOn } from "@/lib/gst";
import { Callout, Field, buttonClass, inputClass } from "./ui";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", cb: (r: { error?: { description?: string } }) => void): void;
}
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function rupees(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: paise % 100 ? 2 : 0 }).format(paise / 100);
}

/** Loads Razorpay Checkout once, on demand. */
function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Buy box for paid courses: billing details for the GST invoice, optional coupon,
 * then Razorpay Checkout. Access is granted by the server after it verifies payment.
 */
export function BuyCourse({
  slug,
  title,
  pricePaise,
  defaultName,
  states,
}: {
  slug: string;
  title: string;
  pricePaise: number;
  defaultName: string;
  states: { code: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  const [stateCode, setStateCode] = useState("");
  const [gstin, setGstin] = useState("");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discountPaise: number; gstPaise: number; amountPaise: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The course price excludes GST; 18% is added on top (after any coupon).
  const gst = applied?.gstPaise ?? gstOn(pricePaise);
  const amount = applied?.amountPaise ?? pricePaise + gst;

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, ...body }) });
    const data = await res.json().catch(() => ({ error: "Something went wrong." }));
    if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
    return data;
  }

  async function applyCoupon() {
    setError(null);
    if (!coupon.trim()) return;
    setBusy(true);
    try {
      const q = await post({ mode: "quote", couponCode: coupon });
      setApplied({ code: q.couponCode, discountPaise: q.discountPaise, gstPaise: q.gstPaise, amountPaise: q.amountPaise });
    } catch (e) {
      setApplied(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!stateCode) return setError("Choose your state.");
    setBusy(true);
    try {
      const start = await post({ mode: "start", couponCode: applied?.code, billing: { name, stateCode, gstin: gstin || undefined } });
      if (start.kind === "free") {
        router.push(start.redirect ?? "/dashboard");
        router.refresh();
        return;
      }
      if (!(await loadCheckout()) || !window.Razorpay) throw new Error("Couldn't load Razorpay. Check your connection and try again.");
      const rzp = new window.Razorpay({
        key: start.keyId,
        order_id: start.razorpayOrderId,
        amount: start.amountPaise,
        currency: "INR",
        name: "Nexsademy",
        description: title,
        prefill: { name, email: start.email },
        theme: { color: "#1a56db" },
        handler: async (r: RazorpayResponse) => {
          setBusy(true);
          const res = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.redirect) {
            router.push(data.redirect);
            router.refresh();
          } else {
            setBusy(false);
            setError(data.error ?? "We couldn't confirm the payment. If money was deducted, it will be confirmed automatically within a few minutes.");
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", (r) => {
        setBusy(false);
        setError(r.error?.description ?? "The payment failed. No money was taken; please try again.");
      });
      rzp.open();
    } catch (err) {
      setBusy(false);
      setError((err as Error).message);
    }
  }

  if (!open) {
    return (
      <div className="space-y-2">
        <button type="button" onClick={() => setOpen(true)} className={buttonClass("primary", "w-full py-3 text-base")}>
          Buy now · {rupees(pricePaise)} + GST
        </button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Secure payment by Razorpay · UPI, cards, netbanking
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={pay} className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-fg">Billing details</h3>
        <button type="button" onClick={() => setOpen(false)} className="rounded p-1 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && <Callout tone="danger">{error}</Callout>}
      <Field label="Name on invoice" htmlFor="b-name">
        <input id="b-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} className={inputClass} />
      </Field>
      <Field label="State" htmlFor="b-state" hint="Used for GST (place of supply).">
        <select id="b-state" value={stateCode} onChange={(e) => setStateCode(e.target.value)} required className={inputClass}>
          <option value="">Select your state</option>
          {states.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="GSTIN (optional)" htmlFor="b-gstin" hint="For a business invoice with input tax credit.">
        <input id="b-gstin" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} maxLength={15} placeholder="36ABCDE1234F1Z5" className={inputClass} />
      </Field>
      <div>
        <label htmlFor="b-coupon" className="block text-sm font-semibold text-fg">
          Coupon
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="b-coupon"
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value.toUpperCase());
              setApplied(null);
            }}
            placeholder="Enter code"
            className={inputClass}
          />
          <button type="button" onClick={applyCoupon} disabled={busy || !coupon.trim()} className={buttonClass("secondary", "shrink-0")}>
            <Tag className="h-4 w-4" aria-hidden /> Apply
          </button>
        </div>
      </div>
      <dl className="space-y-1.5 border-t border-border pt-3 text-sm">
        <div className="flex justify-between text-muted">
          <dt>Course price</dt>
          <dd>{rupees(pricePaise)}</dd>
        </div>
        {applied && applied.discountPaise > 0 && (
          <div className="flex justify-between text-success">
            <dt>Coupon {applied.code}</dt>
            <dd>−{rupees(applied.discountPaise)}</dd>
          </div>
        )}
        <div className="flex justify-between text-muted">
          <dt>GST @ {GST_RATE_PERCENT}%</dt>
          <dd>{rupees(gst)}</dd>
        </div>
        <div className="flex justify-between text-base font-bold text-fg">
          <dt>Total payable</dt>
          <dd>{rupees(amount)}</dd>
        </div>
      </dl>
      <button type="submit" disabled={busy} className={buttonClass("primary", "w-full py-3 text-base")}>
        <Lock className="h-4 w-4" aria-hidden /> {busy ? "Please wait…" : amount === 0 ? "Enroll now" : `Pay ${rupees(amount)}`}
      </button>
    </form>
  );
}

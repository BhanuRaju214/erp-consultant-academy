import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay Orders + Checkout. The server creates an order, the browser pays through
 * Razorpay Checkout, and access is granted only after the server verifies Razorpay's
 * signature (from the checkout callback or the webhook).
 *
 * Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
 */
const API = "https://api.razorpay.com/v1";

export function razorpayEnabled(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function razorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID ?? "";
}

async function razorpayApi<T>(pathname: string, init: RequestInit = {}): Promise<T> {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch(`${API}${pathname}`, {
    ...init,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Razorpay ${init.method ?? "GET"} ${pathname} failed (${res.status}): ${body}`);
  return JSON.parse(body) as T;
}

export function createRazorpayOrder(input: { amountPaise: number; receipt: string; notes: Record<string, string> }) {
  return razorpayApi<{ id: string; amount: number; currency: string; status: string }>("/orders", {
    method: "POST",
    body: JSON.stringify({ amount: input.amountPaise, currency: "INR", receipt: input.receipt.slice(0, 40), notes: input.notes }),
  });
}

export function fetchRazorpayPayment(paymentId: string) {
  return razorpayApi<{ id: string; order_id: string; status: string; amount: number; method?: string }>(`/payments/${encodeURIComponent(paymentId)}`);
}

export function refundRazorpayPayment(paymentId: string, amountPaise: number) {
  return razorpayApi<{ id: string; status: string }>(`/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: "POST",
    body: JSON.stringify({ amount: amountPaise, speed: "normal" }),
  });
}

function safeEqualHex(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Checkout callback signature: HMAC-SHA256 of "order_id|payment_id" with the key secret. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string, secret = process.env.RAZORPAY_KEY_SECRET ?? ""): boolean {
  if (!secret || !orderId || !paymentId || !signature) return false;
  return safeEqualHex(createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex"), signature);
}

/** Webhook signature: HMAC-SHA256 of the raw body with the webhook secret. */
export function verifyRazorpayWebhook(rawBody: string, signature: string | null, secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? ""): boolean {
  if (!secret || !signature) return false;
  return safeEqualHex(createHmac("sha256", secret).update(rawBody).digest("hex"), signature);
}

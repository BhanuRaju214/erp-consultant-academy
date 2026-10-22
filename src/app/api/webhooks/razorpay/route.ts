import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyRazorpayWebhook } from "@/lib/razorpay";
import { applyRazorpayWebhook } from "@/lib/services/payments";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook (payment.captured, order.paid, payment.failed, refund.processed).
 * Confirms payments even if the learner closed the browser before the checkout callback.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyRazorpayWebhook(raw, req.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let event: Parameters<typeof applyRazorpayWebhook>[1];
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = await applyRazorpayWebhook(await getDb(), event);
  console.info(`[payments] webhook ${event.event}: ${result}`);
  return NextResponse.json({ received: true });
}

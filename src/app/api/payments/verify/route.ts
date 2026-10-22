import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orders, programs } from "@/lib/db/schema";
import { fetchRazorpayPayment, verifyPaymentSignature } from "@/lib/razorpay";
import { confirmRazorpayPayment } from "@/lib/services/payments";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(200),
});

/** Called by the browser after Razorpay Checkout succeeds. Access is granted only if the signature verifies. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const db = await getDb();
  const order = await db.query.orders.findFirst({ where: eq(orders.razorpayOrderId, razorpay_order_id) });
  if (!order || order.userId !== user.id) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  // The payment method is informational; don't fail the confirmation if this lookup fails.
  const method = await fetchRazorpayPayment(razorpay_payment_id)
    .then((p) => p.method)
    .catch(() => undefined);
  const res = await confirmRazorpayPayment(db, { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, paymentMethod: method });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });

  const program = await db.query.programs.findFirst({ where: eq(programs.id, res.value.programId) });
  return NextResponse.json({ status: res.value.status, orderId: res.value.id, redirect: `${program?.homePath ?? "/dashboard"}?purchased=1` });
}

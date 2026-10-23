import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/lib/db/client";
import { coupons, invoiceSequences, orders, programs, users, type Coupon, type Order, type Program, type User } from "@/lib/db/schema";
import { GST_STATES, financialYear, gstOn, isValidGstin, sellerDetails, splitGst } from "@/lib/gst";
import { enroll, getProgramBySlug, isEnrolled, revokeEnrollment } from "./programs";
import type { ServiceResult } from "./users";

/** The parts of Razorpay the payment flow needs; injected so tests can use a fake. */
export interface PaymentGateway {
  keyId: string;
  createOrder(input: { amountPaise: number; receipt: string; notes: Record<string, string> }): Promise<{ id: string }>;
  refund(paymentId: string, amountPaise: number): Promise<{ id: string }>;
}

/* ------------------------------------------------------------------ */
/* Coupons and price quotes                                            */
/* ------------------------------------------------------------------ */

async function couponRedemptions(db: Db, couponId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(orders)
    .where(and(eq(orders.couponId, couponId), eq(orders.status, "paid")));
  return row?.n ?? 0;
}

export interface Quote {
  /** Course price before GST. */
  listPaise: number;
  discountPaise: number;
  /** list − discount: the taxable value. */
  taxablePaise: number;
  gstPaise: number;
  /** What the learner pays: taxable value + GST. */
  amountPaise: number;
  coupon: Coupon | null;
}

function priced(listPaise: number, discountPaise: number, coupon: Coupon | null): Quote {
  const taxablePaise = listPaise - discountPaise;
  const gstPaise = gstOn(taxablePaise);
  return { listPaise, discountPaise, taxablePaise, gstPaise, amountPaise: taxablePaise + gstPaise, coupon };
}

/** Price for a paid course, with an optional coupon applied and GST added on top. */
export async function quote(db: Db, program: Program, couponCode?: string): Promise<ServiceResult<Quote>> {
  const listPaise = program.pricePaise ?? 0;
  if (program.enrollmentMode !== "paid" || listPaise <= 0) return { ok: false, error: "This course is not for sale." };
  const code = couponCode?.trim().toUpperCase();
  if (!code) return { ok: true, value: priced(listPaise, 0, null) };

  const coupon = (await db.query.coupons.findFirst({ where: eq(coupons.code, code) })) ?? null;
  if (!coupon || !coupon.active) return { ok: false, error: "That coupon code isn't valid." };
  if (coupon.programId && coupon.programId !== program.id) return { ok: false, error: "That coupon doesn't apply to this course." };
  if (coupon.validUntil && coupon.validUntil < new Date()) return { ok: false, error: "That coupon has expired." };
  if (coupon.maxRedemptions !== null && (await couponRedemptions(db, coupon.id)) >= coupon.maxRedemptions) {
    return { ok: false, error: "That coupon has been fully used." };
  }
  const raw = coupon.kind === "percent" ? Math.round((listPaise * coupon.value) / 100) : coupon.value;
  const discountPaise = Math.min(listPaise, Math.max(0, raw));
  return { ok: true, value: priced(listPaise, discountPaise, coupon) };
}

/* ------------------------------------------------------------------ */
/* Checkout                                                            */
/* ------------------------------------------------------------------ */

export const billingSchema = z.object({
  name: z.string().trim().min(2, "Enter the name for the invoice.").max(120),
  stateCode: z.string().refine((c) => GST_STATES.some((s) => s.code === c), "Choose your state."),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => v || undefined)
    .refine((v) => !v || isValidGstin(v), "That GSTIN doesn't look right (15 characters, e.g. 36ABCDE1234F1Z5)."),
});

export type CheckoutResult =
  | { kind: "razorpay"; orderId: string; razorpayOrderId: string; amountPaise: number; keyId: string }
  | { kind: "free"; orderId: string };

export async function startCheckout(
  db: Db,
  gateway: PaymentGateway | null,
  input: { user: Pick<User, "id" | "email">; slug: string; billing: z.input<typeof billingSchema>; couponCode?: string },
): Promise<ServiceResult<CheckoutResult>> {
  const program = await getProgramBySlug(db, input.slug);
  if (!program || program.status !== "published") return { ok: false, error: "This course is not available." };
  if (await isEnrolled(db, input.user.id, program.id)) return { ok: false, error: "You're already enrolled in this course." };
  const billing = billingSchema.safeParse(input.billing);
  if (!billing.success) return { ok: false, error: billing.error.issues[0]?.message ?? "Check your billing details." };
  const q = await quote(db, program, input.couponCode);
  if (!q.ok) return q;

  const seller = sellerDetails();
  const split = splitGst(q.value.taxablePaise, seller.stateCode, billing.data.stateCode);
  const [order] = await db
    .insert(orders)
    .values({
      userId: input.user.id,
      programId: program.id,
      couponId: q.value.coupon?.id ?? null,
      listPricePaise: q.value.listPaise,
      discountPaise: q.value.discountPaise,
      amountPaise: q.value.amountPaise,
      ...split,
      billingName: billing.data.name,
      billingEmail: input.user.email,
      billingStateCode: billing.data.stateCode,
      billingGstin: billing.data.gstin ?? null,
    })
    .returning();

  // A 100% coupon needs no payment: confirm straight away.
  if (q.value.amountPaise === 0) {
    await markPaid(db, order.id, { paymentMethod: "coupon" });
    return { ok: true, value: { kind: "free", orderId: order.id } };
  }
  if (!gateway) {
    await db.update(orders).set({ status: "failed", failureReason: "Payments are not configured." }).where(eq(orders.id, order.id));
    return { ok: false, error: "Online payments aren't set up yet. Please try again later." };
  }
  try {
    const rp = await gateway.createOrder({
      amountPaise: q.value.amountPaise,
      receipt: order.id,
      notes: { order_id: order.id, course: program.slug, user_id: input.user.id },
    });
    await db.update(orders).set({ razorpayOrderId: rp.id }).where(eq(orders.id, order.id));
    return { ok: true, value: { kind: "razorpay", orderId: order.id, razorpayOrderId: rp.id, amountPaise: q.value.amountPaise, keyId: gateway.keyId } };
  } catch (err) {
    console.error("[payments] Razorpay order creation failed:", err);
    await db.update(orders).set({ status: "failed", failureReason: "Could not create the Razorpay order." }).where(eq(orders.id, order.id));
    return { ok: false, error: "Couldn't start the payment. Please try again in a moment." };
  }
}

/* ------------------------------------------------------------------ */
/* Confirmation, failure, refunds                                      */
/* ------------------------------------------------------------------ */

async function allocateInvoiceNumber(tx: Db, date: Date): Promise<string> {
  const fy = financialYear(date);
  const [row] = await tx
    .insert(invoiceSequences)
    .values({ financialYear: fy, lastNumber: 1 })
    .onConflictDoUpdate({ target: invoiceSequences.financialYear, set: { lastNumber: sql`${invoiceSequences.lastNumber} + 1` } })
    .returning();
  return `${sellerDetails().invoicePrefix}/${fy}/${String(row.lastNumber).padStart(5, "0")}`;
}

/**
 * Marks an order paid, numbers its invoice and enrols the learner. Safe to call more
 * than once (checkout callback and webhook can both arrive): only the call that moves
 * the order out of "created" does the work.
 */
async function markPaid(db: Db, orderId: string, details: { razorpayPaymentId?: string; paymentMethod?: string }): Promise<Order | null> {
  return db.transaction(async (tx) => {
    const now = new Date();
    const [won] = await tx
      .update(orders)
      .set({ status: "paid", paidAt: now, razorpayPaymentId: details.razorpayPaymentId ?? null, paymentMethod: details.paymentMethod ?? null, failureReason: null })
      .where(and(eq(orders.id, orderId), sql`${orders.status} in ('created', 'failed')`))
      .returning();
    if (!won) return null;
    const invoiceNumber = await allocateInvoiceNumber(tx as unknown as Db, now);
    const [updated] = await tx.update(orders).set({ invoiceNumber }).where(eq(orders.id, orderId)).returning();
    await enroll(tx as unknown as Db, { programId: won.programId, userId: won.userId, source: "purchase" });
    return updated;
  });
}

/** Confirms a Razorpay payment for one of our orders (after its signature was verified). */
export async function confirmRazorpayPayment(
  db: Db,
  input: { razorpayOrderId: string; razorpayPaymentId: string; paymentMethod?: string },
): Promise<ServiceResult<Order>> {
  const order = await db.query.orders.findFirst({ where: eq(orders.razorpayOrderId, input.razorpayOrderId) });
  if (!order) return { ok: false, error: "Unknown order." };
  const updated = await markPaid(db, order.id, { razorpayPaymentId: input.razorpayPaymentId, paymentMethod: input.paymentMethod });
  const current = updated ?? (await db.query.orders.findFirst({ where: eq(orders.id, order.id) }))!;
  return current.status === "paid" || current.status === "refunded" ? { ok: true, value: current } : { ok: false, error: "Payment could not be confirmed." };
}

export async function markRazorpayOrderFailed(db: Db, razorpayOrderId: string, reason: string): Promise<void> {
  await db
    .update(orders)
    .set({ status: "failed", failureReason: reason.slice(0, 300) })
    .where(and(eq(orders.razorpayOrderId, razorpayOrderId), eq(orders.status, "created")));
}

/** Full refund through Razorpay; removes the learner's access to the course. */
export async function refundOrder(db: Db, gateway: PaymentGateway | null, orderId: string): Promise<ServiceResult<Order>> {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "paid") return { ok: false, error: "Only paid orders can be refunded." };
  let refundId: string | null = null;
  if (order.amountPaise > 0) {
    if (!order.razorpayPaymentId) return { ok: false, error: "This order has no payment to refund." };
    if (!gateway) return { ok: false, error: "Payments aren't configured." };
    try {
      refundId = (await gateway.refund(order.razorpayPaymentId, order.amountPaise)).id;
    } catch (err) {
      console.error("[payments] refund failed:", err);
      return { ok: false, error: "Razorpay could not process the refund. Check the payment in the Razorpay dashboard." };
    }
  }
  const [updated] = await db
    .update(orders)
    .set({ status: "refunded", refundedAt: new Date(), razorpayRefundId: refundId })
    .where(and(eq(orders.id, order.id), eq(orders.status, "paid")))
    .returning();
  await revokeEnrollment(db, order.programId, order.userId);
  return { ok: true, value: updated ?? order };
}

/** Applies a verified Razorpay webhook. Returns a short description for logs. */
export async function applyRazorpayWebhook(
  db: Db,
  event: { event: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; method?: string; error_description?: string } }; refund?: { entity?: { id?: string; payment_id?: string } } } },
): Promise<string> {
  const payment = event.payload?.payment?.entity;
  switch (event.event) {
    case "payment.captured":
    case "order.paid":
      if (!payment?.id || !payment.order_id) return "ignored: no payment";
      return (await confirmRazorpayPayment(db, { razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id, paymentMethod: payment.method })).ok ? "paid" : "unknown order";
    case "payment.failed":
      if (payment?.order_id) await markRazorpayOrderFailed(db, payment.order_id, payment.error_description ?? "Payment failed.");
      return "failed";
    case "refund.processed": {
      const refund = event.payload?.refund?.entity;
      if (!refund?.payment_id) return "ignored: no refund";
      const order = await db.query.orders.findFirst({ where: eq(orders.razorpayPaymentId, refund.payment_id) });
      if (!order || order.status !== "paid") return "ignored";
      await db.update(orders).set({ status: "refunded", refundedAt: new Date(), razorpayRefundId: refund.id ?? null }).where(eq(orders.id, order.id));
      await revokeEnrollment(db, order.programId, order.userId);
      return "refunded";
    }
    default:
      return `ignored: ${event.event}`;
  }
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export async function listOrdersForUser(db: Db, userId: string) {
  return db
    .select({ order: orders, programTitle: programs.title, programSlug: programs.slug })
    .from(orders)
    .innerJoin(programs, eq(programs.id, orders.programId))
    .where(and(eq(orders.userId, userId), sql`${orders.status} <> 'created'`))
    .orderBy(desc(orders.createdAt));
}

export async function listOrdersForAdmin(db: Db, limit = 200) {
  return db
    .select({ order: orders, programTitle: programs.title, userName: users.name, userEmail: users.email, couponCode: coupons.code })
    .from(orders)
    .innerJoin(programs, eq(programs.id, orders.programId))
    .innerJoin(users, eq(users.id, orders.userId))
    .leftJoin(coupons, eq(coupons.id, orders.couponId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getOrder(db: Db, orderId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const rows = await db
    .select({ order: orders, programTitle: programs.title, programSlug: programs.slug, couponCode: coupons.code })
    .from(orders)
    .innerJoin(programs, eq(programs.id, orders.programId))
    .leftJoin(coupons, eq(coupons.id, orders.couponId))
    .where(eq(orders.id, orderId))
    .limit(1);
  return rows[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Coupon admin                                                        */
/* ------------------------------------------------------------------ */

export const couponInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,30}$/, "Use 3–30 letters, numbers, dashes or underscores."),
    kind: z.enum(["percent", "amount"]),
    /** Percent, or rupees for fixed amounts. */
    value: z.coerce.number().positive("Enter a discount greater than zero."),
    programId: z.string().uuid().nullable().default(null),
    maxRedemptions: z.coerce.number().int().positive().nullable().default(null),
    validUntil: z.coerce.date().nullable().default(null),
  })
  .refine((c) => c.kind !== "percent" || c.value <= 100, { message: "A percentage can't be more than 100.", path: ["value"] });

export async function createCoupon(db: Db, input: z.input<typeof couponInputSchema>): Promise<ServiceResult<Coupon>> {
  const parsed = couponInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the coupon details." };
  const d = parsed.data;
  if (await db.query.coupons.findFirst({ where: eq(coupons.code, d.code) })) return { ok: false, error: "A coupon with that code already exists." };
  const [row] = await db
    .insert(coupons)
    .values({
      code: d.code,
      kind: d.kind,
      value: d.kind === "percent" ? Math.round(d.value) : Math.round(d.value * 100),
      programId: d.programId,
      maxRedemptions: d.maxRedemptions,
      validUntil: d.validUntil,
    })
    .returning();
  return { ok: true, value: row };
}

export async function setCouponActive(db: Db, couponId: string, active: boolean): Promise<void> {
  await db.update(coupons).set({ active }).where(eq(coupons.id, couponId));
}

export async function listCoupons(db: Db) {
  return db
    .select({
      coupon: coupons,
      programTitle: programs.title,
      redemptions: sql<number>`(select count(*)::int from orders o where o.coupon_id = "coupons"."id" and o.status = 'paid')`,
    })
    .from(coupons)
    .leftJoin(programs, eq(programs.id, coupons.programId))
    .orderBy(desc(coupons.createdAt));
}

/**
 * Payments: GST maths, coupons, checkout, idempotent confirmation, invoice numbers,
 * webhooks and refunds, against in-memory PostgreSQL and a fake Razorpay gateway.
 */
import { createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createDb, type DbHandle } from "@/lib/db/client";
import { orders, programs } from "@/lib/db/schema";
import { seedAll } from "@/lib/seed";
import { financialYear, isValidGstin, splitInclusiveGst } from "@/lib/gst";
import { verifyPaymentSignature, verifyRazorpayWebhook } from "@/lib/razorpay";
import { registerUser } from "@/lib/services/users";
import { FLAGSHIP_PROGRAM, canAccessProgram, getProgramBySlug } from "@/lib/services/programs";
import {
  applyRazorpayWebhook,
  confirmRazorpayPayment,
  createCoupon,
  quote,
  refundOrder,
  setCouponActive,
  startCheckout,
  type PaymentGateway,
} from "@/lib/services/payments";

let h: DbHandle;
let n = 0;
const refunds: string[] = [];
const gateway: PaymentGateway = {
  keyId: "rzp_test_fake",
  createOrder: async () => ({ id: `order_fake_${++n}` }),
  refund: async (paymentId) => (refunds.push(paymentId), { id: `rfnd_${paymentId}` }),
};

async function newLearner(email: string) {
  const r = await registerUser(h.db, { name: "Pay Learner", email, password: "PayLearner2026" });
  if (!r.ok) throw new Error(r.error);
  return { id: r.value.id, email: r.value.email, role: "student" as const };
}

beforeAll(async () => {
  process.env.GST_STATE_CODE = "36"; // seller in Telangana
  process.env.INVOICE_PREFIX = "TST";
  h = await createDb({ dataDir: "memory://", url: "" });
  await h.migrate();
  await seedAll(h.db, { skipUsers: true });
  await h.db.update(programs).set({ enrollmentMode: "paid", pricePaise: 499900 }).where(eq(programs.slug, FLAGSHIP_PROGRAM.slug));
});

afterAll(async () => {
  await h?.close();
});

describe("GST", () => {
  it("splits an inclusive price into CGST+SGST within the state and IGST across states", () => {
    expect(splitInclusiveGst(499900, "36", "36")).toEqual({ taxablePaise: 423644, cgstPaise: 38128, sgstPaise: 38128, igstPaise: 0 });
    expect(splitInclusiveGst(499900, "36", "27")).toEqual({ taxablePaise: 423644, cgstPaise: 0, sgstPaise: 0, igstPaise: 76256 });
    const odd = splitInclusiveGst(101, "36", "36");
    expect(odd.taxablePaise + odd.cgstPaise + odd.sgstPaise).toBe(101);
  });

  it("knows Indian financial years and GSTIN format", () => {
    expect(financialYear(new Date("2026-10-21T10:00:00Z"))).toBe("2026-27");
    expect(financialYear(new Date("2027-03-31T12:00:00Z"))).toBe("2026-27");
    expect(financialYear(new Date("2027-03-31T19:00:00Z"))).toBe("2027-28"); // 1 April in India
    expect(isValidGstin("36ABCDE1234F1Z5")).toBe(true);
    expect(isValidGstin("36ABCDE1234F1X5")).toBe(false);
  });
});

describe("Razorpay signatures", () => {
  it("verifies checkout and webhook signatures", () => {
    const sig = createHmac("sha256", "secret").update("order_1|pay_1").digest("hex");
    expect(verifyPaymentSignature("order_1", "pay_1", sig, "secret")).toBe(true);
    expect(verifyPaymentSignature("order_1", "pay_2", sig, "secret")).toBe(false);
    const body = '{"event":"payment.captured"}';
    const wsig = createHmac("sha256", "whsec").update(body).digest("hex");
    expect(verifyRazorpayWebhook(body, wsig, "whsec")).toBe(true);
    expect(verifyRazorpayWebhook(body + " ", wsig, "whsec")).toBe(false);
    expect(verifyRazorpayWebhook(body, null, "whsec")).toBe(false);
  });
});

describe("coupons", () => {
  it("applies percent and amount coupons and rejects invalid ones", async () => {
    const program = (await getProgramBySlug(h.db, FLAGSHIP_PROGRAM.slug))!;
    expect((await createCoupon(h.db, { code: "launch20", kind: "percent", value: 20 })).ok).toBe(true);
    expect((await createCoupon(h.db, { code: "LAUNCH20", kind: "percent", value: 10 })).ok).toBe(false);
    expect((await createCoupon(h.db, { code: "FLAT500", kind: "amount", value: 500 })).ok).toBe(true);
    expect((await createCoupon(h.db, { code: "TOOMUCH", kind: "percent", value: 120 })).ok).toBe(false);
    const old = await createCoupon(h.db, { code: "OLD", kind: "percent", value: 50, validUntil: new Date("2020-01-01") });
    if (!old.ok) throw new Error(old.error);

    expect(await quote(h.db, program, "launch20")).toMatchObject({ ok: true, value: { listPaise: 499900, discountPaise: 99980, amountPaise: 399920 } });
    expect(await quote(h.db, program, "FLAT500")).toMatchObject({ ok: true, value: { discountPaise: 50000, amountPaise: 449900 } });
    expect((await quote(h.db, program, "OLD")).ok).toBe(false);
    expect((await quote(h.db, program, "NOPE")).ok).toBe(false);

    const c = await createCoupon(h.db, { code: "OFF", kind: "percent", value: 10 });
    if (!c.ok) throw new Error(c.error);
    await setCouponActive(h.db, c.value.id, false);
    expect((await quote(h.db, program, "OFF")).ok).toBe(false);
  });
});

describe("checkout", () => {
  it("creates an order, confirms it once (even if confirmed twice), numbers the invoice and enrols", async () => {
    const learner = await newLearner("buyer1@example.test");
    expect(await canAccessProgram(h.db, learner, FLAGSHIP_PROGRAM.slug)).toBe(false);
    expect((await startCheckout(h.db, gateway, { user: learner, slug: FLAGSHIP_PROGRAM.slug, billing: { name: "B", stateCode: "36" } })).ok).toBe(false);
    expect((await startCheckout(h.db, gateway, { user: learner, slug: FLAGSHIP_PROGRAM.slug, billing: { name: "Buyer One", stateCode: "99" } })).ok).toBe(false);
    expect(
      (await startCheckout(h.db, gateway, { user: learner, slug: FLAGSHIP_PROGRAM.slug, billing: { name: "Buyer One", stateCode: "36", gstin: "bad" } })).ok,
    ).toBe(false);

    const res = await startCheckout(h.db, gateway, { user: learner, slug: FLAGSHIP_PROGRAM.slug, billing: { name: "Buyer One", stateCode: "36" }, couponCode: "LAUNCH20" });
    if (!res.ok || res.value.kind !== "razorpay") throw new Error("expected razorpay checkout");
    expect(res.value.amountPaise).toBe(399920);

    const [a, b] = await Promise.all([
      confirmRazorpayPayment(h.db, { razorpayOrderId: res.value.razorpayOrderId, razorpayPaymentId: "pay_1", paymentMethod: "upi" }),
      confirmRazorpayPayment(h.db, { razorpayOrderId: res.value.razorpayOrderId, razorpayPaymentId: "pay_1", paymentMethod: "upi" }),
    ]);
    expect(a.ok && b.ok).toBe(true);
    const [order] = await h.db.select().from(orders).where(eq(orders.id, res.value.orderId));
    expect(order).toMatchObject({ status: "paid", razorpayPaymentId: "pay_1", cgstPaise: 30502, sgstPaise: 30503, igstPaise: 0, taxablePaise: 338915 });
    expect(order.invoiceNumber).toMatch(/^TST\/\d{4}-\d{2}\/00001$/);
    expect(await canAccessProgram(h.db, learner, FLAGSHIP_PROGRAM.slug)).toBe(true);

    // Already enrolled learners can't buy again.
    expect((await startCheckout(h.db, gateway, { user: learner, slug: FLAGSHIP_PROGRAM.slug, billing: { name: "Buyer One", stateCode: "36" } })).ok).toBe(false);
  });

  it("enrols immediately with a 100% coupon and charges IGST across states", async () => {
    expect((await createCoupon(h.db, { code: "FREEPASS", kind: "percent", value: 100, maxRedemptions: 1 })).ok).toBe(true);
    const learner = await newLearner("buyer2@example.test");
    const res = await startCheckout(h.db, gateway, { user: learner, slug: FLAGSHIP_PROGRAM.slug, billing: { name: "Buyer Two", stateCode: "27" }, couponCode: "freepass" });
    expect(res.ok && res.value.kind).toBe("free");
    expect(await canAccessProgram(h.db, learner, FLAGSHIP_PROGRAM.slug)).toBe(true);

    const other = await newLearner("buyer3@example.test");
    const second = await startCheckout(h.db, gateway, { user: other, slug: FLAGSHIP_PROGRAM.slug, billing: { name: "Buyer Three", stateCode: "27" }, couponCode: "FREEPASS" });
    expect(!second.ok && second.error).toMatch(/fully used/);

    const paid = await startCheckout(h.db, gateway, { user: other, slug: FLAGSHIP_PROGRAM.slug, billing: { name: "Buyer Three", stateCode: "27" } });
    if (!paid.ok || paid.value.kind !== "razorpay") throw new Error("expected razorpay checkout");
    const [order] = await h.db.select().from(orders).where(eq(orders.id, paid.value.orderId));
    expect(order).toMatchObject({ igstPaise: 76256, cgstPaise: 0, sgstPaise: 0 });
  });

  it("handles webhooks and refunds, removing access", async () => {
    const learner = await newLearner("buyer4@example.test");
    const res = await startCheckout(h.db, gateway, { user: learner, slug: FLAGSHIP_PROGRAM.slug, billing: { name: "Buyer Four", stateCode: "36" } });
    if (!res.ok || res.value.kind !== "razorpay") throw new Error("expected razorpay checkout");

    expect(await applyRazorpayWebhook(h.db, { event: "payment.captured", payload: { payment: { entity: { id: "pay_4", order_id: res.value.razorpayOrderId, method: "card" } } } })).toBe("paid");
    expect(await canAccessProgram(h.db, learner, FLAGSHIP_PROGRAM.slug)).toBe(true);
    const [paid] = await h.db.select().from(orders).where(eq(orders.id, res.value.orderId));
    expect(paid.invoiceNumber).toMatch(/\/0000[2-9]$/);

    const refunded = await refundOrder(h.db, gateway, res.value.orderId);
    expect(refunded.ok && refunded.value.status).toBe("refunded");
    expect(refunds).toContain("pay_4");
    expect(await canAccessProgram(h.db, learner, FLAGSHIP_PROGRAM.slug)).toBe(false);
    expect((await refundOrder(h.db, gateway, res.value.orderId)).ok).toBe(false);

    expect(await applyRazorpayWebhook(h.db, { event: "payment.failed", payload: { payment: { entity: { order_id: "order_unknown" } } } })).toBe("failed");
    expect(await applyRazorpayWebhook(h.db, { event: "subscription.charged" })).toMatch(/^ignored/);
  });
});

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { razorpayGateway } from "@/lib/payment-gateway";
import { createCoupon, refundOrder, setCouponActive } from "@/lib/services/payments";

export interface PaymentFormState {
  error?: string;
  success?: string;
}

export async function refundOrderAction(_: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  await requirePermission("admin:content");
  const orderId = z.string().uuid().safeParse(formData.get("orderId"));
  if (!orderId.success) return { error: "Unknown order." };
  const res = await refundOrder(await getDb(), razorpayGateway(), orderId.data);
  if (!res.ok) return { error: res.error };
  revalidatePath("/admin/orders");
  return { success: "Refunded. The learner's access to the course has been removed." };
}

export async function createCouponAction(_: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  await requirePermission("admin:content");
  const opt = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v === "" ? null : v;
  };
  const res = await createCoupon(await getDb(), {
    code: String(formData.get("code") ?? ""),
    kind: String(formData.get("kind") ?? "percent") as "percent",
    value: Number(formData.get("value") ?? 0),
    programId: opt("programId"),
    maxRedemptions: opt("maxRedemptions") as never,
    // End of the chosen day in India.
    validUntil: opt("validUntil") ? (new Date(`${opt("validUntil")}T23:59:59+05:30`) as never) : null,
  });
  if (!res.ok) return { error: res.error };
  revalidatePath("/admin/coupons");
  return { success: `Coupon ${res.value.code} created.` };
}

export async function toggleCouponAction(formData: FormData) {
  await requirePermission("admin:content");
  const id = z.string().uuid().parse(formData.get("couponId"));
  await setCouponActive(await getDb(), id, formData.get("active") === "true");
  revalidatePath("/admin/coupons");
}

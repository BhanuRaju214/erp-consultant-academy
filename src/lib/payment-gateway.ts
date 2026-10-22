import "server-only";
import { createRazorpayOrder, razorpayEnabled, razorpayKeyId, refundRazorpayPayment } from "./razorpay";
import type { PaymentGateway } from "./services/payments";

/** The live Razorpay gateway, or null when RAZORPAY_* keys are not configured. */
export function razorpayGateway(): PaymentGateway | null {
  if (!razorpayEnabled()) return null;
  return {
    keyId: razorpayKeyId(),
    createOrder: (input) => createRazorpayOrder(input),
    refund: (paymentId, amountPaise) => refundRazorpayPayment(paymentId, amountPaise),
  };
}

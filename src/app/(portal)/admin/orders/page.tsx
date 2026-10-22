import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatRupees, sellerDetails } from "@/lib/gst";
import { razorpayEnabled } from "@/lib/razorpay";
import { listOrdersForAdmin } from "@/lib/services/payments";
import { RefundButton } from "@/components/payment-admin-forms";
import { Badge, Callout, Card, EmptyState, PageHeader, Stat } from "@/components/ui";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const STATUS = {
  paid: { tone: "success", label: "Paid" },
  refunded: { tone: "warning", label: "Refunded" },
  failed: { tone: "danger", label: "Failed" },
  created: { tone: "neutral", label: "Pending" },
} as const;

export default async function AdminOrdersPage() {
  await requirePermission("admin:content");
  const rows = await listOrdersForAdmin(await getDb());
  const paid = rows.filter((r) => r.order.status === "paid");
  const revenue = paid.reduce((n, r) => n + r.order.amountPaise, 0);
  const gst = paid.reduce((n, r) => n + r.order.cgstPaise + r.order.sgstPaise + r.order.igstPaise, 0);
  const seller = sellerDetails();

  return (
    <div className="space-y-6">
      <PageHeader compact title="Orders" description="Every checkout, its payment status and GST invoice. Refunds remove the learner's access." />
      {!razorpayEnabled() && <Callout tone="warning" title="Razorpay not connected">Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to take payments.</Callout>}
      {(!seller.gstin || !seller.legalName || !seller.stateCode) && (
        <Callout tone="warning" title="Invoice details missing">Set GST_LEGAL_NAME, GST_GSTIN, GST_ADDRESS and GST_STATE_CODE so invoices show your business details.</Callout>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Paid orders" value={paid.length} />
        <Stat label="Revenue (incl. GST)" value={formatRupees(revenue)} />
        <Stat label="GST collected" value={formatRupees(gst)} />
        <Stat label="Refunded" value={rows.filter((r) => r.order.status === "refunded").length} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No orders yet">Orders appear here as soon as learners start a checkout.</EmptyState>
      ) : (
        <Card className="overflow-hidden p-0!">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-3 py-3">Learner</th>
                  <th className="px-3 py-3">Course</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Invoice</th>
                  <th className="px-6 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ order, programTitle, userName, userEmail, couponCode }) => (
                  <tr key={order.id} className="align-top hover:bg-surface-2/50">
                    <td className="whitespace-nowrap px-6 py-3 text-xs text-muted">
                      {order.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-fg">{userName}</div>
                      <div className="text-xs text-muted">{userEmail}</div>
                    </td>
                    <td className="px-3 py-3 text-fg">{programTitle}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="font-semibold text-fg">{formatRupees(order.amountPaise)}</div>
                      {couponCode && <div className="text-xs text-success">{couponCode}</div>}
                      {order.paymentMethod && <div className="text-xs capitalize text-muted">{order.paymentMethod}</div>}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS[order.status].tone}>{STATUS[order.status].label}</Badge>
                      {order.failureReason && <div className="mt-1 max-w-48 text-xs text-muted">{order.failureReason}</div>}
                    </td>
                    <td className="px-3 py-3">
                      {order.invoiceNumber ? (
                        <Link href={`/orders/${order.id}/invoice`} className="whitespace-nowrap text-sm font-semibold text-primary hover:underline">
                          {order.invoiceNumber}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">{order.status === "paid" && <RefundButton orderId={order.id} amount={formatRupees(order.amountPaise)} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

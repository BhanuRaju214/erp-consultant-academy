import Link from "next/link";
import { FileText, Receipt } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatRupees } from "@/lib/gst";
import { listOrdersForUser } from "@/lib/services/payments";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "My orders" };
export const dynamic = "force-dynamic";

const STATUS = {
  paid: { tone: "success", label: "Paid" },
  refunded: { tone: "warning", label: "Refunded" },
  failed: { tone: "danger", label: "Failed" },
  created: { tone: "neutral", label: "Pending" },
} as const;

export default async function OrdersPage() {
  const user = await requireUser();
  const rows = await listOrdersForUser(await getDb(), user.id);
  return (
    <div className="space-y-6">
      <PageHeader title="My orders" description="Your purchases, payment status and GST invoices." />
      {rows.length === 0 ? (
        <EmptyState title="No orders yet">
          <p>Courses you buy will appear here with their invoices.</p>
        </EmptyState>
      ) : (
        <Card className="overflow-hidden p-0!">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ order, programTitle, programSlug }) => (
                  <tr key={order.id}>
                    <td className="px-6 py-3">
                      <Link href={`/catalog/${programSlug}`} className="font-semibold text-fg hover:text-primary">
                        {programTitle}
                      </Link>
                      {order.invoiceNumber && <div className="text-xs text-muted">{order.invoiceNumber}</div>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted">{(order.paidAt ?? order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-3 py-3 font-semibold text-fg">{formatRupees(order.amountPaise)}</td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS[order.status].tone}>{STATUS[order.status].label}</Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {order.invoiceNumber ? (
                        <Link href={`/orders/${order.id}/invoice`} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
                          <FileText className="h-4 w-4" aria-hidden /> View
                        </Link>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <p className="flex items-center gap-2 text-xs text-muted">
        <Receipt className="h-4 w-4" aria-hidden /> Questions about a payment? Email info@nexsademy.com with your invoice number.
      </p>
    </div>
  );
}

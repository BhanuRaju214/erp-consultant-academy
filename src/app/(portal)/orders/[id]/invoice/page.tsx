import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { GST_RATE_PERCENT, formatRupees, sellerDetails, stateName } from "@/lib/gst";
import { getOrder } from "@/lib/services/payments";
import { PrintButton } from "@/components/print-button";

export const metadata = { title: "Invoice" };
export const dynamic = "force-dynamic";

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

/** Indian-system number to words (crore, lakh, thousand, hundred). */
function words(n: number): string {
  if (n === 0) return "Zero";
  const two = (x: number) => (x < 20 ? ONES[x] : `${TENS[Math.floor(x / 10)]}${x % 10 ? ` ${ONES[x % 10]}` : ""}`);
  const three = (x: number) => (x >= 100 ? `${ONES[Math.floor(x / 100)]} Hundred${x % 100 ? ` ${two(x % 100)}` : ""}` : two(x));
  const parts: string[] = [];
  const crore = Math.floor(n / 10_000_000);
  const lakh = Math.floor((n % 10_000_000) / 100_000);
  const thousand = Math.floor((n % 100_000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(`${three(crore)} Crore`);
  if (lakh) parts.push(`${two(lakh)} Lakh`);
  if (thousand) parts.push(`${two(thousand)} Thousand`);
  if (rest) parts.push(three(rest));
  return parts.join(" ");
}

function amountInWords(paise: number) {
  const rupees = Math.floor(paise / 100);
  const p = paise % 100;
  return `Rupees ${words(rupees)}${p ? ` and ${words(p)} Paise` : ""} Only`;
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const row = await getOrder(await getDb(), (await params).id);
  // Learners see their own invoices; admins can see all.
  if (!row || (row.order.userId !== user.id && !can(user.role, "admin:content")) || !row.order.invoiceNumber) notFound();
  const { order, programTitle, couponCode } = row;
  const seller = sellerDetails();
  const intra = order.cgstPaise > 0 || order.sgstPaise > 0;
  const date = (order.paidAt ?? order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between no-print">
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden /> My orders
        </Link>
        <PrintButton label="Print / save as PDF" />
      </div>

      <article className="rounded-lg border border-border bg-white p-8 text-[0.8125rem] text-[#0e1726] shadow-sm print:border-0 print:p-0 print:shadow-none">
        {order.status === "refunded" && <div className="mb-4 rounded border border-[#c81e1e] px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-[#c81e1e]">Refunded</div>}
        <header className="flex flex-col justify-between gap-6 border-b border-[#e1e6ee] pb-6 sm:flex-row">
          <div>
            <div className="text-xl font-extrabold tracking-[-0.02em]">{seller.legalName || "Nexsademy"}</div>
            {seller.address && <p className="mt-1 max-w-xs whitespace-pre-line text-[#5b6575]">{seller.address}</p>}
            {seller.gstin && <p className="mt-1">GSTIN: {seller.gstin}</p>}
            {seller.stateCode && (
              <p className="text-[#5b6575]">
                State: {stateName(seller.stateCode)} ({seller.stateCode})
              </p>
            )}
          </div>
          <div className="sm:text-right">
            <h1 className="text-lg font-extrabold uppercase tracking-wider">Tax invoice</h1>
            <dl className="mt-2 space-y-0.5">
              <div>
                <dt className="inline text-[#5b6575]">Invoice no: </dt>
                <dd className="inline font-semibold">{order.invoiceNumber}</dd>
              </div>
              <div>
                <dt className="inline text-[#5b6575]">Date: </dt>
                <dd className="inline">{date}</dd>
              </div>
              {order.razorpayPaymentId && (
                <div>
                  <dt className="inline text-[#5b6575]">Payment ref: </dt>
                  <dd className="inline">{order.razorpayPaymentId}</dd>
                </div>
              )}
            </dl>
          </div>
        </header>

        <section className="grid gap-6 border-b border-[#e1e6ee] py-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5b6575]">Billed to</h2>
            <p className="mt-1 font-semibold">{order.billingName}</p>
            <p>{order.billingEmail}</p>
            {order.billingGstin && <p>GSTIN: {order.billingGstin}</p>}
          </div>
          <div className="sm:text-right">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5b6575]">Place of supply</h2>
            <p className="mt-1">
              {stateName(order.billingStateCode)} ({order.billingStateCode})
            </p>
          </div>
        </section>

        <table className="mt-6 w-full">
          <thead className="border-b border-[#e1e6ee] text-left text-xs font-bold uppercase tracking-wider text-[#5b6575]">
            <tr>
              <th className="py-2">Description</th>
              <th className="py-2">SAC</th>
              <th className="py-2 text-right">Taxable value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#e1e6ee]">
              <td className="py-3">
                <div className="font-semibold">{programTitle}</div>
                <div className="text-[#5b6575]">Online course access</div>
              </td>
              <td className="py-3">{seller.sac}</td>
              <td className="py-3 text-right">{formatRupees(order.taxablePaise)}</td>
            </tr>
          </tbody>
        </table>

        <dl className="ml-auto mt-4 max-w-xs space-y-1.5">
          {order.discountPaise > 0 && (
            <div className="flex justify-between text-[#5b6575]">
              <dt>
                List price {formatRupees(order.listPricePaise)} less coupon{couponCode ? ` ${couponCode}` : ""}
              </dt>
              <dd>−{formatRupees(order.discountPaise)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Taxable value</dt>
            <dd>{formatRupees(order.taxablePaise)}</dd>
          </div>
          {intra ? (
            <>
              <div className="flex justify-between">
                <dt>CGST @ {GST_RATE_PERCENT / 2}%</dt>
                <dd>{formatRupees(order.cgstPaise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>SGST @ {GST_RATE_PERCENT / 2}%</dt>
                <dd>{formatRupees(order.sgstPaise)}</dd>
              </div>
            </>
          ) : (
            <div className="flex justify-between">
              <dt>IGST @ {GST_RATE_PERCENT}%</dt>
              <dd>{formatRupees(order.igstPaise)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-[#0e1726] pt-2 text-base font-extrabold">
            <dt>Total</dt>
            <dd>{formatRupees(order.amountPaise)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-right text-[#5b6575]">{amountInWords(order.amountPaise)}</p>

        <footer className="mt-10 border-t border-[#e1e6ee] pt-4 text-xs text-[#5b6575]">
          This is a computer-generated invoice and does not require a signature.
          {order.paymentMethod && ` Paid via ${order.paymentMethod === "coupon" ? "coupon" : `Razorpay (${order.paymentMethod})`}.`}
        </footer>
      </article>
    </div>
  );
}

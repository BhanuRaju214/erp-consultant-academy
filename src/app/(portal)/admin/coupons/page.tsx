import { asc } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { programs } from "@/lib/db/schema";
import { formatRupees } from "@/lib/gst";
import { listCoupons } from "@/lib/services/payments";
import { toggleCouponAction } from "@/app/actions/payments";
import { CouponForm } from "@/components/payment-admin-forms";
import { Badge, Card, CardTitle, EmptyState, PageHeader, buttonClass } from "@/components/ui";

export const metadata = { title: "Coupons" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requirePermission("admin:content");
  const db = await getDb();
  const [rows, allPrograms] = await Promise.all([listCoupons(db), db.select({ id: programs.id, title: programs.title }).from(programs).orderBy(asc(programs.title))]);
  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader compact title="Coupons" description="Discount codes learners enter at checkout. A 100% coupon enrols the learner without payment." />
      <Card>
        <CardTitle>New coupon</CardTitle>
        <div className="mt-4">
          <CouponForm programs={allPrograms} />
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="No coupons yet" />
      ) : (
        <Card className="overflow-hidden p-0!">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-3 py-3">Discount</th>
                  <th className="px-3 py-3">Applies to</th>
                  <th className="px-3 py-3">Used</th>
                  <th className="px-3 py-3">Valid until</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-6 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map(({ coupon, programTitle, redemptions }) => {
                  const expired = coupon.validUntil !== null && coupon.validUntil < now;
                  const usedUp = coupon.maxRedemptions !== null && redemptions >= coupon.maxRedemptions;
                  return (
                    <tr key={coupon.id} className="hover:bg-surface-2/50">
                      <td className="px-6 py-3 font-mono font-bold text-fg">{coupon.code}</td>
                      <td className="px-3 py-3 text-fg">{coupon.kind === "percent" ? `${coupon.value}% off` : `${formatRupees(coupon.value)} off`}</td>
                      <td className="px-3 py-3 text-muted">{programTitle ?? "All courses"}</td>
                      <td className="px-3 py-3 text-fg">
                        {redemptions}
                        {coupon.maxRedemptions !== null && <span className="text-muted"> / {coupon.maxRedemptions}</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted">
                        {coupon.validUntil ? coupon.validUntil.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No expiry"}
                      </td>
                      <td className="px-3 py-3">
                        {!coupon.active ? <Badge>Disabled</Badge> : expired ? <Badge tone="warning">Expired</Badge> : usedUp ? <Badge tone="warning">Used up</Badge> : <Badge tone="success">Active</Badge>}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <form action={toggleCouponAction}>
                          <input type="hidden" name="couponId" value={coupon.id} />
                          <input type="hidden" name="active" value={String(!coupon.active)} />
                          <button className={buttonClass("ghost", "px-3 py-1.5 text-xs")}>{coupon.active ? "Disable" : "Enable"}</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

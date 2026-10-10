import Link from "next/link";
import { asc } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { businessProcesses } from "@/lib/db/schema";
import type { BusinessProcessContent } from "@/content/types";
import { Badge, Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Business Process Academy" };

const OTHER_PROCESSES = [
  "CRM & lead management",
  "HR & employee administration",
  "Recruitment & onboarding",
  "Expenses & reimbursements",
  "Timesheets & field service",
  "Helpdesk & customer support",
  "Website, eCommerce & Point of Sale",
  "Maintenance & quality",
  "Subcontracting & outsourced operations",
  "Approvals & document management",
];

export default async function ProcessesPage() {
  await requireUser();
  const db = await getDb();
  const rows = await db.select().from(businessProcesses).orderBy(asc(businessProcesses.position));
  return (
    <div className="space-y-8">
      <PageHeader
        title="Business Process Academy"
        description="Learn how a business operates before learning the screens. Every process covers objective, departments, stakeholders, workflow, documents, master and transaction data, approvals, accounting and inventory impact, risks, KPIs, reports and how Odoo handles it."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => {
          const data = p.data as Omit<BusinessProcessContent, "quiz">;
          return (
            <Card key={p.id} as="article" className="flex flex-col">
              <div className="flex items-center gap-2">
                <Badge tone="primary">{p.shortName}</Badge>
                <Badge>{p.category}</Badge>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-fg">
                <Link href={`/processes/${p.slug}`} className="hover:text-primary">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-1 flex-1 text-sm text-muted">{p.summary}</p>
              <p className="mt-4 text-xs text-muted">
                {data.steps.map((s) => s.title).join(" → ")}
              </p>
            </Card>
          );
        })}
      </div>
      <Card>
        <h2 className="font-semibold text-fg">More processes on the roadmap</h2>
        <p className="mt-1 text-sm text-muted">
          These process walkthroughs follow the same template and are scheduled for the next content release. Admins can add them through the content
          files or the admin console.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {OTHER_PROCESSES.map((p) => (
            <Badge key={p}>{p}</Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}

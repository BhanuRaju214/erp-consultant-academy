import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assessments, businessProcesses } from "@/lib/db/schema";
import { bestAttempt } from "@/lib/services/learning";
import type { BusinessProcessContent } from "@/content/types";
import { Markdown } from "@/components/markdown";
import { ProcessFlow } from "@/components/process-flow";
import { Badge, ButtonLink, Card, CardTitle, PageHeader } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

export default async function ProcessPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireCourseUser();
  const { slug } = await params;
  const user = await requireUser();
  const db = await getDb();
  const row = await db.query.businessProcesses.findFirst({ where: eq(businessProcesses.slug, slug) });
  if (!row) notFound();
  const p = row.data as Omit<BusinessProcessContent, "quiz">;
  const quiz = await db.query.assessments.findFirst({ where: eq(assessments.processId, row.id) });
  const best = quiz ? await bestAttempt(db, user.id, quiz.id) : null;

  const List = ({ items }: { items: string[] }) => (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<Link href="/processes">Business Process Academy</Link>}
        title={p.title}
        description={p.summary}
        actions={
          quiz && (
            <ButtonLink href={`/assessments/${quiz.slug}`} variant="secondary">
              {best ? `Retake quiz (best ${best.score}%)` : "Take process quiz"}
            </ButtonLink>
          )
        }
      />
      <div className="flex flex-wrap gap-2">
        <Badge tone="primary">{p.shortName}</Badge>
        <Badge tone="info">{p.odooVersion}</Badge>
        {p.departments.map((d) => (
          <Badge key={d}>{d}</Badge>
        ))}
      </div>

      <Card>
        <CardTitle>Business objective</CardTitle>
        <p className="mt-2 text-sm leading-relaxed text-fg">{p.objective}</p>
      </Card>

      <Card>
        <CardTitle>Interactive workflow</CardTitle>
        <p className="mb-4 mt-1 text-sm text-muted">Select a step to see who performs it, which document it produces, how Odoo handles it and its accounting/inventory impact.</p>
        <ProcessFlow steps={p.steps} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Stakeholders & responsibilities</CardTitle>
          <table className="mt-3 w-full text-sm">
            <tbody className="divide-y divide-border">
              {p.stakeholders.map((s) => (
                <tr key={s.role}>
                  <td className="py-2 pr-3 align-top font-medium text-fg">{s.role}</td>
                  <td className="py-2 text-muted">{s.responsibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <CardTitle>Business documents</CardTitle>
              <List items={p.documents} />
            </div>
            <div>
              <CardTitle>Approvals</CardTitle>
              <List items={p.approvals} />
            </div>
            <div>
              <CardTitle>Master data</CardTitle>
              <List items={p.masterData} />
            </div>
            <div>
              <CardTitle>Transaction data</CardTitle>
              <List items={p.transactionData} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Accounting impact</CardTitle>
          <Markdown className="mt-2 text-sm">{p.accountingImpact}</Markdown>
        </Card>
        <Card>
          <CardTitle>Inventory impact</CardTitle>
          <Markdown className="mt-2 text-sm">{p.inventoryImpact}</Markdown>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Exceptions & business risks</CardTitle>
          <ul className="mt-3 space-y-3 text-sm">
            {p.exceptions.map((e) => (
              <li key={e.title}>
                <div className="font-medium text-fg">{e.title}</div>
                <div className="text-muted">Mitigation: {e.mitigation}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>KPIs</CardTitle>
          <table className="mt-3 w-full text-sm">
            <tbody className="divide-y divide-border">
              {p.kpis.map((k) => (
                <tr key={k.name}>
                  <td className="py-2 pr-3 align-top font-medium text-fg">{k.name}</td>
                  <td className="py-2 font-mono text-xs text-muted">{k.formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <CardTitle className="text-sm">Reports</CardTitle>
            <List items={p.reports} />
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle>How Odoo handles this process</CardTitle>
        <Markdown className="mt-2">{p.odooHandling}</Markdown>
      </Card>

      <Card>
        <CardTitle>Real business scenario — {p.example.company}</CardTitle>
        <Markdown className="mt-2">{p.example.narrative}</Markdown>
      </Card>
    </div>
  );
}

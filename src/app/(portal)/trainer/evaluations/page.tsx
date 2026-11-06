import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDuration } from "@/lib/evaluation/rubric";
import { listEvaluations } from "@/lib/services/evaluation";
import { Badge, Card, CardTitle, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Final Evaluations" };

const STATUS = {
  recording: { label: "Recording", tone: "neutral" },
  questions: { label: "Answering questions", tone: "neutral" },
  awaiting_trainer: { label: "Awaiting review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  needs_revision: { label: "Sent back", tone: "danger" },
} as const;

export default async function TrainerEvaluationsPage() {
  await requirePermission("trainer:review");
  const db = await getDb();
  const [pending, done] = await Promise.all([listEvaluations(db, ["awaiting_trainer"]), listEvaluations(db, ["approved", "needs_revision", "recording", "questions"])]);

  const table = (rows: typeof pending) => (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-muted">
            <th className="py-2 pr-3 font-medium">Trainee</th>
            <th className="py-2 pr-3 font-medium">Status</th>
            <th className="py-2 pr-3 font-medium">Length</th>
            <th className="py-2 pr-3 font-medium">AI score</th>
            <th className="py-2 pr-3 font-medium">Submitted</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="py-2.5 pr-3 font-medium text-fg">{r.student}</td>
              <td className="py-2.5 pr-3"><Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge></td>
              <td className="py-2.5 pr-3 text-muted">{r.durationSec ? formatDuration(r.durationSec) : "—"}</td>
              <td className="py-2.5 pr-3 text-muted">{r.aiScore ?? "—"}</td>
              <td className="py-2.5 pr-3 text-muted">{r.submittedAt?.toLocaleDateString() ?? "—"}</td>
              <td className="py-2.5 text-right">
                <Link href={`/trainer/evaluations/${r.id}`} className="font-medium text-primary hover:underline">{r.status === "awaiting_trainer" ? "Review" : "Open"}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin & Trainer Management"
        title="Final evaluations"
        description="Watch each trainee's project presentation, read the AI examiner's report and confirm the result. Approval issues the final program certificate."
      />
      <Card>
        <CardTitle>Awaiting your review</CardTitle>
        {pending.length ? table(pending) : <div className="mt-3"><EmptyState title="Nothing to review">Submitted evaluations appear here.</EmptyState></div>}
      </Card>
      <Card>
        <CardTitle>All other attempts</CardTitle>
        {done.length ? table(done) : <p className="mt-3 text-sm text-muted">No other attempts yet.</p>}
      </Card>
    </div>
  );
}

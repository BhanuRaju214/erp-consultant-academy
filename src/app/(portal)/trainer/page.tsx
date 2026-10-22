import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { Paperclip } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assignments, discussions, submissions, users } from "@/lib/db/schema";
import { getTrainerOverview } from "@/lib/services/dashboard";
import { ReviewForm } from "@/components/assignment-forms";
import { SimpleBarChart } from "@/components/charts";
import { Badge, Card, CardTitle, EmptyState, PageHeader, ProgressBar, Stat } from "@/components/ui";

export const metadata = { title: "Trainer Dashboard" };

export default async function TrainerPage() {
  const user = await requirePermission("trainer:dashboard");
  const db = await getDb();
  const o = await getTrainerOverview(db);
  const pending = await db
    .select({
      id: submissions.id,
      body: submissions.body,
      fileName: submissions.fileName,
      createdAt: submissions.createdAt,
      student: users.name,
      studentId: users.id,
      assignment: assignments.title,
      assignmentSlug: assignments.slug,
    })
    .from(submissions)
    .innerJoin(users, eq(users.id, submissions.userId))
    .innerJoin(assignments, eq(assignments.id, submissions.assignmentId))
    .where(eq(submissions.status, "submitted"))
    .orderBy(submissions.createdAt)
    .limit(20);
  const openQuestions = await db
    .select({ id: discussions.id, title: discussions.title, createdAt: discussions.createdAt, author: users.name })
    .from(discussions)
    .innerJoin(users, eq(users.id, discussions.userId))
    .where(and(isNull(discussions.parentId), eq(discussions.resolved, false)))
    .orderBy(desc(discussions.createdAt))
    .limit(8);

  const active7d = o.students.filter((s) => s.lastLoginAt && Date.now() - s.lastLoginAt.getTime() < 7 * 86_400_000).length;
  const order = ["0–49", "50–69", "70–84", "85–100"];
  const dist = order.map((b) => ({ bucket: b, attempts: o.scoreDistribution.find((d) => d.bucket === b)?.count ?? 0 }));

  return (
    <div className="space-y-6">
      <PageHeader compact title="Overview" description="Learner progress, submissions to review, open questions and feedback." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Learners" value={o.students.length} />
        <Stat label="Active last 7 days" value={active7d} />
        <Stat label="Submissions to review" value={pending.length} />
        <Stat label="Open questions" value={openQuestions.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Assessment score distribution</CardTitle>
          <SimpleBarChart data={dist} xKey="bucket" yKey="attempts" label="Number of assessment attempts per score band" empty="No assessment attempts yet." />
        </Card>
        <Card>
          <CardTitle>Active learners per module</CardTitle>
          {/* A labelled bar list reads better than a chart for long module names. */}
          <ul className="mt-4 space-y-2.5" aria-label="Learners who started each module">
            {o.courseCompletion.map((c) => {
              const max = Math.max(1, ...o.courseCompletion.map((x) => x.started));
              return (
                <li key={c.title} className="grid grid-cols-[minmax(0,1fr)_7rem_1.5rem] items-center gap-3 text-sm">
                  <span className="truncate text-fg" title={c.title}>
                    {c.title}
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(c.started / max) * 100}%` }} />
                  </span>
                  <span className="text-right text-xs font-semibold text-muted">{c.started}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card>
        <CardTitle>Learners</CardTitle>
        {o.students.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted">
                  <th className="py-2 pr-3 font-medium">Trainee</th>
                  <th className="py-2 pr-3 font-medium">Path</th>
                  <th className="py-2 pr-3 font-medium">Lessons</th>
                  <th className="py-2 pr-3 font-medium">Avg best score</th>
                  <th className="py-2 pr-3 font-medium">Lab steps</th>
                  <th className="py-2 pr-3 font-medium">Certificates</th>
                  <th className="py-2 font-medium">Last login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {o.students.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 pr-3">
                      <Link href={`/trainer/students/${s.id}`} className="font-medium text-fg hover:text-primary">
                        {s.name}
                      </Link>
                      <div className="text-xs text-muted">{s.email}</div>
                    </td>
                    <td className="py-2 pr-3 text-muted">{s.pathTitle ?? "—"}</td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={o.totalLessons ? (s.lessonsDone / o.totalLessons) * 100 : 0} className="w-24" label={`${s.name} lesson progress`} />
                        <span className="text-xs text-muted">{s.lessonsDone}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3">{s.avgScore === null ? <span className="text-muted">—</span> : <Badge tone={s.avgScore >= 70 ? "success" : "warning"}>{s.avgScore}%</Badge>}</td>
                    <td className="py-2 pr-3 text-muted">{s.stepsDone}</td>
                    <td className="py-2 pr-3 text-muted">{s.certCount}</td>
                    <td className="py-2 text-xs text-muted">{s.lastLoginAt?.toLocaleDateString() ?? "never"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-3">
            <EmptyState title="No trainees yet">Trainees appear here after they register.</EmptyState>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card id="review" className="lg:col-span-2">
          <CardTitle>Submissions awaiting review</CardTitle>
          {pending.length ? (
            <ul className="mt-3 divide-y divide-border">
              {pending.map((s) => (
                <li key={s.id} className="py-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Link href={`/trainer/students/${s.studentId}`} className="font-medium text-fg hover:text-primary">
                      {s.student}
                    </Link>
                    <span className="text-muted">·</span>
                    <Link href={`/assignments/${s.assignmentSlug}`} className="text-muted hover:text-primary">
                      {s.assignment}
                    </Link>
                    <span className="text-xs text-muted">{s.createdAt.toLocaleString()}</span>
                    {s.fileName && (
                      <a href={`/api/submissions/${s.id}/file`} className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Paperclip className="h-3.5 w-3.5" /> {s.fileName}
                      </a>
                    )}
                  </div>
                  {s.body && <p className="mt-2 line-clamp-6 whitespace-pre-line text-sm text-fg">{s.body}</p>}
                  <ReviewForm submissionId={s.id} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <EmptyState title="Inbox zero">No submissions waiting for review.</EmptyState>
            </div>
          )}
        </Card>
        <Card>
          <CardTitle>Open questions</CardTitle>
          {openQuestions.length ? (
            <ul className="mt-3 space-y-3 text-sm">
              {openQuestions.map((q) => (
                <li key={q.id}>
                  <Link href={`/discussions#${q.id}`} className="font-medium text-fg hover:text-primary">
                    {q.title}
                  </Link>
                  <div className="text-xs text-muted">
                    {q.author} · {q.createdAt.toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No open questions.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

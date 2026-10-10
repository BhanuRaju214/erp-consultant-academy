import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assignments, submissions, users } from "@/lib/db/schema";
import { getStudentDashboard } from "@/lib/services/dashboard";
import { FeedbackForm } from "@/components/assignment-forms";
import { Badge, Card, CardTitle, PageHeader, ProgressBar, Stat } from "@/components/ui";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("trainer:dashboard");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await getDb();
  const student = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!student) notFound();
  const d = await getStudentDashboard(db, id);
  const subs = await db
    .select({ id: submissions.id, status: submissions.status, grade: submissions.grade, createdAt: submissions.createdAt, title: assignments.title, slug: assignments.slug, fileName: submissions.fileName })
    .from(submissions)
    .innerJoin(assignments, eq(assignments.id, submissions.assignmentId))
    .where(eq(submissions.userId, id))
    .orderBy(desc(submissions.createdAt));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={<Link href="/trainer">Trainer dashboard</Link>} title={student.name} description={`${student.email} · ${d.path?.title ?? "no learning path"} · joined ${student.createdAt.toLocaleDateString()}`} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Lessons" value={`${d.totals.done}/${d.totals.lessons}`} />
        <Stat label="Assessments" value={d.scores.length} />
        <Stat label="Lab steps" value={d.exerciseStepsDone} />
        <Stat label="Certificates" value={d.certificates.length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Course progress</CardTitle>
          <ul className="mt-3 space-y-3">
            {d.allCourses
              .filter((c) => c.completedLessons > 0)
              .map((c) => (
                <li key={c.id}>
                  <div className="flex justify-between text-sm">
                    <span className="text-fg">{c.title}</span>
                    <span className="text-muted">
                      {c.completedLessons}/{c.totalLessons}
                    </span>
                  </div>
                  <ProgressBar value={(c.completedLessons / c.totalLessons) * 100} className="mt-1" label={`${c.title} progress`} />
                </li>
              ))}
            {!d.allCourses.some((c) => c.completedLessons > 0) && <p className="text-sm text-muted">No lessons completed yet.</p>}
          </ul>
        </Card>
        <Card>
          <CardTitle>Assessment results (best)</CardTitle>
          <ul className="mt-3 divide-y divide-border text-sm">
            {d.scores.map((s) => (
              <li key={s.assessmentId} className="flex justify-between py-2">
                <span className="text-fg">{s.title}</span>
                <span className="flex items-center gap-2 text-xs text-muted">
                  {s.attempts} attempt(s) <Badge tone={s.best >= s.passMark ? "success" : "danger"}>{s.best}%</Badge>
                </span>
              </li>
            ))}
            {!d.scores.length && <li className="py-2 text-muted">No attempts yet.</li>}
          </ul>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Submissions</CardTitle>
          <ul className="mt-3 divide-y divide-border text-sm">
            {subs.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <Link href={`/assignments/${s.slug}`} className="text-fg hover:text-primary">
                  {s.title}
                </Link>
                <span className="flex items-center gap-2">
                  {s.fileName && (
                    <a href={`/api/submissions/${s.id}/file`} className="text-xs text-primary hover:underline">
                      file
                    </a>
                  )}
                  <Badge tone={s.status === "accepted" ? "success" : s.status === "needs_revision" ? "warning" : "info"}>{s.status.replace("_", " ")}</Badge>
                  {s.grade !== null && <Badge tone="primary">{s.grade}</Badge>}
                </span>
              </li>
            ))}
            {!subs.length && <li className="py-2 text-muted">No submissions yet.</li>}
          </ul>
        </Card>
        <Card>
          <CardTitle>Give feedback</CardTitle>
          <div className="mt-3">
            <FeedbackForm studentId={student.id} />
          </div>
          {d.feedback.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {d.feedback.map((f, i) => (
                <li key={i} className="rounded-lg bg-surface-2 p-2">
                  <p className="text-fg">{f.body}</p>
                  <p className="text-xs text-muted">
                    {f.trainer} · {f.createdAt.toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

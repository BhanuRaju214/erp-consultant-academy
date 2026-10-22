import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { Paperclip } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assignments, courses, projects, submissions, trainerFeedback, users } from "@/lib/db/schema";
import { Markdown } from "@/components/markdown";
import { SubmissionForm } from "@/components/assignment-forms";
import { Badge, Card, CardTitle, PageHeader } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

const STATUS_TONE = { submitted: "info", needs_revision: "warning", accepted: "success" } as const;

export default async function AssignmentPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireCourseUser();
  const { slug } = await params;
  const user = await requireUser();
  const db = await getDb();
  const a = await db.query.assignments.findFirst({ where: eq(assignments.slug, slug) });
  if (!a) notFound();
  const course = a.courseId ? await db.query.courses.findFirst({ where: eq(courses.id, a.courseId) }) : null;
  const project = a.projectId ? await db.query.projects.findFirst({ where: eq(projects.id, a.projectId) }) : null;
  const mine = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.assignmentId, a.id), eq(submissions.userId, user.id)))
    .orderBy(desc(submissions.createdAt));
  const feedback = mine.length
    ? await db
        .select({ submissionId: trainerFeedback.submissionId, body: trainerFeedback.body, createdAt: trainerFeedback.createdAt, trainer: users.name })
        .from(trainerFeedback)
        .innerJoin(users, eq(users.id, trainerFeedback.trainerId))
        .where(eq(trainerFeedback.studentId, user.id))
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow={
          course ? <Link href={`/courses/${course.slug}`}>{course.title}</Link> : project ? <Link href={`/projects/${project.slug}`}>Project {project.code}</Link> : "Assignment"
        }
        title={a.title}
      />
      <Card>
        <Markdown>{a.instructions}</Markdown>
      </Card>
      <Card>
        <CardTitle>Submit your work</CardTitle>
        <div className="mt-3">
          <SubmissionForm assignmentId={a.id} />
        </div>
      </Card>
      {mine.length > 0 && (
        <Card>
          <CardTitle>My submissions</CardTitle>
          <ul className="mt-3 divide-y divide-border">
            {mine.map((s) => (
              <li key={s.id} className="py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted">{s.createdAt.toLocaleString()}</span>
                  <Badge tone={STATUS_TONE[s.status]}>{s.status.replace("_", " ")}</Badge>
                  {s.grade !== null && <Badge tone="primary">Grade {s.grade}</Badge>}
                  {s.fileName && (
                    <a href={`/api/submissions/${s.id}/file`} className="inline-flex items-center gap-1 text-primary hover:underline">
                      <Paperclip className="h-3.5 w-3.5" /> {s.fileName}
                    </a>
                  )}
                </div>
                {s.body && <p className="mt-2 line-clamp-4 whitespace-pre-line text-fg">{s.body}</p>}
                {feedback
                  .filter((f) => f.submissionId === s.id)
                  .map((f, i) => (
                    <div key={i} className="mt-2 rounded-lg bg-primary-soft p-3">
                      <div className="text-xs font-semibold text-primary">Feedback from {f.trainer}</div>
                      <p className="mt-1 whitespace-pre-line text-fg">{f.body}</p>
                    </div>
                  ))}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

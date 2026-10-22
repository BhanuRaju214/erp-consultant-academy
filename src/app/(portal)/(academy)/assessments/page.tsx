import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { Award } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assessmentAttempts, assessments, businessProcesses, certificates, courses, questions } from "@/lib/db/schema";
import { Badge, Card, CardTitle, EmptyState, PageHeader } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

export const metadata = { title: "Assessments & Certifications" };

export default async function AssessmentsPage() {
  await requireCourseUser();
  const user = await requireUser();
  const db = await getDb();
  const rows = await db
    .select({
      slug: assessments.slug,
      title: assessments.title,
      passMark: assessments.passMark,
      courseTitle: courses.title,
      processTitle: businessProcesses.title,
      questionCount: sql<number>`(select count(*) from ${questions} q where q.assessment_id = ${assessments.id})::int`,
      best: sql<number | null>`(select max(score) from ${assessmentAttempts} a where a.assessment_id = ${assessments.id} and a.user_id = ${user.id})::int`,
      attempts: sql<number>`(select count(*) from ${assessmentAttempts} a where a.assessment_id = ${assessments.id} and a.user_id = ${user.id})::int`,
    })
    .from(assessments)
    .leftJoin(courses, eq(courses.id, assessments.courseId))
    .leftJoin(businessProcesses, eq(businessProcesses.id, assessments.processId))
    .orderBy(asc(courses.section), asc(courses.position), asc(businessProcesses.position));
  const certs = await db
    .select({ serial: certificates.serial, title: courses.title, issuedAt: certificates.issuedAt, score: certificates.score })
    .from(certificates)
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .where(eq(certificates.userId, user.id));

  const courseAssessments = rows.filter((r) => r.courseTitle);
  const processQuizzes = rows.filter((r) => r.processTitle);

  const table = (items: typeof rows) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-muted">
            <th className="py-2 pr-3 font-medium">Assessment</th>
            <th className="py-2 pr-3 font-medium">Questions</th>
            <th className="py-2 pr-3 font-medium">Pass mark</th>
            <th className="py-2 pr-3 font-medium">Attempts</th>
            <th className="py-2 pr-3 font-medium">Best</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((r) => (
            <tr key={r.slug}>
              <td className="py-2.5 pr-3">
                <div className="font-medium text-fg">{r.title}</div>
                <div className="text-xs text-muted">{r.courseTitle ?? r.processTitle}</div>
              </td>
              <td className="py-2.5 pr-3 text-muted">{r.questionCount}</td>
              <td className="py-2.5 pr-3 text-muted">{r.passMark}%</td>
              <td className="py-2.5 pr-3 text-muted">{r.attempts}</td>
              <td className="py-2.5 pr-3">{r.best === null ? <span className="text-muted">—</span> : <Badge tone={r.best >= r.passMark ? "success" : "danger"}>{r.best}%</Badge>}</td>
              <td className="py-2.5 text-right">
                <Link href={`/assessments/${r.slug}`} className="font-medium text-primary hover:underline">
                  {r.attempts ? "Retake" : "Start"}
                </Link>
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
        title="Assessments & Certifications"
        description="Course certificates are issued automatically when you complete every lesson in a course and reach the course's minimum score on its final assessment."
      />
      <Card>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <CardTitle>My certificates</CardTitle>
        </div>
        {certs.length ? (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {certs.map((c) => (
              <li key={c.serial}>
                <Link href={`/certificates/${c.serial}`} className="block rounded-lg border border-border p-4 hover:border-primary">
                  <div className="font-medium text-fg">{c.title}</div>
                  <div className="mt-1 text-xs text-muted">
                    {c.serial} · {c.issuedAt.toLocaleDateString()} · {c.score}%
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <EmptyState title="No certificates yet">Finish a course and pass its final assessment to earn one.</EmptyState>
          </div>
        )}
      </Card>
      <Card>
        <CardTitle>Course final assessments</CardTitle>
        <div className="mt-3">{table(courseAssessments)}</div>
      </Card>
      <Card>
        <CardTitle>Business process quizzes</CardTitle>
        <div className="mt-3">{table(processQuizzes)}</div>
      </Card>
    </div>
  );
}

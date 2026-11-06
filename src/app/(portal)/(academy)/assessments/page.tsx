import Link from "next/link";
import { asc, eq, isNull, or, sql } from "drizzle-orm";
import { Award, GraduationCap, Video } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProgramCertificate } from "@/lib/services/evaluation";
import { assessmentAttempts, assessments, businessProcesses, certificates, courses, questions } from "@/lib/db/schema";
import { Badge, ButtonLink, Card, CardTitle, EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { getFlagshipCertificateStatus, maybeIssueFlagshipCertificate } from "@/lib/services/learning";
import { FLAGSHIP_PROGRAM } from "@/lib/services/programs";
import { learnerVisibleModule } from "@/lib/services/library";
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
    // Process quizzes have no module; module assessments only for published modules of non-draft courses.
    .where(or(isNull(assessments.courseId), learnerVisibleModule()))
    .orderBy(asc(courses.section), asc(courses.position), asc(businessProcesses.position));
  const certs = await db
    .select({ serial: certificates.serial, title: courses.title, issuedAt: certificates.issuedAt, score: certificates.score })
    .from(certificates)
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .where(eq(certificates.userId, user.id));
  // Learners who finished every module before the course certificate existed get it here.
  let program = await getFlagshipCertificateStatus(db, user.id);
  if (program?.eligible && !program.certificate) {
    await maybeIssueFlagshipCertificate(db, user.id);
    program = await getFlagshipCertificateStatus(db, user.id);
  }
  const pct = program?.modulesTotal ? Math.round((program.modulesCertified / program.modulesTotal) * 100) : 0;

  const finalCert = await getProgramCertificate(db, user.id);

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
        description="A module certificate is issued automatically when you complete every lesson in a module and pass its final assessment. Earn all of them to receive the course certificate."
      />
      {program && (
        <Card className={program.certificate ? "border-success/40" : undefined}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <GraduationCap className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden />
              <div>
                <CardTitle>Course certificate: {FLAGSHIP_PROGRAM.title}</CardTitle>
                <p className="mt-1 text-sm text-muted">
                  {program.certificate
                    ? `Awarded ${program.certificate.issuedAt.toLocaleDateString()} · overall score ${program.certificate.score}% · ${program.certificate.serial}`
                    : `${program.modulesCertified} of ${program.modulesTotal} module certificates earned. Earn every module certificate to receive it.`}
                </p>
              </div>
            </div>
            {program.certificate && (
              <ButtonLink href={`/certificates/${program.certificate.serial}`} className="shrink-0">
                View course certificate
              </ButtonLink>
            )}
          </div>
          {!program.certificate && (
            <div className="mt-4 space-y-3">
              <ProgressBar value={pct} label="Course certificate progress" />
              {program.remaining.length > 0 && (
                <p className="text-xs text-muted">
                  <span className="font-semibold text-fg">Still to certify:</span> {program.remaining.map((m) => m.title.split(":")[0]).join(" · ")}
                </p>
              )}
            </div>
          )}
        </Card>
      )}
      <Card>
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          <CardTitle>Final certification</CardTitle>
        </div>
        {finalCert ? (
          <p className="mt-2 text-sm">
            You are a certified ERP consultant.{" "}
            <Link href={`/certificates/final/${finalCert.serial}`} className="font-medium text-primary hover:underline">
              View your final certificate ({finalCert.serial})
            </Link>
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">
            The final program certificate is issued after you complete every course and real-time project, present your projects in a recorded talk of at least 10
            minutes with slides, answer the AI examiner&apos;s questions, and a trainer approves the result.{" "}
            <Link href="/evaluation" className="font-medium text-primary hover:underline">
              Go to the final evaluation
            </Link>
          </p>
        )}
      </Card>
      <Card>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <CardTitle>My module certificates</CardTitle>
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

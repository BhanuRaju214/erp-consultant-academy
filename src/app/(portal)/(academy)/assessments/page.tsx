import Link from "next/link";
import { asc, eq, isNull, or, sql } from "drizzle-orm";
import { Award, CircleCheck, GraduationCap, Video, type LucideIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getEligibility, getProgramCertificate } from "@/lib/services/evaluation";
import { CONSULTANT_TITLE } from "@/lib/services/certificates";
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

  // Step 3 of the path: the trainer-approved final evaluation (also backfills the course certificate).
  const [evaluation, consultant] = await Promise.all([getEligibility(db, user.id), getProgramCertificate(db, user.id)]);
  const projectsDone = evaluation.projects.filter((p) => p.complete).length;

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
        description="Earn a certificate for every module, then the course certificate, then become a certified consultant by passing the final evaluation."
      />
      {program && (
        <Card>
          <CardTitle>Your certification path</CardTitle>
          <p className="mt-1 text-sm text-muted">Three levels, each building on the one before.</p>
          <ol className="mt-4 grid gap-4 lg:grid-cols-3">
            <Step
              n={1}
              icon={Award}
              title="Module certificates"
              done={program.modulesTotal > 0 && program.modulesCertified === program.modulesTotal}
              status={`${program.modulesCertified} of ${program.modulesTotal} earned`}
              detail="Complete every lesson in a module and pass its final assessment."
            >
              {!program.certificate && program.remaining.length > 0 && (
                <p className="text-xs text-muted">
                  <span className="font-semibold text-fg">Still to certify:</span> {program.remaining.map((m) => m.title.split(":")[0]).join(" · ")}
                </p>
              )}
            </Step>
            <Step
              n={2}
              icon={GraduationCap}
              title="Course certificate"
              done={Boolean(program.certificate)}
              status={program.certificate ? `Awarded ${program.certificate.issuedAt.toLocaleDateString()} · ${program.certificate.score}%` : `${pct}% of the way there`}
              detail={`Issued automatically when you hold every module certificate of the ${FLAGSHIP_PROGRAM.title}.`}
            >
              {program.certificate ? (
                <ButtonLink href={`/certificates/${program.certificate.serial}`} variant="secondary" className="w-full">
                  View course certificate
                </ButtonLink>
              ) : (
                <ProgressBar value={pct} label="Course certificate progress" />
              )}
            </Step>
            <Step
              n={3}
              icon={Video}
              title={CONSULTANT_TITLE}
              done={Boolean(consultant)}
              status={
                consultant
                  ? `Awarded ${consultant.issuedAt.toLocaleDateString()} · ${consultant.score}%`
                  : evaluation.eligible
                    ? "Unlocked: ready for your final evaluation"
                    : `Locked · projects ${projectsDone} of ${evaluation.projects.length} complete`
              }
              detail="After the course certificate and every real-time project: present your projects in a recorded talk with slides, answer the AI examiner, and a trainer approves."
            >
              {consultant ? (
                <ButtonLink href={`/certificates/${consultant.serial}`} variant="secondary" className="w-full">
                  View consultant certificate
                </ButtonLink>
              ) : (
                <ButtonLink href="/evaluation" variant={evaluation.eligible ? "primary" : "secondary"} className="w-full">
                  {evaluation.eligible ? "Start the final evaluation" : "See what's required"}
                </ButtonLink>
              )}
            </Step>
          </ol>
        </Card>
      )}
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

/** One level of the certification path. */
function Step({
  n,
  icon: Icon,
  title,
  done,
  status,
  detail,
  children,
}: {
  n: number;
  icon: LucideIcon;
  title: string;
  done: boolean;
  status: string;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <li className={`flex flex-col gap-3 rounded-lg border p-4 ${done ? "border-success/40 bg-success-soft/40" : "border-border"}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${done ? "bg-success text-white" : "bg-surface-2 text-primary"}`}>
          {done ? <CircleCheck className="h-5 w-5" aria-hidden /> : <Icon className="h-5 w-5" aria-hidden />}
        </span>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">Step {n}</div>
          <div className="font-semibold text-fg">{title}</div>
          <div className={`text-sm ${done ? "font-medium text-success" : "text-muted"}`}>{status}</div>
        </div>
      </div>
      <p className="text-xs text-muted">{detail}</p>
      <div className="mt-auto">{children}</div>
    </li>
  );
}

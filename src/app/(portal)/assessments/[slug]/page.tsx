import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assessments, businessProcesses, courses, questions } from "@/lib/db/schema";
import { bestAttempt } from "@/lib/services/learning";
import { QuizRunner } from "@/components/quiz-runner";
import { Badge, PageHeader } from "@/components/ui";

export default async function AssessmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const db = await getDb();
  const a = await db.query.assessments.findFirst({ where: eq(assessments.slug, slug) });
  if (!a) notFound();
  // Never send the answer key to the browser.
  const qs = await db
    .select({ id: questions.id, prompt: questions.prompt, kind: questions.kind, options: questions.options })
    .from(questions)
    .where(eq(questions.assessmentId, a.id))
    .orderBy(asc(questions.position));
  const best = await bestAttempt(db, user.id, a.id);
  const course = a.courseId ? await db.query.courses.findFirst({ where: eq(courses.id, a.courseId) }) : null;
  const process = a.processId ? await db.query.businessProcesses.findFirst({ where: eq(businessProcesses.id, a.processId) }) : null;
  const backHref = course ? `/courses/${course.slug}` : process ? `/processes/${process.slug}` : "/assessments";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow={course?.title ?? process?.title ?? "Assessment"}
        title={a.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {qs.length} questions · pass mark {a.passMark}% · multiple-select questions score only when every correct option is chosen.
            {best && <Badge tone={best.passed ? "success" : "warning"}>Best so far: {best.score}%</Badge>}
          </span>
        }
      />
      <QuizRunner assessmentId={a.id} passMark={a.passMark} questions={qs} backHref={backHref} />
    </div>
  );
}

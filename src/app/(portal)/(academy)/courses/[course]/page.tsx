import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Award, CircleCheck, Circle, Clock, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assignments } from "@/lib/db/schema";
import { getCourseOutline } from "@/lib/services/learning";
import { NAV, SCOPE_LABELS } from "@/lib/nav";
import { Badge, ButtonLink, Callout, Card, CardTitle, LevelBadge, PageHeader, ProgressBar } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  await requireCourseUser();
  const { course: slug } = await params;
  const user = await requireUser();
  const db = await getDb();
  const data = await getCourseOutline(db, slug, user.id);
  if (!data || (!data.course.published && user.role === "student")) notFound();
  const { course, statusByLesson, assessment, best, certificate } = data;
  const all = course.modules.flatMap((m) => m.lessons);
  const done = all.filter((l) => statusByLesson.get(l.id) === "completed").length;
  const firstOpen = all.find((l) => statusByLesson.get(l.id) !== "completed") ?? all[0];
  const courseAssignments = await db.select().from(assignments).where(eq(assignments.courseId, course.id));
  const section = NAV.find((n) => n.section === course.section);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={section ? <Link href={section.href}>{section.label}</Link> : undefined}
        title={course.title}
        description={course.summary}
        actions={firstOpen && <ButtonLink href={`/courses/${course.slug}/${firstOpen.slug}`}>{done === 0 ? "Start course" : done === all.length ? "Review" : "Continue"}</ButtonLink>}
      />
      <div className="flex flex-wrap items-center gap-2">
        <LevelBadge level={course.level} />
        {course.odooVersion && <Badge tone="info">{course.odooVersion}</Badge>}
        {course.skills.map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {course.modules.map((m, mi) => (
            <Card key={m.id} className="p-0">
              <div className="border-b border-border px-5 py-3">
                <h2 className="font-semibold text-fg">
                  Module {mi + 1}: {m.title}
                </h2>
              </div>
              <ol className="divide-y divide-border">
                {m.lessons.map((l) => {
                  const st = statusByLesson.get(l.id);
                  return (
                    <li key={l.id}>
                      <Link href={`/courses/${course.slug}/${l.slug}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-2">
                        {st === "completed" ? (
                          <CircleCheck className="h-5 w-5 shrink-0 text-success" aria-label="Completed" />
                        ) : (
                          <Circle className={`h-5 w-5 shrink-0 ${st ? "text-primary" : "text-muted"}`} aria-label={st ? "In progress" : "Not started"} />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-fg">{l.title}</span>
                          <span className="mt-0.5 flex flex-wrap gap-1">
                            {l.scope.map((s) => (
                              <Badge key={s} tone={SCOPE_LABELS[s]?.tone ?? "neutral"}>
                                {SCOPE_LABELS[s]?.label ?? s}
                              </Badge>
                            ))}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {l.durationMin} min
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardTitle>Your progress</CardTitle>
            <div className="mt-3 flex items-center gap-3">
              <ProgressBar value={all.length ? (done / all.length) * 100 : 0} label="Course progress" />
              <span className="whitespace-nowrap text-sm text-muted">
                {done}/{all.length}
              </span>
            </div>
          </Card>
          {assessment && (
            <Card>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <CardTitle>Final assessment</CardTitle>
              </div>
              <p className="mt-2 text-sm text-muted">
                {assessment.title} · pass mark {assessment.passMark}%
              </p>
              {best && (
                <p className="mt-2 text-sm">
                  Best score: <Badge tone={best.passed ? "success" : "danger"}>{best.score}%</Badge>
                </p>
              )}
              <ButtonLink href={`/assessments/${assessment.slug}`} variant="secondary" className="mt-3 w-full">
                {best ? "Retake assessment" : "Take assessment"}
              </ButtonLink>
            </Card>
          )}
          {certificate ? (
            <Callout tone="success" title="Certificate earned">
              <Link href={`/certificates/${certificate.serial}`} className="underline">
                View certificate {certificate.serial}
              </Link>
            </Callout>
          ) : (
            <Callout title="Certificate criteria">
              Complete all {all.length} lessons{assessment ? ` and score at least ${course.certMinScore}% in the final assessment` : ""}.
            </Callout>
          )}
          {courseAssignments.length > 0 && (
            <Card>
              <CardTitle>Assignments</CardTitle>
              <ul className="mt-3 space-y-2">
                {courseAssignments.map((a) => (
                  <li key={a.id}>
                    <Link href={`/assignments/${a.slug}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <FileText className="h-4 w-4 shrink-0" /> {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

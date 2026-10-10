import Link from "next/link";
import { asc } from "drizzle-orm";
import { ArrowRight, Award, Briefcase, CircleCheck, Clock, SlidersHorizontal } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { learningPaths } from "@/lib/db/schema";
import { getStudentDashboard } from "@/lib/services/dashboard";
import { changeLearningPath } from "@/app/actions/learning";
import { Badge, ButtonLink, Callout, Card, CardTitle, EmptyState, LevelBadge, PageHeader, ProgressBar, Stat, buttonClass, inputClass } from "@/components/ui";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string; denied?: string }> }) {
  const user = await requireUser();
  const db = await getDb();
  const d = await getStudentDashboard(db, user.id);
  const paths = await db.select().from(learningPaths).orderBy(asc(learningPaths.position));
  const sp = await searchParams;
  const overall = d.totals.lessons ? (d.totals.done / d.totals.lessons) * 100 : 0;
  const pathDone = d.pathCourses.reduce((n, c) => n + c.completedLessons, 0);
  const pathTotal = d.pathCourses.reduce((n, c) => n + c.totalLessons, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome${sp.welcome ? "" : " back"}, ${user.name.split(" ")[0]}`}
        description="Understand the business → understand the process → learn the app → configure → import data → execute transactions → test → customize → implement → support."
      />
      {sp.denied && <Callout tone="warning">You don&apos;t have access to that area with your current role.</Callout>}

      {d.nextLesson ? (
        <Card className="flex flex-col gap-4 border-primary/30 bg-primary-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">Recommended next lesson</div>
            <div className="mt-1 text-lg font-semibold text-fg">{d.nextLesson.lessonTitle}</div>
            <div className="text-sm text-muted">{d.nextLesson.courseTitle}</div>
          </div>
          <ButtonLink href={`/courses/${d.nextLesson.courseSlug}/${d.nextLesson.lessonSlug}`}>
            Continue <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Card>
      ) : (
        <Callout tone="success" title="All lessons completed">
          Great work — move on to the implementation project and assessments.
        </Callout>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Lessons completed" value={`${d.totals.done} / ${d.totals.lessons}`} hint={<ProgressBar value={overall} className="mt-2" label="Overall lesson progress" />} />
        <Stat label="Assessments taken" value={d.scores.length} hint={d.scores.length ? `Avg best score ${Math.round(d.scores.reduce((n, s) => n + s.best, 0) / d.scores.length)}%` : "No attempts yet"} />
        <Stat label="Practical steps done" value={d.exerciseStepsDone} hint="Configuration lab checklist steps" />
        <Stat label="Certificates" value={d.certificates.length} hint={<Link href="/assessments" className="text-primary hover:underline">View certificates</Link>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Current learning path</CardTitle>
              {d.path ? (
                <p className="mt-1 text-sm text-muted">
                  <span className="font-medium text-fg">{d.path.title}</span> · {d.path.description}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted">No path selected — choose one to get a recommended sequence.</p>
              )}
            </div>
            <form action={changeLearningPath} className="flex gap-2">
              <label htmlFor="path" className="sr-only">
                Learning path
              </label>
              <select id="path" name="path" defaultValue={d.path?.slug ?? ""} className={`${inputClass} w-auto`}>
                <option value="">— none —</option>
                {paths.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title} ({p.level})
                  </option>
                ))}
              </select>
              <button className={buttonClass("secondary")}>Change</button>
            </form>
          </div>
          {d.pathCourses.length > 0 && (
            <>
              <div className="mb-4 flex items-center gap-3 text-sm text-muted">
                <ProgressBar value={pathTotal ? (pathDone / pathTotal) * 100 : 0} label="Learning path progress" />
                <span className="whitespace-nowrap">
                  {pathDone}/{pathTotal}
                </span>
              </div>
              <ol className="divide-y divide-border">
                {d.pathCourses.map((c, i) => {
                  const pct = c.totalLessons ? (c.completedLessons / c.totalLessons) * 100 : 0;
                  return (
                    <li key={c.id} className="flex items-center gap-4 py-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-muted">
                        {pct === 100 ? <CircleCheck className="h-4 w-4 text-success" /> : i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link href={`/courses/${c.slug}`} className="font-medium text-fg hover:text-primary">
                          {c.title}
                        </Link>
                        <div className="mt-1 flex items-center gap-3">
                          <ProgressBar value={pct} label={`${c.title} progress`} />
                          <span className="whitespace-nowrap text-xs text-muted">
                            {c.completedLessons}/{c.totalLessons} lessons
                          </span>
                        </div>
                      </div>
                      <LevelBadge level={c.level} />
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle>Skills</CardTitle>
            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1.5 text-xs font-medium uppercase text-muted">Gained</div>
                <div className="flex flex-wrap gap-1.5">
                  {d.skillsGained.length ? d.skillsGained.map((s) => <Badge key={s} tone="success">{s}</Badge>) : <span className="text-sm text-muted">Complete a course to earn skills.</span>}
                </div>
              </div>
              {d.skillsInProgress.length > 0 && (
                <div>
                  <div className="mb-1.5 text-xs font-medium uppercase text-muted">In progress</div>
                  <div className="flex flex-wrap gap-1.5">
                    {d.skillsInProgress.slice(0, 12).map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
          <Card>
            <CardTitle>Trainer feedback</CardTitle>
            {d.feedback.length ? (
              <ul className="mt-3 space-y-3">
                {d.feedback.map((f, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-fg">{f.body}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {f.trainer} · {f.createdAt.toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">No feedback yet. Submit an assignment to get a review.</p>
            )}
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <CardTitle>Assessment scores</CardTitle>
          </div>
          {d.scores.length ? (
            <ul className="mt-3 divide-y divide-border">
              {d.scores.slice(0, 6).map((s) => (
                <li key={s.assessmentId} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="truncate text-fg">{s.title}</span>
                  <Badge tone={s.best >= s.passMark ? "success" : "danger"}>{s.best}%</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No assessments yet">Finish a course and take its final assessment.</EmptyState>
          )}
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <CardTitle>Project progress</CardTitle>
          </div>
          <ul className="mt-3 space-y-3">
            {d.projects.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.slug}`} className="text-sm font-medium text-fg hover:text-primary">
                  Project {p.code}: {p.title}
                </Link>
                <div className="mt-1 flex items-center gap-3">
                  <ProgressBar value={p.totalTasks ? (p.doneTasks / p.totalTasks) * 100 : 0} label={`${p.title} progress`} />
                  <span className="whitespace-nowrap text-xs text-muted">
                    {p.doneTasks}/{p.totalTasks}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <CardTitle>Practice next</CardTitle>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="text-primary hover:underline" href="/config-lab/trading-company">
                Configure a trading company (12 steps)
              </Link>
            </li>
            <li>
              <Link className="text-primary hover:underline" href="/import-lab">
                Validate customer, vendor & product imports
              </Link>
            </li>
            <li>
              <Link className="text-primary hover:underline" href="/processes/order-to-cash">
                Walk through Order-to-Cash
              </Link>
            </li>
            <li>
              <Link className="text-primary hover:underline" href="/assistant">
                Ask the AI learning assistant
              </Link>
            </li>
          </ul>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
            <Clock className="h-3.5 w-3.5" /> Tip: 45–60 focused minutes a day beats weekend marathons.
          </p>
        </Card>
      </div>
    </div>
  );
}

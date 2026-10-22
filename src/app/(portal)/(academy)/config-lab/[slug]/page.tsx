import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getScenario } from "@/lib/services/practice";
import type { ConfigScenarioContent } from "@/content/types";
import { Markdown } from "@/components/markdown";
import { StepToggle } from "@/components/step-toggle";
import { Badge, Callout, Card, CardTitle, LevelBadge, PageHeader, ProgressBar } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

export default async function ScenarioPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireCourseUser();
  const { slug } = await params;
  const user = await requireUser();
  const res = await getScenario(await getDb(), slug, user.id);
  if (!res) notFound();
  const { exercise, done } = res;
  const data = exercise.data as Omit<ConfigScenarioContent, "steps">;
  const path = `/config-lab/${slug}`;
  const doneCount = exercise.steps.filter((s) => done.has(s.id)).length;
  const donePositions = new Set(exercise.steps.filter((s) => done.has(s.id)).map((s) => s.position));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={<Link href="/config-lab">Business Configuration Lab</Link>} title={exercise.title} description={exercise.summary} />
      <div className="flex flex-wrap gap-2">
        <LevelBadge level={exercise.level} />
        {exercise.businessType && <Badge>{exercise.businessType}</Badge>}
        {exercise.odooVersion && <Badge tone="info">{exercise.odooVersion}</Badge>}
        {data.odooApps.map((a) => (
          <Badge key={a} tone="primary">
            {a}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Company profile</CardTitle>
          <Markdown className="mt-2 text-sm">{data.companyProfile}</Markdown>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardTitle>Progress</CardTitle>
            <div className="mt-3 flex items-center gap-3">
              <ProgressBar value={exercise.steps.length ? (doneCount / exercise.steps.length) * 100 : 0} label="Scenario progress" />
              <span className="whitespace-nowrap text-sm text-muted">
                {doneCount}/{exercise.steps.length}
              </span>
            </div>
          </Card>
          <Card>
            <CardTitle>Prerequisites</CardTitle>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg">
              {data.prerequisites.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Callout tone="warning" title="Simulation notice">
        Perform each step in an Odoo <strong>training</strong> database. Marking a step done here only records your progress; it does not change any ERP.
      </Callout>

      <section aria-label="Configuration sequence" className="space-y-4">
        {exercise.steps.map((s) => {
          const isDone = done.has(s.id);
          const blocked = s.dependsOn.some((d) => !donePositions.has(d));
          return (
            <Card key={s.id} id={`step-${s.position}`} as="article" className={isDone ? "border-success/40" : undefined}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="font-semibold text-primary">Step {s.position}</span>
                    {s.dependsOn.length > 0 && <span>Depends on step {s.dependsOn.join(", ")}</span>}
                    {blocked && !isDone && <Badge tone="warning">Locked</Badge>}
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-fg">{s.title}</h2>
                  {s.odooPath && <div className="mt-1 font-mono text-xs text-accent">{s.odooPath}</div>}
                </div>
                <StepToggle stepId={s.id} done={isDone} path={path} />
              </div>
              <p className="mt-3 text-sm text-muted">
                <span className="font-medium text-fg">Why: </span>
                {s.why}
              </p>
              <details className="mt-3 group" open={!isDone && !blocked}>
                <summary className="cursor-pointer text-sm font-medium text-primary">Instructions, validation & common mistakes</summary>
                <div className="mt-3 space-y-4">
                  <Markdown className="text-sm">{s.instructions}</Markdown>
                  <div className="rounded-lg bg-success-soft p-3 text-sm">
                    <span className="font-semibold text-success">Validation check: </span>
                    <span className="text-fg">{s.validation}</span>
                  </div>
                  {s.commonMistakes.length > 0 && (
                    <div className="rounded-lg bg-warning-soft p-3 text-sm">
                      <div className="font-semibold text-warning">Common mistakes</div>
                      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-fg">
                        {s.commonMistakes.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            </Card>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Expected result</CardTitle>
          <Markdown className="mt-2 text-sm">{data.expectedResult}</Markdown>
        </Card>
        <Card>
          <CardTitle>Scenario-level common mistakes</CardTitle>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg">
            {data.commonMistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

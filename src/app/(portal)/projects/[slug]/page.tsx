import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assignments, exercises } from "@/lib/db/schema";
import { getProject } from "@/lib/services/practice";
import type { ProjectContent } from "@/content/types";
import { Markdown } from "@/components/markdown";
import { TaskStatus } from "@/components/task-status";
import { LoadTestCasesButton } from "@/components/load-test-cases";
import { Badge, ButtonLink, Callout, Card, CardTitle, LevelBadge, PageHeader, ProgressBar, buttonClass } from "@/components/ui";

const TYPE_TONE = { standard: "success", configuration: "info", customization: "danger", integration: "warning", reporting: "primary" } as const;

const SECTIONS = [
  ["profile", "Company"],
  ["requirements", "Requirements"],
  ["as-is", "AS-IS / TO-BE"],
  ["data", "Master data"],
  ["plan", "Project plan"],
  ["transactions", "Transactions"],
  ["custom", "Customizations"],
  ["tests", "Test cases"],
  ["acceptance", "Acceptance & rubric"],
] as const;

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const db = await getDb();
  const res = await getProject(db, slug, user.id);
  if (!res) notFound();
  const { project, status } = res;
  const p = project.data as ProjectContent;
  const path = `/projects/${slug}`;
  const done = project.tasks.filter((t) => status.get(t.id) === "done").length;
  const finalAssignment = await db.query.assignments.findFirst({ where: eq(assignments.projectId, project.id) });
  // Project A predates the configScenario field in stored project documents.
  const scenarioSlug = p.configScenario ?? (p.code === "A" ? "trading-company" : undefined);
  const scenario = scenarioSlug ? await db.query.exercises.findFirst({ where: eq(exercises.slug, scenarioSlug), columns: { slug: true, title: true } }) : undefined;
  const phases = Array.from(new Map(project.tasks.map((t) => [t.phase, t.phaseTitle])).entries());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<Link href="/projects">Project {p.code}</Link>}
        title={p.title}
        description={p.summary}
        actions={finalAssignment && <ButtonLink href={`/assignments/${finalAssignment.slug}`}>Submit final dossier</ButtonLink>}
      />
      <div className="flex flex-wrap gap-2">
        <LevelBadge level={p.level} />
        <Badge>{p.industry}</Badge>
        <Badge tone="info">{p.odooVersion}</Badge>
      </div>

      <nav aria-label="Project sections" className="sticky top-14 z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-border bg-bg/95 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-fg">
            {label}
          </a>
        ))}
      </nav>

      <Card>
        <div className="flex items-center gap-3">
          <CardTitle>Your project progress</CardTitle>
          <span className="ml-auto text-sm text-muted">
            {done}/{project.tasks.length} tasks
          </span>
        </div>
        <ProgressBar value={project.tasks.length ? (done / project.tasks.length) * 100 : 0} className="mt-3" label="Project progress" />
      </Card>

      <section id="profile" className="scroll-mt-28 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>{p.company.name}</CardTitle>
          <Markdown className="mt-2 text-sm">{p.company.profile}</Markdown>
        </Card>
        <Card>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase text-muted">Locations</dt>
              <dd className="text-fg">{p.company.locations.join(" · ")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Employees</dt>
              <dd className="text-fg">{p.company.employees}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Currency</dt>
              <dd className="text-fg">{p.company.currency}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted">Fictional company and synthetic data for training only.</p>
        </Card>
      </section>

      <section id="requirements" className="scroll-mt-28">
        <Card>
          <CardTitle>Business requirements ({p.requirements.length})</CardTitle>
          <p className="mt-1 text-sm text-muted">Classify, trace and prioritise these in your requirement traceability matrix.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted">
                  <th className="py-2 pr-3 font-medium">ID</th>
                  <th className="py-2 pr-3 font-medium">Area</th>
                  <th className="py-2 pr-3 font-medium">Requirement</th>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {p.requirements.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="py-2 pr-3 font-mono text-xs text-fg">{r.id}</td>
                    <td className="py-2 pr-3 text-muted">{r.area}</td>
                    <td className="py-2 pr-3 text-fg">{r.description}</td>
                    <td className="py-2 pr-3">
                      <Badge tone={TYPE_TONE[r.type]}>{r.type}</Badge>
                    </td>
                    <td className="py-2">
                      <Badge tone={r.priority === "Must" ? "danger" : r.priority === "Should" ? "warning" : "neutral"}>{r.priority}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section id="as-is" className="scroll-mt-28 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>AS-IS process</CardTitle>
          <Markdown className="mt-2 text-sm">{p.asIs}</Markdown>
        </Card>
        <Card>
          <CardTitle>TO-BE process</CardTitle>
          <Markdown className="mt-2 text-sm">{p.toBe}</Markdown>
        </Card>
      </section>

      <section id="data" className="scroll-mt-28">
        <Card>
          <CardTitle>Master data files & migration exercises</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Download each file, validate it in the{" "}
            <Link href="/import-lab" className="text-primary hover:underline">
              Import Lab simulator
            </Link>{" "}
            in dependency order, then import it into your Odoo training database and reconcile.
          </p>
          <ul className="mt-4 divide-y divide-border">
            {p.masterDataFiles.map((f, i) => (
              <li key={f.name} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium text-fg">
                    {f.name} {f.templateKey && <Badge tone="primary">{f.templateKey}</Badge>}
                  </div>
                  <div className="text-sm text-muted">
                    {f.description} · {f.rows.length} rows
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`/api/projects/${slug}/files/${i}`} className={buttonClass("secondary", "text-xs")}>
                    <Download className="h-3.5 w-3.5" /> CSV
                  </a>
                  {f.templateKey && (
                    <Link href={`/import-lab/${f.templateKey}`} className={buttonClass("ghost", "text-xs")}>
                      Field guide
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section id="plan" className="scroll-mt-28 space-y-4">
        <h2 className="text-lg font-semibold text-fg">Implementation plan & configuration checklist</h2>
        <Callout>
          Track your own progress per task.{" "}
          {scenario ? (
            <>
              The configuration tasks map to the{" "}
              <Link href={`/config-lab/${scenario.slug}`} className="underline">
                {scenario.title}
              </Link>{" "}
              lab — practise them there step by step.
            </>
          ) : (
            <>
              Validate every migration file in the{" "}
              <Link href="/import-lab" className="underline">
                Data Migration & Import Lab
              </Link>{" "}
              before loading it into your training database.
            </>
          )}
        </Callout>
        {phases.map(([phase, title]) => (
          <Card key={phase} className="p-0">
            <div className="border-b border-border px-5 py-3 font-semibold text-fg">{title}</div>
            <ul className="divide-y divide-border">
              {project.tasks
                .filter((t) => t.phase === phase)
                .map((t) => (
                  <li key={t.id} className="flex flex-col gap-3 px-5 py-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-fg">{t.title}</div>
                      <p className="text-sm text-muted">{t.description}</p>
                      <p className="mt-1 text-xs text-muted">
                        <span className="font-semibold text-fg">Deliverable:</span> {t.deliverable}
                      </p>
                    </div>
                    <TaskStatus taskId={t.id} status={status.get(t.id) ?? "todo"} path={path} />
                  </li>
                ))}
            </ul>
          </Card>
        ))}
      </section>

      <section id="transactions" className="scroll-mt-28">
        <Card>
          <CardTitle>Transaction scenarios</CardTitle>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {p.transactionScenarios.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-4">
                <div className="text-xs font-mono text-muted">{s.id}</div>
                <div className="font-medium text-fg">{s.title}</div>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-fg">
                  {s.steps.map((st) => (
                    <li key={st}>{st}</li>
                  ))}
                </ol>
                <p className="mt-2 text-sm text-muted">
                  <span className="font-semibold text-success">Expected:</span> {s.expected}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="custom" className="scroll-mt-28">
        <Card>
          <CardTitle>Customization requirements</CardTitle>
          <div className="mt-3 space-y-4">
            {p.customizations.map((c) => (
              <details key={c.id} className="rounded-lg border border-border p-4">
                <summary className="cursor-pointer font-medium text-fg">
                  <span className="font-mono text-xs text-muted">{c.id}</span> {c.title}
                </summary>
                <Markdown className="mt-3 text-sm">{c.spec}</Markdown>
              </details>
            ))}
          </div>
        </Card>
      </section>

      <section id="tests" className="scroll-mt-28">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Test cases ({p.testCases.length})</CardTitle>
            <LoadTestCasesButton projectId={project.id} />
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted">
                  <th className="py-2 pr-3 font-medium">ID</th>
                  <th className="py-2 pr-3 font-medium">Req.</th>
                  <th className="py-2 pr-3 font-medium">Module</th>
                  <th className="py-2 pr-3 font-medium">Scenario</th>
                  <th className="py-2 font-medium">Expected result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {p.testCases.map((t) => (
                  <tr key={t.id} className="align-top">
                    <td className="py-2 pr-3 font-mono text-xs">{t.id}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-muted">{t.requirementId}</td>
                    <td className="py-2 pr-3 text-muted">{t.module}</td>
                    <td className="py-2 pr-3 text-fg">{t.scenario}</td>
                    <td className="py-2 text-muted">{t.expected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section id="acceptance" className="scroll-mt-28 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Business acceptance criteria</CardTitle>
          <ul className="mt-3 space-y-1.5 text-sm text-fg">
            {p.acceptanceCriteria.map((a) => (
              <li key={a} className="flex gap-2">
                <span aria-hidden>☐</span>
                {a}
              </li>
            ))}
          </ul>
          <CardTitle className="mt-6">Final implementation documentation</CardTitle>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg">
            {p.documentation.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>Trainer evaluation rubric</CardTitle>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted">
                  <th className="py-2 pr-3 font-medium">Criterion</th>
                  <th className="py-2 pr-3 font-medium">Weight</th>
                  <th className="py-2 font-medium">Excellent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {p.rubric.map((r) => (
                  <tr key={r.criterion} className="align-top">
                    <td className="py-2 pr-3 font-medium text-fg">{r.criterion}</td>
                    <td className="py-2 pr-3 text-muted">{r.weight}%</td>
                    <td className="py-2 text-muted">{r.excellent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

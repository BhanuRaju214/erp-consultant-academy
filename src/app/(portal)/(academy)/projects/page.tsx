import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listProjectsWithProgress } from "@/lib/services/practice";
import { plannedProjects } from "@/content";
import { Badge, Card, LevelBadge, PageHeader, ProgressBar } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

export const metadata = { title: "Real-Time Business Projects" };

export default async function ProjectsPage() {
  await requireCourseUser();
  const user = await requireUser();
  const projects = await listProjectsWithProgress(await getDb(), user.id);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Real-Time Implementation Projects"
        description="Guided end-to-end implementations of fictional companies — from requirement gathering through go-live preparation. Each project includes the company profile, requirements, AS-IS/TO-BE, master data files, configuration checklist, migration exercises, transaction scenarios, customization specs, test cases, acceptance criteria, deliverables and the trainer rubric."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id} as="article" className="border-primary/30">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">Project {p.code}</Badge>
              <LevelBadge level={p.level} />
              <Badge>{p.industry}</Badge>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-fg">
              <Link href={`/projects/${p.slug}`} className="hover:text-primary">
                {p.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-muted">{p.summary}</p>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted">
              <ProgressBar value={p.totalTasks ? (p.doneTasks / p.totalTasks) * 100 : 0} label={`${p.title} progress`} />
              <span className="whitespace-nowrap">
                {p.doneTasks}/{p.totalTasks} tasks
              </span>
            </div>
          </Card>
        ))}
        {/* Projects listed in the catalogue but not yet loaded into the database. */}
        {plannedProjects
          .filter((pp) => !projects.some((p) => p.code === pp.code))
          .map((p) => (
            <Card key={p.code} as="article" className="border-dashed opacity-80">
              <div className="flex items-center gap-2">
                <Badge>Project {p.code}</Badge>
                <Badge tone="warning">Content in preparation</Badge>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-fg">{p.title}</h2>
              <p className="mt-1 text-sm text-muted">{p.summary}</p>
            </Card>
          ))}
      </div>
    </div>
  );
}

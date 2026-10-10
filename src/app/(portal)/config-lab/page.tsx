import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listScenariosWithProgress } from "@/lib/services/practice";
import { Badge, Callout, Card, LevelBadge, PageHeader, ProgressBar } from "@/components/ui";

export const metadata = { title: "Business Configuration Lab" };

export default async function ConfigLabPage() {
  const user = await requireUser();
  const scenarios = await listScenariosWithProgress(await getDb(), user.id);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Configuration Lab"
        description="Guided configuration checklists per business type: prerequisites, sequence, dependencies, validation checks, expected results and common mistakes."
      />
      <Callout title="How this lab works">
        This is a <strong>guided simulation</strong>: you perform each step in your own Odoo training database (Odoo 17 recommended, never a production
        database), verify it with the validation check, then tick it here. Ticking a step records your progress only — the portal does not connect to or
        change any Odoo instance. Steps unlock in dependency order, just like a real configuration sequence.
      </Callout>
      <div className="grid gap-5 md:grid-cols-2">
        {scenarios.map((s) => {
          const pct = s.totalSteps ? (s.doneSteps / s.totalSteps) * 100 : 0;
          return (
            <Card key={s.id} as="article">
              <div className="flex flex-wrap items-center gap-2">
                <LevelBadge level={s.level} />
                {s.businessType && <Badge>{s.businessType}</Badge>}
                {s.odooVersion && <Badge tone="info">{s.odooVersion}</Badge>}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-fg">
                <Link href={`/config-lab/${s.slug}`} className="hover:text-primary">
                  {s.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted">{s.summary}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                <ProgressBar value={pct} label={`${s.title} progress`} />
                <span className="whitespace-nowrap">
                  {s.doneSteps}/{s.totalSteps} steps
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

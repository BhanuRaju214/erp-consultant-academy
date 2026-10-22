import Link from "next/link";
import { asc } from "drizzle-orm";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { docResources } from "@/lib/db/schema";
import { IMPORT_TEMPLATES } from "@/lib/import/templates";
import { Badge, Card, CardTitle, PageHeader, buttonClass } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

export const metadata = { title: "Documentation Library" };

const ORDER = ["Glossary", "Reference", "Guide", "Template", "Checklist"];

export default async function DocsPage() {
  await requireCourseUser();
  await requireUser();
  const docs = await (await getDb()).select().from(docResources).orderBy(asc(docResources.title));
  const groups = ORDER.map((c) => ({ category: c, items: docs.filter((d) => d.category === c) })).filter((g) => g.items.length);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Documentation Library"
        description="Implementation handbook: glossary, references and reusable templates for every phase — from discovery questionnaires to go-live checklists and support triage. Copy the tables into your project workbook."
      />
      {groups.map((g) => (
        <section key={g.category}>
          <h2 className="mb-3 text-lg font-semibold text-fg">{g.category === "Glossary" ? "Glossary" : `${g.category}s`}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {g.items.map((d) => (
              <Card key={d.id} as="article">
                <Badge>{d.category}</Badge>
                <h3 className="mt-2 font-semibold text-fg">
                  <Link href={`/docs/${d.slug}`} className="hover:text-primary">
                    {d.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted">{d.summary}</p>
              </Card>
            ))}
          </div>
        </section>
      ))}
      <Card>
        <CardTitle>Downloadable import templates</CardTitle>
        <p className="mt-1 text-sm text-muted">Odoo 17 import templates with a field guide sheet. Details in the Data Migration & Import Lab.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {IMPORT_TEMPLATES.map((t) => (
            <a key={t.key} href={`/api/templates/${t.key}?format=xlsx`} className={buttonClass("secondary", "text-xs")}>
              <Download className="h-3.5 w-3.5" /> {t.title}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

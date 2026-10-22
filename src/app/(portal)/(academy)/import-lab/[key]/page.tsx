import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { REFERENCE_DATA, getTemplate } from "@/lib/import/templates";
import { ImportSimulator } from "@/components/import-simulator";
import { Badge, Callout, Card, CardTitle, PageHeader, buttonClass } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return { title: `${getTemplate(key)?.title ?? "Template"} import` };
}

export default async function TemplatePage({ params }: { params: Promise<{ key: string }> }) {
  await requireCourseUser();
  const { key } = await params;
  await requireUser();
  const t = getTemplate(key);
  if (!t) notFound();
  const header = t.fields.map((f) => f.column);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<Link href="/import-lab">Data Migration & Import Lab</Link>}
        title={`Import exercise: ${t.title}`}
        description={t.purpose}
        actions={
          <>
            <a href={`/api/templates/${t.key}?format=xlsx`} className={buttonClass("primary")}>
              <Download className="h-4 w-4" /> Template (XLSX)
            </a>
            <a href={`/api/templates/${t.key}?format=csv`} className={buttonClass("secondary")}>
              <Download className="h-4 w-4" /> CSV
            </a>
          </>
        }
      />
      <div className="flex flex-wrap gap-2">
        <Badge tone="primary">Import step {t.order}</Badge>
        <Badge className="font-mono">{t.odooModel}</Badge>
        <Badge tone="info">Odoo 17.0 field names</Badge>
        {t.dependsOn.map((d) => (
          <Badge key={d} tone="warning">
            Import <Link href={`/import-lab/${d}`} className="underline">{d}</Link> first
          </Badge>
        ))}
      </div>

      <Callout title="Where to import in Odoo">
        <span className="font-mono text-xs">{t.odooImportPath}</span>. Odoo&apos;s import screen maps these technical column names automatically. Click{" "}
        <strong>Test</strong> before <strong>Import</strong>.
      </Callout>

      <Card>
        <CardTitle>1–3. Fields: meaning, mandatory vs optional, examples</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="py-2 pr-3 font-medium">Column</th>
                <th className="py-2 pr-3 font-medium">Label</th>
                <th className="py-2 pr-3 font-medium">Required</th>
                <th className="py-2 pr-3 font-medium">Type / allowed values</th>
                <th className="py-2 pr-3 font-medium">Business meaning</th>
                <th className="py-2 font-medium">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.fields.map((f) => (
                <tr key={f.column} className="align-top">
                  <td className="py-2 pr-3 font-mono text-xs text-fg">{f.column}</td>
                  <td className="py-2 pr-3 text-fg">{f.label}</td>
                  <td className="py-2 pr-3">{f.required ? <Badge tone="danger">Mandatory</Badge> : <Badge>Optional</Badge>}</td>
                  <td className="py-2 pr-3 text-xs text-muted">
                    {f.type}
                    {f.options && <div className="font-mono">{f.options.join(" | ")}</div>}
                    {f.refTemplate && <div>→ External ID from {f.refTemplate}</div>}
                    {f.refData && <div>→ existing {f.refData} name</div>}
                    {f.unique && <div>unique ({f.unique})</div>}
                  </td>
                  <td className="py-2 pr-3 text-muted">{f.description}</td>
                  <td className="py-2 font-mono text-xs text-fg">{f.example || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle>4. Sample records</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full whitespace-nowrap font-mono text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                {header.map((h) => (
                  <th key={h} className="py-2 pr-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {t.sampleRows.map((r, i) => (
                <tr key={i}>
                  {header.map((h) => (
                    <td key={h} className="py-1.5 pr-4 text-fg">
                      {r[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>5–6. Mapping, External IDs & relational fields</CardTitle>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-fg">
            <li>
              Map every legacy column to an Odoo field in a <Link href="/docs/data-mapping-specification" className="text-primary hover:underline">data mapping specification</Link>{" "}
              (legacy field → Odoo field → transformation rule → owner).
            </li>
            <li>
              The <code className="rounded bg-surface-2 px-1">id</code> column is the record&apos;s <strong>External ID</strong>. Build it from the legacy key (e.g.{" "}
              <code className="rounded bg-surface-2 px-1">cust_0001</code>) so re-imports update instead of duplicating, and so other files can reference the record.
            </li>
            <li>
              Columns ending in <code className="rounded bg-surface-2 px-1">/id</code> link to another record by External ID — the safest way to map relations.
            </li>
            <li>Relational columns without the suffix (country, payment terms, UoM, location) are matched by display name, which must exist exactly in Odoo.</li>
          </ul>
          {t.fields.some((f) => f.refData) && (
            <div className="mt-4 text-xs text-muted">
              <div className="font-semibold text-fg">Name values recognised by the simulator</div>
              {t.fields
                .filter((f) => f.refData)
                .map((f) => (
                  <p key={f.column} className="mt-1">
                    <span className="font-mono">{f.column}</span>: {REFERENCE_DATA[f.refData!].join(", ")}
                  </p>
                ))}
            </div>
          )}
        </Card>
        <Card>
          <CardTitle>7–9. Dependencies, cleansing & import procedure</CardTitle>
          <p className="mt-2 text-sm text-muted">
            {t.dependsOn.length ? `Depends on: ${t.dependsOn.join(", ")}.` : "No upstream import dependency in this lab sequence."} Duplicate detection: External IDs
            and unique keys are checked for duplicates; names, emails and tax IDs raise possible-duplicate warnings.
          </p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-fg">
            {t.procedure.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          {t.versionNotes.length > 0 && (
            <div className="mt-4 rounded-lg bg-surface-2 p-3 text-xs text-muted">
              <div className="mb-1 font-semibold text-fg">Version notes</div>
              <ul className="list-disc space-y-1 pl-4">
                {t.versionNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>10. Validation checklist</CardTitle>
          <ul className="mt-3 space-y-1.5 text-sm text-fg">
            {t.validationChecklist.map((c) => (
              <li key={c} className="flex gap-2">
                <span aria-hidden>☐</span> {c}
              </li>
            ))}
          </ul>
          <CardTitle className="mt-5">12. Reconciliation</CardTitle>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg">
            {t.reconciliation.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>11. Common import errors</CardTitle>
          <ul className="mt-3 space-y-3 text-sm">
            {t.commonErrors.map((e) => (
              <li key={e.error}>
                <div className="font-mono text-xs text-danger">{e.error}</div>
                <div className="mt-0.5 text-muted">
                  <span className="font-medium text-fg">Cause:</span> {e.cause}
                </div>
                <div className="text-muted">
                  <span className="font-medium text-fg">Fix:</span> {e.fix}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <ImportSimulator initialTemplate={t.key} />
    </div>
  );
}

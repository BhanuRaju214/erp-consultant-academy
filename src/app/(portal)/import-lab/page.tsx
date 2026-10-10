import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { IMPORT_TEMPLATES } from "@/lib/import/templates";
import { ImportSimulator } from "@/components/import-simulator";
import { SampleGenerator } from "@/components/sample-generator";
import { Badge, Card, CardTitle, PageHeader, buttonClass } from "@/components/ui";

export const metadata = { title: "Data Migration & Import Lab" };

const FULL_ORDER = [
  "Units of measure",
  "Product categories",
  "Taxes & payment terms",
  "Customers & vendors",
  "Products & variants",
  "Pricelists",
  "Warehouses & locations",
  "Bills of materials",
  "Opening stock",
  "Opening AR / AP",
  "Opening journal balances",
  "Open sales / purchase orders",
];

const HANDS_ON = new Set(["Product categories", "Customers & vendors", "Products & variants", "Opening stock"]);

export default async function ImportLabPage() {
  await requireUser();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Migration & Import Lab"
        description="Prepare, cleanse, validate and reconcile master data the way you would on a real Odoo implementation: templates, field-by-field explanations, External IDs, dependency order, a validation simulator, a sample data generator and reconciliation reports."
      />

      <Card>
        <CardTitle>Import dependency order</CardTitle>
        <p className="mt-1 text-sm text-muted">
          Odoo can only link to records that already exist, so data is loaded in dependency order. The highlighted objects have hands-on templates in this
          release; the full sequence is explained in the{" "}
          <Link href="/docs/odoo-import-dependency-order" className="text-primary hover:underline">
            dependency order reference
          </Link>
          .
        </p>
        <ol className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
          {FULL_ORDER.map((s, i) => {
            const t = HANDS_ON.has(s);
            return (
              <li key={s} className="flex items-center gap-1.5">
                <span className={t ? "rounded-full bg-primary px-2.5 py-1 font-medium text-primary-fg" : "rounded-full bg-surface-2 px-2.5 py-1 text-muted"}>
                  {i + 1}. {s}
                </span>
                {i < FULL_ORDER.length - 1 && <ArrowRight className="h-3 w-3 text-muted" aria-hidden />}
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {IMPORT_TEMPLATES.map((t) => (
          <Card key={t.key} as="article" className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">Step {t.order}</Badge>
              <Badge className="font-mono">{t.odooModel}</Badge>
              {t.dependsOn.length > 0 && <Badge tone="warning">needs {t.dependsOn.join(", ")}</Badge>}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-fg">
              <Link href={`/import-lab/${t.key}`} className="hover:text-primary">
                {t.title}
              </Link>
            </h2>
            <p className="mt-1 flex-1 text-sm text-muted">{t.purpose}</p>
            <p className="mt-3 text-xs text-muted">
              {t.fields.length} fields · {t.fields.filter((f) => f.required).length} mandatory
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`/api/templates/${t.key}?format=xlsx`} className={buttonClass("secondary", "text-xs")}>
                <Download className="h-3.5 w-3.5" /> XLSX
              </a>
              <a href={`/api/templates/${t.key}?format=csv`} className={buttonClass("secondary", "text-xs")}>
                <Download className="h-3.5 w-3.5" /> CSV
              </a>
              <Link href={`/import-lab/${t.key}`} className={buttonClass("ghost", "text-xs")}>
                Field guide →
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div id="generator" className="scroll-mt-20">
        <SampleGenerator />
      </div>
      <div id="simulator" className="scroll-mt-20">
        <ImportSimulator />
      </div>
    </div>
  );
}

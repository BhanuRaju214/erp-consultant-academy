"use client";

import { useState } from "react";
import { Download, Eye, FlaskConical, Loader2, Wand2 } from "lucide-react";
import { IMPORT_TEMPLATES, type TemplateKey } from "@/lib/import/templates";
import { toCsv } from "@/lib/import/csv";
import { Badge, Callout, Card, CardTitle, buttonClass, cn, inputClass } from "./ui";

interface Injected {
  template: string;
  row: number;
  column: string;
  problem: string;
}

interface Dataset {
  companyName: string;
  files: Record<TemplateKey, Record<string, string>[]>;
  injected: Injected[];
}

export interface GeneratorParams {
  business: string;
  seed: number;
  customers: number;
  vendors: number;
  products: number;
  inject: boolean;
}

/** Shared with the simulator so its quick-load buttons use the trainee's last settings. */
export const LAST_PARAMS_KEY = "sample-generator-params";
/** Window event the simulator listens to: load a generated file into it. */
export const LOAD_EVENT = "import-lab:load-sample";
export type LoadSampleDetail = { template: TemplateKey; csv: string; label: string };

export function sampleQuery(p: GeneratorParams): string {
  return new URLSearchParams({
    business: p.business,
    seed: String(p.seed),
    customers: String(p.customers),
    vendors: String(p.vendors),
    products: String(p.products),
    inject: p.inject ? "1" : "0",
  }).toString();
}

const FIELDS = [
  { key: "seed", label: "Seed", min: 1, max: 999_999 },
  { key: "customers", label: "Customers", min: 1, max: 500 },
  { key: "vendors", label: "Vendors", min: 1, max: 200 },
  { key: "products", label: "Products", min: 1, max: 500 },
] as const;
type NumKey = (typeof FIELDS)[number]["key"];

const BUSINESS_LABEL: Record<string, string> = {
  trading: "Trading / distribution",
  retail: "Retail",
  manufacturing: "Manufacturing",
  services: "Professional services",
};

export function SampleGenerator() {
  const [business, setBusiness] = useState("trading");
  // Keep raw text so users can clear and retype freely; validate on Generate.
  const [nums, setNums] = useState<Record<NumKey, string>>({ seed: "42", customers: "20", vendors: "8", products: "24" });
  const [inject, setInject] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [data, setData] = useState<Dataset | null>(null);
  const [params, setParams] = useState<GeneratorParams | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [previewKey, setPreviewKey] = useState<TemplateKey | null>(null);

  const fieldError = (k: NumKey): string | null => {
    const f = FIELDS.find((x) => x.key === k)!;
    const v = nums[k].trim();
    if (!/^\d+$/.test(v)) return `${f.label}: enter a whole number`;
    const n = Number(v);
    if (n < f.min || n > f.max) return `${f.label}: ${f.min}–${f.max.toLocaleString()}`;
    return null;
  };
  const errors = FIELDS.map((f) => fieldError(f.key)).filter(Boolean) as string[];

  const generate = async () => {
    setError(undefined);
    if (errors.length) {
      setError(errors.join(" · "));
      return;
    }
    const p: GeneratorParams = {
      business,
      seed: Number(nums.seed),
      customers: Number(nums.customers),
      vendors: Number(nums.vendors),
      products: Number(nums.products),
      inject,
    };
    setBusy(true);
    setShowKey(false);
    setPreviewKey(null);
    try {
      const res = await fetch(`/api/sample-data?${sampleQuery(p)}`, { cache: "no-store" });
      if (res.status === 401) throw new Error("Your session has expired — sign in again.");
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) throw new Error(json?.error ?? `Generation failed (HTTP ${res.status}).`);
      setData(json as Dataset);
      setParams(p);
      try {
        sessionStorage.setItem(LAST_PARAMS_KEY, JSON.stringify(p));
      } catch {
        /* storage unavailable — simulator falls back to its default dataset */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the generator. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const sendToSimulator = (key: TemplateKey) => {
    if (!data) return;
    const t = IMPORT_TEMPLATES.find((x) => x.key === key)!;
    const csv = toCsv(t.fields.map((f) => f.column), data.files[key]);
    window.dispatchEvent(
      new CustomEvent<LoadSampleDetail>(LOAD_EVENT, { detail: { template: key, csv, label: `${data.companyName} — ${t.title}` } }),
    );
    document.getElementById("simulator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const previewTemplate = previewKey ? IMPORT_TEMPLATES.find((t) => t.key === previewKey) : null;
  const previewRows = previewKey && data ? data.files[previewKey] : [];
  const injectedRows = new Set(data?.injected.filter((i) => i.template === previewKey).map((i) => `${i.row}:${i.column}`));

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-primary" />
        <CardTitle>Sample data generator</CardTitle>
      </div>
      <p className="mt-1 text-sm text-muted">
        Generate realistic, fully fictional master data for a business type. The same seed always produces the same data, so a trainer can hand out
        identical datasets. Turn on <strong>Inject errors</strong> to practise data cleansing — the answer key stays hidden until you reveal it.
      </p>

      <form
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault();
          generate();
        }}
        noValidate
      >
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="gen-business" className="mb-1 block text-xs font-medium text-muted">
            Business type
          </label>
          <select id="gen-business" value={business} onChange={(e) => setBusiness(e.target.value)} className={inputClass}>
            {Object.entries(BUSINESS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        {FIELDS.map((f) => {
          const err = fieldError(f.key);
          return (
            <div key={f.key}>
              <label htmlFor={`gen-${f.key}`} className="mb-1 block text-xs font-medium text-muted">
                {f.label}
              </label>
              <input
                id={`gen-${f.key}`}
                type="text"
                inputMode="numeric"
                value={nums[f.key]}
                onChange={(e) => setNums((n) => ({ ...n, [f.key]: e.target.value.replace(/[^\d]/g, "").slice(0, 6) }))}
                aria-invalid={Boolean(err)}
                aria-describedby={err ? `gen-${f.key}-err` : undefined}
                className={cn(inputClass, err && "border-danger focus:border-danger focus:ring-danger/20")}
              />
              {err && (
                <span id={`gen-${f.key}-err`} className="mt-0.5 block text-[0.6875rem] text-danger">
                  {f.min}–{f.max.toLocaleString()}
                </span>
              )}
            </div>
          );
        })}
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-fg">
          <input type="checkbox" checked={inject} onChange={(e) => setInject(e.target.checked)} className="accent-[var(--primary)]" />
          Inject errors
        </label>
        <div className="col-span-2 sm:col-span-3 lg:col-span-6">
          <button type="submit" disabled={busy} className={buttonClass("primary")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {busy ? "Generating…" : "Generate dataset"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-3">
          <Callout tone="danger">{error}</Callout>
        </div>
      )}

      {data && params && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-fg">
            Dataset for <strong>{data.companyName}</strong> (fictional · {BUSINESS_LABEL[params.business]} · seed {params.seed}
            {params.inject ? " · with injected errors" : ""}). Work through the files in import order:
          </p>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {[...IMPORT_TEMPLATES]
              .sort((a, b) => a.order - b.order)
              .map((t) => {
                const rows = data.files[t.key]?.length ?? 0;
                const problems = data.injected.filter((i) => i.template === t.key).length;
                return (
                  <li key={t.key} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-fg">
                      {t.order}. {t.title} <span className="text-muted">· {rows} rows</span>
                      {showKey && problems > 0 && (
                        <Badge tone="warning" className="ml-2">
                          {problems} injected
                        </Badge>
                      )}
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewKey(previewKey === t.key ? null : t.key)}
                        aria-pressed={previewKey === t.key}
                        className={buttonClass(previewKey === t.key ? "primary" : "ghost", "px-2.5 py-1 text-xs")}
                      >
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </button>
                      <button type="button" onClick={() => sendToSimulator(t.key)} className={buttonClass("ghost", "px-2.5 py-1 text-xs")}>
                        <FlaskConical className="h-3.5 w-3.5" /> Validate in simulator
                      </button>
                      <a href={`/api/sample-data?${sampleQuery(params)}&file=${t.key}`} className={buttonClass("secondary", "px-2.5 py-1 text-xs")} download>
                        <Download className="h-3.5 w-3.5" /> CSV
                      </a>
                    </span>
                  </li>
                );
              })}
          </ul>

          {previewTemplate && (
            <div>
              <div className="mb-1.5 text-sm font-medium text-fg">
                Preview — {previewTemplate.title} {previewRows.length > 10 && <span className="font-normal text-muted">(first 10 of {previewRows.length} rows)</span>}
              </div>
              <div className="max-h-80 overflow-auto rounded-lg border border-border">
                <table className="w-full whitespace-nowrap font-mono text-xs">
                  <thead className="sticky top-0 bg-surface-2">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-medium text-muted">#</th>
                      {previewTemplate.fields.map((f) => (
                        <th key={f.column} className="px-2 py-1.5 text-left font-medium text-muted">
                          {f.column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.slice(0, 10).map((r, i) => (
                      <tr key={i}>
                        <td className="px-2 py-1 text-muted">{i + 1}</td>
                        {previewTemplate.fields.map((f) => (
                          <td
                            key={f.column}
                            className={cn("px-2 py-1 text-fg", showKey && injectedRows.has(`${i + 1}:${f.column}`) && "bg-warning-soft font-semibold text-warning")}
                          >
                            {r[f.column] === "" ? <span className="text-muted/50">—</span> : r[f.column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.injected.length > 0 && (
            <div>
              <button type="button" onClick={() => setShowKey((s) => !s)} className="text-sm font-medium text-primary hover:underline" aria-expanded={showKey}>
                {showKey ? "Hide" : "Reveal"} answer key ({data.injected.length} injected problems)
              </button>
              {showKey && (
                <ul className="mt-2 space-y-1 text-sm">
                  {data.injected.map((i, idx) => (
                    <li key={idx} className="flex flex-wrap items-center gap-2">
                      <Badge tone="warning">{i.template}</Badge>
                      <span className="text-muted">
                        row {i.row}, {i.column}:
                      </span>
                      <span className="text-fg">{i.problem}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

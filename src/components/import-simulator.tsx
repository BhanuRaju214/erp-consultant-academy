"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, Download, FlaskConical, RotateCcw, Upload } from "lucide-react";
import { IMPORT_TEMPLATES, STANDARD_EXTERNAL_IDS, type TemplateKey } from "@/lib/import/templates";
import type { ValidationIssue, ValidationResult } from "@/lib/import/validator";
import { toCsv } from "@/lib/import/csv";
import { Badge, Callout, Card, CardTitle, buttonClass, cn, inputClass } from "./ui";
import { LAST_PARAMS_KEY, LOAD_EVENT, sampleQuery, type GeneratorParams, type LoadSampleDetail } from "./sample-generator";

type SimDb = Partial<Record<TemplateKey, string[]>>;
type ApiResult = ValidationResult & { header: string[] };

const STORAGE_KEY = "import-sim-db-v1";

function readSimDb(): SimDb {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as SimDb;
  } catch {
    return {};
  }
}

function writeSimDb(db: SimDb) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable: state lives for this page view only */
  }
}

function download(name: string, content: string) {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const SEVERITY_TONE = { error: "danger", warning: "warning", info: "info" } as const;

export function ImportSimulator({ initialTemplate }: { initialTemplate?: TemplateKey }) {
  const [templateKey, setTemplateKey] = useState<TemplateKey>(initialTemplate ?? "customers");
  const [simDb, setSimDb] = useState<SimDb>({});
  const [csv, setCsv] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info">("all");
  const [loadedMsg, setLoadedMsg] = useState<string>();

  const [source, setSource] = useState<string>();

  useEffect(() => setSimDb(readSimDb()), []);

  // Files sent from the sample data generator ("Validate in simulator").
  useEffect(() => {
    const onLoad = (e: Event) => {
      const { template: key, csv: text, label } = (e as CustomEvent<LoadSampleDetail>).detail;
      setTemplateKey(key);
      setFile(null);
      setCsv(text);
      setSource(label);
      setResult(null);
      setError(undefined);
      setLoadedMsg(undefined);
    };
    window.addEventListener(LOAD_EVENT, onLoad);
    return () => window.removeEventListener(LOAD_EVENT, onLoad);
  }, []);

  const template = IMPORT_TEMPLATES.find((t) => t.key === templateKey)!;
  const knownIds = useMemo(() => {
    const merged: SimDb = {};
    for (const t of IMPORT_TEMPLATES) {
      merged[t.key] = [...(STANDARD_EXTERNAL_IDS[t.key] ?? []), ...(simDb[t.key] ?? [])];
    }
    return merged;
  }, [simDb]);

  const reset = () => {
    setResult(null);
    setError(undefined);
    setLoadedMsg(undefined);
  };

  const loadSample = async (kind: "template" | "generated" | "errors") => {
    reset();
    setFile(null);
    const header = template.fields.map((f) => f.column);
    if (kind === "template") {
      setCsv(toCsv(header, template.sampleRows));
      setSource(`Template sample rows — ${template.title}`);
      return;
    }
    setBusy(true);
    try {
      // Reuse the trainee's last generator settings when available (same business type, seed and sizes).
      let params: GeneratorParams = { business: "trading", seed: 42, customers: 20, vendors: 8, products: 24, inject: false };
      try {
        const saved = sessionStorage.getItem(LAST_PARAMS_KEY);
        if (saved) params = { ...params, ...(JSON.parse(saved) as Partial<GeneratorParams>) };
      } catch {
        /* storage unavailable — use defaults */
      }
      params = { ...params, inject: kind === "errors" };
      const res = await fetch(`/api/sample-data?${sampleQuery(params)}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json) throw new Error(json?.error ?? `Generator failed (HTTP ${res.status})`);
      const data = json as { companyName: string; files: Record<TemplateKey, Record<string, string>[]> };
      setCsv(toCsv(header, data.files[templateKey]));
      setSource(`${data.companyName} — ${template.title} (seed ${params.seed}${params.inject ? ", with errors" : ""})`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate sample data.");
    } finally {
      setBusy(false);
    }
  };

  const validate = async () => {
    reset();
    if (!file && !csv.trim()) {
      setError("Upload a CSV/XLSX file, paste CSV content, or load a sample first.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("template", templateKey);
      fd.set("knownIds", JSON.stringify(knownIds));
      if (file) fd.set("file", file);
      else fd.set("csv", csv);
      const res = await fetch("/api/import/validate", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Validation failed (HTTP ${res.status})`);
      setResult(json as ApiResult);
      setFilter("all");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Validation failed.");
    } finally {
      setBusy(false);
    }
  };

  const loadIntoSimDb = () => {
    if (!result?.canImport) return;
    const existing = new Set(simDb[templateKey] ?? []);
    const created = result.createdIds.filter((id) => !existing.has(id));
    const next = { ...simDb, [templateKey]: [...existing, ...created] };
    setSimDb(next);
    writeSimDb(next);
    setLoadedMsg(
      `Simulated load complete: ${created.length} created, ${result.createdIds.length - created.length} updated (existing External IDs). ` +
        "Nothing was written to Odoo — repeat this import in your training database using the procedure on this page.",
    );
  };

  const clearSimDb = () => {
    setSimDb({});
    writeSimDb({});
    reset();
  };

  const issues = result?.issues.filter((i) => filter === "all" || i.severity === filter) ?? [];

  // Reconciliation: record counts + control totals of numeric columns.
  const recon = useMemo(() => {
    if (!result) return null;
    const numericCols = template.fields.filter((f) => (f.type === "decimal" || f.type === "integer") && result.header.includes(f.column));
    return {
      sourceRows: result.rowCount,
      validRows: result.validRows,
      distinctIds: new Set(result.cleansed.map((r) => r.id).filter(Boolean)).size,
      totals: numericCols.map((f) => ({
        column: f.column,
        total: result.cleansed.reduce((n, r) => n + (Number.isFinite(Number(r[f.column])) ? Number(r[f.column] || 0) : 0), 0),
      })),
    };
  }, [result, template]);

  const downloadRecon = () => {
    if (!recon || !result) return;
    const rows = [
      { check: "Source rows", source: String(recon.sourceRows), loaded: result.canImport ? String(recon.sourceRows) : "0", status: result.canImport ? "Match" : "Blocked" },
      { check: "Rows without errors", source: String(recon.validRows), loaded: "", status: "" },
      { check: "Distinct External IDs", source: String(recon.distinctIds), loaded: "", status: recon.distinctIds === recon.sourceRows ? "OK" : "Check duplicates/blank IDs" },
      ...recon.totals.map((t) => ({ check: `Control total: ${t.column}`, source: t.total.toFixed(2), loaded: "Fill in after real import", status: "" })),
      { check: "Errors", source: String(result.errorCount), loaded: "", status: "" },
      { check: "Warnings", source: String(result.warningCount), loaded: "", status: "" },
    ];
    download(`${templateKey}_reconciliation_report.csv`, toCsv(["check", "source", "loaded", "status"], rows));
  };

  return (
    <div className="space-y-5">
      <Callout tone="warning" title="Simulated validation">
        This simulator reproduces common Odoo import checks (required fields, data types, selection values, relational lookups, duplicates and
        dependency order) against a <strong>simulated</strong> database kept in your browser. It never connects to or writes into Odoo. Always run
        Odoo&apos;s own <em>Test</em> button in your training database before importing.
      </Callout>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <CardTitle>Import validation simulator</CardTitle>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sim-template" className="mb-1.5 block text-sm font-medium text-fg">
                Template
              </label>
              <select
                id="sim-template"
                className={inputClass}
                value={templateKey}
                onChange={(e) => {
                  setTemplateKey(e.target.value as TemplateKey);
                  reset();
                  setCsv("");
                  setFile(null);
                  setSource(undefined);
                }}
              >
                {IMPORT_TEMPLATES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.order}. {t.title} ({t.odooModel})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sim-file" className="mb-1.5 block text-sm font-medium text-fg">
                Upload CSV or XLSX
              </label>
              <input
                id="sim-file"
                type="file"
                accept=".csv,.xlsx,.txt"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setSource(undefined);
                  reset();
                }}
                className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="sim-csv" className="text-sm font-medium text-fg">
                …or paste CSV
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" className={buttonClass("ghost", "px-2 py-1 text-xs")} onClick={() => loadSample("template")}>
                  Load clean sample
                </button>
                <button type="button" className={buttonClass("ghost", "px-2 py-1 text-xs")} onClick={() => loadSample("generated")}>
                  Generated data
                </button>
                <button type="button" className={buttonClass("ghost", "px-2 py-1 text-xs text-warning")} onClick={() => loadSample("errors")}>
                  Generated data with errors
                </button>
              </div>
            </div>
            <textarea
              id="sim-csv"
              rows={8}
              value={csv}
              onChange={(e) => {
                setCsv(e.target.value);
                setFile(null);
                setSource(undefined);
              }}
              placeholder={template.fields.map((f) => f.column).join(",")}
              className={cn(inputClass, "font-mono text-xs")}
              spellCheck={false}
            />
            {file && <p className="mt-1 text-xs text-muted">Using uploaded file: {file.name} (pasted text is ignored)</p>}
            {!file && source && <p className="mt-1 text-xs text-muted">Loaded: {source}. Click Validate to test it.</p>}
          </div>
          {error && (
            <div className="mt-3">
              <Callout tone="danger">{error}</Callout>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={validate} disabled={busy} className={buttonClass("primary")}>
              <Upload className="h-4 w-4" /> {busy ? "Validating…" : "Validate (simulated Test)"}
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <CardTitle>Simulated database</CardTitle>
          </div>
          <p className="mt-1 text-xs text-muted">External IDs &quot;loaded&quot; so far (stored only in this browser). Standard Odoo records such as product.product_category_all are always available.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {IMPORT_TEMPLATES.map((t) => (
              <li key={t.key} className="flex items-center justify-between">
                <span className="text-fg">
                  {t.order}. {t.title}
                </span>
                <Badge tone={(simDb[t.key]?.length ?? 0) > 0 ? "success" : "neutral"}>{simDb[t.key]?.length ?? 0}</Badge>
              </li>
            ))}
          </ul>
          <button type="button" onClick={clearSimDb} className={buttonClass("ghost", "mt-4 w-full")}>
            <RotateCcw className="h-4 w-4" /> Reset simulated database
          </button>
        </Card>
      </div>

      {result && (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Validation result — {template.title}</CardTitle>
              <p className="mt-1 text-sm text-muted">
                {result.rowCount} rows · {result.validRows} without errors · {result.errorCount} errors · {result.warningCount} warnings
              </p>
            </div>
            <Badge tone={result.canImport ? "success" : "danger"} className="text-sm">
              {result.canImport ? "Ready to import" : "Import blocked"}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {result.canImport && (
              <button type="button" onClick={loadIntoSimDb} className={buttonClass("primary")}>
                <Database className="h-4 w-4" /> Load into simulated database
              </button>
            )}
            <button
              type="button"
              className={buttonClass("secondary")}
              onClick={() => download(`${templateKey}_cleansed.csv`, toCsv(result.header, result.cleansed))}
            >
              <Download className="h-4 w-4" /> Download cleansed file
            </button>
            <button type="button" className={buttonClass("secondary")} onClick={downloadRecon}>
              <Download className="h-4 w-4" /> Reconciliation report
            </button>
          </div>
          {loadedMsg && (
            <div className="mt-3">
              <Callout tone="success">{loadedMsg}</Callout>
            </div>
          )}
          <p className="mt-2 text-xs text-muted">
            The cleansed file only applies safe mechanical fixes (trimming, boolean/email/case normalisation). Business decisions — merging duplicates,
            mapping unknown payment terms — remain yours.
          </p>

          {recon && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Mini label="Source rows" value={recon.sourceRows} />
              <Mini label="Valid rows" value={recon.validRows} />
              <Mini label="Distinct External IDs" value={recon.distinctIds} />
              {recon.totals.map((t) => (
                <Mini key={t.column} label={`Σ ${t.column}`} value={t.total.toLocaleString(undefined, { maximumFractionDigits: 2 })} />
              ))}
            </div>
          )}

          {result.issues.length > 0 && (
            <>
              <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Filter issues">
                {(["all", "error", "warning", "info"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                    className={cn("rounded-full border px-3 py-1 text-xs capitalize", filter === f ? "border-primary bg-primary-soft text-primary" : "border-border text-muted")}
                  >
                    {f} ({f === "all" ? result.issues.length : result.issues.filter((i) => i.severity === f).length})
                  </button>
                ))}
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase text-muted">
                      <th className="py-2 pr-3 font-medium">Row</th>
                      <th className="py-2 pr-3 font-medium">Column</th>
                      <th className="py-2 pr-3 font-medium">Severity</th>
                      <th className="py-2 pr-3 font-medium">Problem</th>
                      <th className="py-2 font-medium">How to fix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {issues.slice(0, 300).map((i: ValidationIssue, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-2 pr-3 text-muted">{i.row === null ? "file" : i.row === 0 ? "header" : i.row}</td>
                        <td className="py-2 pr-3 font-mono text-xs text-fg">{i.column ?? "—"}</td>
                        <td className="py-2 pr-3">
                          <Badge tone={SEVERITY_TONE[i.severity]}>{i.severity}</Badge>
                        </td>
                        <td className="py-2 pr-3 text-fg">{i.message}</td>
                        <td className="py-2 text-muted">{i.fix}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {issues.length > 300 && <p className="mt-2 text-xs text-muted">Showing the first 300 of {issues.length} issues.</p>}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3">
      <div className="truncate text-xs text-muted" title={label}>
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold text-fg">{value}</div>
    </div>
  );
}

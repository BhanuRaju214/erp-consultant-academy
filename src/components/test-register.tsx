"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { createTestCase, deleteTestCase, recordTestResult, type TestCaseState } from "@/app/actions/testing";
import { Badge, Callout, Card, CardTitle, buttonClass, cn, inputClass } from "./ui";

export interface TestCaseRow {
  id: string;
  code: string;
  requirementId: string;
  module: string;
  scenario: string;
  preconditions: string;
  testData: string;
  steps: string;
  expected: string;
  actual: string;
  status: "not_run" | "pass" | "fail" | "blocked";
  defectId: string;
  remarks: string;
}

const STATUS_TONE = { not_run: "neutral", pass: "success", fail: "danger", blocked: "warning" } as const;
const STATUS_LABEL = { not_run: "Not run", pass: "Pass", fail: "Fail", blocked: "Blocked" } as const;

export function NewTestCaseForm() {
  const [state, action, pending] = useActionState<TestCaseState, FormData>(createTestCase, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const f = (name: string, label: string, opts: { area?: boolean; required?: boolean; placeholder?: string } = {}) => (
    <div className={opts.area ? "sm:col-span-2" : undefined}>
      <label htmlFor={`tc-${name}`} className="mb-1 block text-xs font-medium text-muted">
        {label}
        {opts.required && " *"}
      </label>
      {opts.area ? (
        <textarea id={`tc-${name}`} name={name} rows={3} className={inputClass} placeholder={opts.placeholder} />
      ) : (
        <input id={`tc-${name}`} name={name} className={inputClass} placeholder={opts.placeholder} />
      )}
    </div>
  );
  return (
    <Card>
      <CardTitle>Add a test case</CardTitle>
      <form ref={ref} action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
        {f("code", "Test Case ID", { required: true, placeholder: "TC-101" })}
        {f("requirementId", "Requirement ID", { placeholder: "REQ-04" })}
        {f("module", "Module", { required: true, placeholder: "Sales" })}
        {f("scenario", "Scenario", { required: true, placeholder: "Confirm a quotation with a customer pricelist" })}
        {f("preconditions", "Preconditions", { area: true })}
        {f("testData", "Test data", { area: true })}
        {f("steps", "Steps", { area: true, required: true, placeholder: "1. …\n2. …" })}
        {f("expected", "Expected result", { area: true, required: true })}
        <div className="flex items-center gap-3 sm:col-span-2">
          <button disabled={pending} className={buttonClass("primary")}>
            {pending ? "Saving…" : "Add test case"}
          </button>
          {state.error && <span className="text-sm text-danger">{state.error}</span>}
          {state.ok && <span className="text-sm text-success">Added.</span>}
        </div>
      </form>
    </Card>
  );
}

function ResultEditor({ tc }: { tc: TestCaseRow }) {
  const [actual, setActual] = useState(tc.actual);
  const [status, setStatus] = useState(tc.status);
  const [defectId, setDefectId] = useState(tc.defectId);
  const [remarks, setRemarks] = useState(tc.remarks);
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
  const [pending, start] = useTransition();
  return (
    <div className="mt-3 grid gap-3 rounded-lg bg-surface-2 p-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor={`a-${tc.id}`} className="mb-1 block text-xs font-medium text-muted">
          Actual result
        </label>
        <textarea id={`a-${tc.id}`} rows={2} value={actual} onChange={(e) => setActual(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor={`s-${tc.id}`} className="mb-1 block text-xs font-medium text-muted">
          Status
        </label>
        <select id={`s-${tc.id}`} value={status} onChange={(e) => setStatus(e.target.value as TestCaseRow["status"])} className={inputClass}>
          {Object.entries(STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`d-${tc.id}`} className="mb-1 block text-xs font-medium text-muted">
          Defect ID {status === "fail" && "*"}
        </label>
        <input id={`d-${tc.id}`} value={defectId} onChange={(e) => setDefectId(e.target.value)} className={inputClass} placeholder="DEF-001" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`r-${tc.id}`} className="mb-1 block text-xs font-medium text-muted">
          Remarks
        </label>
        <input id={`r-${tc.id}`} value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputClass} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="button"
          disabled={pending}
          className={buttonClass("primary")}
          onClick={() =>
            start(async () => {
              const res = await recordTestResult({ id: tc.id, actual, status, defectId, remarks });
              setMsg(res.ok ? { ok: true, text: "Result saved." } : { ok: false, text: res.error ?? "Could not save." });
            })
          }
        >
          Save result
        </button>
        <button type="button" disabled={pending} onClick={() => start(() => deleteTestCase(tc.id))} className={buttonClass("ghost", "text-danger")} aria-label={`Delete ${tc.code}`}>
          <Trash2 className="h-4 w-4" /> Delete
        </button>
        {msg && <span className={cn("text-sm", msg.ok ? "text-success" : "text-danger")}>{msg.text}</span>}
      </div>
    </div>
  );
}

export function TestRegister({ rows }: { rows: TestCaseRow[] }) {
  const [moduleFilter, setModuleFilter] = useState("all");
  const modules = Array.from(new Set(rows.map((r) => r.module)));
  const visible = rows.filter((r) => moduleFilter === "all" || r.module === moduleFilter);
  if (!rows.length) {
    return <Callout>Your register is empty. Add a test case above, or copy the predefined ones from Project A (Real-Time Business Projects ▸ Test cases).</Callout>;
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="mod-filter" className="text-sm text-muted">
          Module
        </label>
        <select id="mod-filter" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className={cn(inputClass, "w-auto")}>
          <option value="all">All modules</option>
          {modules.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <a href="/api/test-cases/export" className={buttonClass("secondary", "ml-auto text-xs")}>
          Export register (CSV)
        </a>
      </div>
      {visible.map((tc) => (
        <details key={tc.id} className="rounded-xl border border-border bg-surface p-4">
          <summary className="flex cursor-pointer flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted">{tc.code}</span>
            {tc.requirementId && <span className="font-mono text-xs text-muted">· {tc.requirementId}</span>}
            <Badge>{tc.module}</Badge>
            <span className="flex-1 text-sm font-medium text-fg">{tc.scenario}</span>
            <Badge tone={STATUS_TONE[tc.status]}>{STATUS_LABEL[tc.status]}</Badge>
            {tc.defectId && <Badge tone="danger">{tc.defectId}</Badge>}
          </summary>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            {(
              [
                ["Preconditions", tc.preconditions],
                ["Test data", tc.testData],
                ["Steps", tc.steps],
                ["Expected result", tc.expected],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-semibold uppercase text-muted">{k}</dt>
                <dd className="whitespace-pre-line text-fg">{v || "—"}</dd>
              </div>
            ))}
          </dl>
          <ResultEditor tc={tc} />
        </details>
      ))}
    </div>
  );
}

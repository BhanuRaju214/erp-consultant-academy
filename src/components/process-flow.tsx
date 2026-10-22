"use client";

import { useState } from "react";
import { ArrowRight, Building2, FileText, Landmark, Monitor, ShieldCheck, User } from "lucide-react";
import type { ProcessStep } from "@/content/types";
import { cn } from "./ui";

/** Interactive process diagram: click a step to see actor, document, Odoo handling and impact. */
export function ProcessFlow({ steps }: { steps: ProcessStep[] }) {
  const [active, setActive] = useState(0);
  const step = steps[active];
  const departments = Array.from(new Set(steps.map((s) => s.department)));
  const deptColor = (d: string) => ["bg-indigo-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-teal-500"][departments.indexOf(d) % 7];

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted">
        {departments.map((d) => (
          <span key={d} className="flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", deptColor(d))} aria-hidden /> {d}
          </span>
        ))}
      </div>
      <ol className="flex gap-1 overflow-x-auto pb-3" aria-label="Process steps">
        {steps.map((s, i) => (
          <li key={s.id} className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-current={i === active ? "step" : undefined}
              className={cn(
                "flex w-36 flex-col items-start rounded-lg border p-2.5 text-left transition",
                i === active ? "border-primary bg-primary-soft shadow-sm" : "border-border bg-surface hover:border-primary/50",
              )}
            >
              <span className="flex items-center gap-1.5 text-[0.6875rem] font-semibold text-muted">
                <span className={cn("h-2 w-2 rounded-full", deptColor(s.department))} aria-hidden />
                Step {i + 1}
              </span>
              <span className="mt-1 text-sm font-medium leading-snug text-fg">{s.title}</span>
              {s.approval && <span className="mt-1 text-[0.625rem] font-medium uppercase text-warning">Approval</span>}
            </button>
            {i < steps.length - 1 && <ArrowRight className="mx-1 h-4 w-4 shrink-0 text-muted" aria-hidden />}
          </li>
        ))}
      </ol>

      <div className="mt-2 rounded-xl border border-border bg-surface p-5" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold text-fg">
            {active + 1}. {step.title}
          </h3>
          <div className="flex gap-2">
            <button type="button" disabled={active === 0} onClick={() => setActive((a) => a - 1)} className="rounded px-2 py-1 text-sm text-muted hover:bg-surface-2 disabled:opacity-40">
              ← Prev
            </button>
            <button type="button" disabled={active === steps.length - 1} onClick={() => setActive((a) => a + 1)} className="rounded px-2 py-1 text-sm text-muted hover:bg-surface-2 disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-fg">{step.description}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Detail icon={User} label="Actor">
            {step.actor}
          </Detail>
          <Detail icon={Building2} label="Department">
            {step.department}
          </Detail>
          {step.document && (
            <Detail icon={FileText} label="Business document">
              {step.document}
            </Detail>
          )}
          {step.approval && (
            <Detail icon={ShieldCheck} label="Approval">
              {step.approval}
            </Detail>
          )}
          <Detail icon={Monitor} label="In Odoo" wide>
            {step.odoo}
          </Detail>
          {step.impact && (
            <Detail icon={Landmark} label="Accounting / inventory impact" wide>
              {step.impact}
            </Detail>
          )}
        </dl>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, children, wide }: { icon: typeof User; label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn("rounded-lg bg-surface-2 p-3", wide && "sm:col-span-2")}>
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
      </dt>
      <dd className="mt-1 text-fg">{children}</dd>
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowDown, ArrowRight, Check, CircleCheck, CornerDownRight, CircleHelp, ListTree, MousePointerClick, RotateCcw, Target, TriangleAlert, ZoomIn, X } from "lucide-react";
import type { VisualData } from "@/lib/visuals/schemas";
import { cn } from "../ui";
import { VisualIcon } from "./icons";
import { InlineMd, VisualFrame, toneBg, type Tone } from "./static-blocks";
import { useStaticRender } from "./static-context";

/** Captions that tell the reader to click make no sense in a static image. */
function staticCaption(caption?: string) {
  return caption && !/^(click|select|tap|choose)/i.test(caption.trim()) ? caption : undefined;
}

/* ------------------------------------------------------------------ */
/* Hub (concept diagram)                                               */
/* ------------------------------------------------------------------ */

type Hub = VisualData<"hub">;

function HubDiagram({ hub, dark = false, label }: { hub: Pick<Hub, "center" | "nodes">; dark?: boolean; label: string }) {
  const [active, setActive] = useState<number | null>(null);
  const n = hub.nodes.length;
  const pos = hub.nodes.map((_, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    return { x: 50 + 38 * Math.cos(a), y: 50 + 38 * Math.sin(a) };
  });
  const sel = active !== null ? hub.nodes[active] : null;
  const hasDetails = hub.nodes.some((x) => x.detail);
  const isStatic = useStaticRender();
  return (
    <div>
      {/* Radial layout from sm up */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[26rem] sm:block" role="group" aria-label={label}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          {pos.map((p, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              strokeWidth={active === i ? 0.9 : 0.5}
              strokeDasharray={active === i ? undefined : "1.5 1.5"}
              className={cn("transition-all", active === i ? "stroke-[var(--accent)]" : dark ? "stroke-white/30" : "stroke-[var(--border)]")}
            />
          ))}
        </svg>
        <div className="absolute left-1/2 top-1/2 flex h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-primary p-2 text-center text-primary-fg shadow-lg ring-8 ring-primary/15">
          <VisualIcon name={hub.center.icon ?? "database"} className="h-6 w-6" />
          <span className="mt-1 text-[0.6875rem] font-semibold leading-tight">{hub.center.label}</span>
        </div>
        {hub.nodes.map((node, i) => (
          <button
            key={node.label}
            type="button"
            onClick={() => setActive(active === i ? null : i)}
            onMouseEnter={() => setActive(i)}
            aria-pressed={active === i}
            style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%` }}
            className={cn(
              "absolute flex w-[23%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl border px-1.5 py-2 text-center shadow-sm transition",
              active === i
                ? "border-accent bg-accent text-white"
                : dark
                  ? "border-white/15 bg-white/10 text-white hover:bg-white/20"
                  : "border-border bg-surface text-fg hover:border-primary",
            )}
          >
            <VisualIcon name={node.icon} className="h-5 w-5" />
            <span className="text-[0.6875rem] font-medium leading-tight">{node.label}</span>
          </button>
        ))}
      </div>
      {/* Stacked layout on phones */}
      <div className="sm:hidden">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-fg">
          <VisualIcon name={hub.center.icon ?? "database"} className="h-4 w-4" /> {hub.center.label}
        </div>
        <div className={cn("mx-auto h-4 w-px", dark ? "bg-white/30" : "bg-border")} aria-hidden />
        <div className="grid grid-cols-2 gap-2">
          {hub.nodes.map((node, i) => (
            <button
              key={node.label}
              type="button"
              onClick={() => setActive(active === i ? null : i)}
              aria-pressed={active === i}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium",
                active === i ? "border-accent bg-accent text-white" : dark ? "border-white/15 bg-white/10 text-white" : "border-border bg-surface text-fg",
              )}
            >
              <VisualIcon name={node.icon} className="h-4 w-4 shrink-0" /> {node.label}
            </button>
          ))}
        </div>
      </div>
      {hasDetails && isStatic && (
        <dl className={cn("mt-3 grid gap-2 text-sm sm:grid-cols-2", dark ? "text-white/90" : "text-fg")}>
          {hub.nodes.filter((x) => x.detail).map((x) => (
            <div key={x.label} className={cn("rounded-lg px-3 py-2", dark ? "bg-white/10" : "bg-surface-2")}>
              <dt className="font-semibold">{x.label}</dt>
              <dd className="mt-0.5">
                <InlineMd>{x.detail!}</InlineMd>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {hasDetails && !isStatic && (
        <div className={cn("mt-3 min-h-12 rounded-xl px-4 py-3 text-sm", dark ? "bg-white/10 text-white/90" : "bg-surface-2 text-fg")} aria-live="polite">
          {sel?.detail ? (
            <>
              <span className="font-semibold">{sel.label}: </span>
              <InlineMd>{sel.detail}</InlineMd>
            </>
          ) : (
            <span className={cn("flex items-center gap-2", dark ? "text-white/70" : "text-muted")}>
              <MousePointerClick className="h-4 w-4" aria-hidden /> Select a module to see how it connects.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function HubBlock({ data }: { data: Hub }) {
  return (
    <VisualFrame kind="Concept map" title={data.title} caption={data.caption}>
      <HubDiagram hub={data} label={data.title ?? data.center.label} />
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function HeroBlock({ data }: { data: VisualData<"hero"> }) {
  return (
    <section className="not-prose mb-10 overflow-hidden rounded-2xl bg-sidebar text-white shadow-sm" aria-label="Lesson introduction">
      <div className={cn("grid gap-6 p-5 sm:p-7", data.hub && "lg:grid-cols-[1.1fr_1fr] lg:items-center")}>
        <div>
          {data.eyebrow && <div className="text-xs font-semibold uppercase tracking-wider text-brand">{data.eyebrow}</div>}
          <div className="mt-1 text-2xl font-semibold leading-tight sm:text-3xl">{data.title}</div>
          {data.subtitle && <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">{data.subtitle}</p>}
          <div className="mt-5 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
              <Target className="h-4 w-4 text-brand" aria-hidden /> By the end of this lesson you can
            </div>
            <ul className="mt-2 space-y-1.5 text-sm">
              {data.objectives.map((o) => (
                <li key={o} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                  <InlineMd>{o}</InlineMd>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {data.hub && <HubDiagram hub={data.hub} dark label={`${data.title} concept diagram`} />}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Flow                                                                */
/* ------------------------------------------------------------------ */

export function FlowBlock({ data }: { data: VisualData<"flow"> }) {
  const [active, setActive] = useState(0);
  const isStatic = useStaticRender();
  if (data.compact) {
    return (
      <div className="not-prose my-6" role="group" aria-label={data.title ?? "Process sequence"}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {data.steps.map((s, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-soft px-3 py-1 text-sm font-medium text-fg">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.625rem] font-bold text-primary-fg">{i + 1}</span>
                {s.title}
              </span>
              {i < data.steps.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />}
            </li>
          ))}
        </ol>
      </div>
    );
  }
  const interactive = data.steps.some((s) => s.detail || s.actor || s.document || s.odoo || s.impact);
  const step = data.steps[active];
  return (
    <VisualFrame kind="Process flow" title={data.title} caption={isStatic ? staticCaption(data.caption) : data.caption}>
      <ol className={cn("flex flex-col gap-1 md:flex-row md:items-stretch md:gap-0", data.steps.length > 6 && "md:flex-wrap md:gap-y-3")} aria-label="Process steps">
        {data.steps.map((s, i) => (
          <li key={i} className={cn("flex flex-col items-stretch md:flex-row md:items-center", data.steps.length <= 6 ? "md:min-w-0 md:flex-1" : "md:w-1/4")}>
            <button
              type="button"
              disabled={!interactive}
              onClick={() => setActive(i)}
              aria-current={interactive && i === active ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition md:h-full md:flex-col md:items-start md:gap-2",
                "md:min-w-0 md:flex-1",
                interactive && i === active ? "border-primary bg-primary-soft shadow-sm" : "border-border bg-surface",
                interactive && i !== active && "hover:border-primary/50",
                !interactive && "cursor-default",
              )}
            >
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", interactive && i === active ? "bg-primary text-primary-fg" : "bg-surface-2 text-primary")}>
                <VisualIcon name={s.icon ?? "workflow"} className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.625rem] font-semibold uppercase tracking-wide text-muted">Step {i + 1}</span>
                <span className="block text-sm font-semibold leading-snug text-fg">{s.title}</span>
                {s.app && <span className="mt-1 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[0.625rem] font-semibold text-accent">{s.app}</span>}
                {s.parallel && (
                  <span className="mt-2 grid gap-1.5">
                    <span className="text-[0.625rem] font-semibold uppercase tracking-wide text-muted">In parallel</span>
                    {s.parallel.map((p) => (
                      <span key={p.title} className="flex items-start gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-fg">
                        <VisualIcon name={p.icon ?? "workflow"} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="min-w-0">
                          <span className="font-medium">{p.title}</span>
                          {p.app && <span className="ml-1 text-[0.625rem] font-semibold text-accent">· {p.app}</span>}
                          {p.detail && <span className="block text-[0.6875rem] leading-snug text-muted">{p.detail}</span>}
                        </span>
                      </span>
                    ))}
                  </span>
                )}
                {s.branch && (
                  <span className={cn("mt-2 flex items-start gap-1 rounded-lg px-2 py-1 text-[0.6875rem] leading-snug", toneBg[(s.branch.tone as Tone) ?? "warning"])}>
                    <CornerDownRight className="mt-px h-3 w-3 shrink-0" aria-hidden />
                    <span>
                      <span className="font-semibold">{s.branch.when}:</span> {s.branch.result}
                    </span>
                  </span>
                )}
              </span>
            </button>
            {i < data.steps.length - 1 && (
              <span className="flex justify-center py-0.5 text-muted md:px-1 md:py-0" aria-hidden>
                <ArrowDown className="h-4 w-4 md:hidden" />
                <ArrowRight className="hidden h-4 w-4 md:block" />
              </span>
            )}
          </li>
        ))}
      </ol>
      {data.loop && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-soft/40 px-3 py-2 text-sm text-fg">
          <RotateCcw className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>
            <span className="font-semibold">Repeat: </span>
            <InlineMd>{data.loop}</InlineMd>
          </span>
        </div>
      )}
      {interactive && isStatic && (
        <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {data.steps.map((s, i) => {
            const facts = [["Who", s.actor], ["Document", s.document], ["In Odoo", s.odoo], ["Impact", s.impact]].filter(([, v]) => v);
            if (!s.detail && !facts.length) return null;
            return (
              <li key={i} className="rounded-xl bg-surface-2 p-3">
                <div className="font-semibold text-fg">
                  {i + 1}. {s.title}
                </div>
                {s.detail && <InlineMd className="mt-0.5 block leading-relaxed text-fg">{s.detail}</InlineMd>}
                {facts.map(([k, v]) => (
                  <div key={k} className="mt-1 text-muted">
                    <span className="font-semibold text-fg">{k}: </span>
                    <InlineMd>{v!}</InlineMd>
                  </div>
                ))}
              </li>
            );
          })}
        </ol>
      )}
      {interactive && step && !isStatic && (
        <div className="mt-4 rounded-xl bg-surface-2 p-4" aria-live="polite">
          <div className="font-semibold text-fg">
            {active + 1}. {step.title}
          </div>
          {step.detail && <InlineMd className="mt-1 block text-sm leading-relaxed text-fg">{step.detail}</InlineMd>}
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {(
              [
                ["Who", step.actor],
                ["Document", step.document],
                ["In Odoo", step.odoo],
                ["Accounting / stock impact", step.impact],
              ] as const
            )
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="rounded-lg bg-surface p-2.5">
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">{k}</dt>
                  <dd className="mt-0.5 text-fg">
                    <InlineMd>{v!}</InlineMd>
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      )}
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Decision tree                                                       */
/* ------------------------------------------------------------------ */

type DecisionData = VisualData<"decision">;
type DNode = DecisionData["nodes"][string];

function TreeOutline({ data, id, seen = new Set<string>() }: { data: DecisionData; id: string; seen?: Set<string> }) {
  const node: DNode | undefined = data.nodes[id];
  if (!node || seen.has(id)) return null;
  const next = new Set(seen).add(id);
  if ("result" in node) {
    return (
      <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", toneBg[(node.tone as Tone) ?? "info"])}>{node.result}</span>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-fg">
        <CircleHelp className="h-4 w-4 text-primary" aria-hidden /> {node.question}
      </div>
      <ul className="ml-2 mt-1 space-y-1 border-l border-border pl-3">
        {node.options.map((o) => (
          <li key={o.label} className="text-sm">
            <span className="mr-1.5 rounded bg-surface-2 px-1.5 py-0.5 text-xs font-semibold text-muted">{o.label}</span>
            <span className="mt-1 block">
              <TreeOutline data={data} id={o.next} seen={next} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DecisionBlock({ data }: { data: DecisionData }) {
  const [path, setPath] = useState<{ id: string; choice?: string }[]>([{ id: data.start }]);
  const isStatic = useStaticRender();
  const [showTree, setShowTree] = useState(isStatic);
  const current = data.nodes[path[path.length - 1].id];
  const choose = (label: string, next: string) =>
    setPath((p) => [...p.slice(0, -1), { ...p[p.length - 1], choice: label }, { id: next }]);

  return (
    <VisualFrame kind="Decision tree" title={data.title} caption={isStatic ? staticCaption(data.caption) : data.caption}>
      {isStatic ? (
        <TreeOutline data={data} id={data.start} />
      ) : (
      <>
      {path.length > 1 && (
        <ol className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted" aria-label="Your answers so far">
          {path.slice(0, -1).map((p, i) => {
            const n = data.nodes[p.id];
            return (
              <li key={i} className="flex items-center gap-1">
                <button type="button" onClick={() => setPath(path.slice(0, i + 1).map((x, j) => (j === i ? { id: x.id } : x)))} className="rounded bg-surface-2 px-1.5 py-0.5 hover:text-fg" title="Go back to this question">
                  {"question" in n ? n.question : ""} <strong className="text-fg">{p.choice}</strong>
                </button>
                <ArrowRight className="h-3 w-3" aria-hidden />
              </li>
            );
          })}
        </ol>
      )}
      <div aria-live="polite">
        {"question" in current ? (
          <div className="rounded-xl border border-primary/30 bg-primary-soft/50 p-4">
            <div className="flex items-start gap-2 font-semibold text-fg">
              <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden /> {current.question}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {current.options.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => choose(o.label, o.next)}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg transition hover:border-primary hover:text-primary"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("rounded-xl p-4", toneBg[(current.tone as Tone) ?? "info"])}>
            <div className="flex items-start gap-2 font-semibold">
              {current.tone === "success" ? <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> : <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />}
              {current.result}
            </div>
            {current.detail && <InlineMd className="mt-1 block text-sm text-fg">{current.detail}</InlineMd>}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {path.length > 1 && (
          <button type="button" onClick={() => setPath([{ id: data.start }])} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-fg">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start again
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowTree((s) => !s)}
          aria-expanded={showTree}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-fg"
        >
          <ListTree className="h-3.5 w-3.5" aria-hidden /> {showTree ? "Hide" : "Show"} the whole tree
        </button>
      </div>
      </>
      )}
      {showTree && !isStatic && (
        <div className="mt-3 rounded-xl border border-border p-4">
          <TreeOutline data={data} id={data.start} />
        </div>
      )}
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Knowledge check (practice, not graded)                              */
/* ------------------------------------------------------------------ */

export function CheckBlock({ data }: { data: VisualData<"check"> }) {
  const [choice, setChoice] = useState<number | null>(null);
  const name = useId();
  const answered = choice !== null;
  const right = choice === data.correct;
  return (
    <VisualFrame kind="Quick check" title="Test your understanding">
      <fieldset>
        <legend className="font-medium text-fg">
          <InlineMd>{data.question}</InlineMd>
        </legend>
        <div className="mt-3 grid gap-2">
          {data.options.map((o, i) => (
            <label
              key={i}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition",
                answered && i === data.correct ? "border-success bg-success-soft" : answered && i === choice ? "border-danger bg-danger-soft" : "border-border hover:bg-surface-2",
              )}
            >
              <input type="radio" name={name} checked={choice === i} onChange={() => setChoice(i)} className="mt-0.5 accent-[var(--primary)]" />
              <InlineMd className="text-fg">{o}</InlineMd>
            </label>
          ))}
        </div>
      </fieldset>
      {answered && (
        <div className={cn("mt-3 rounded-lg p-3 text-sm", right ? "bg-success-soft" : "bg-warning-soft")} role="status">
          <span className={cn("font-semibold", right ? "text-success" : "text-warning")}>{right ? "Correct. " : "Not quite. "}</span>
          <InlineMd className="text-fg">{data.explanation}</InlineMd>
          {!right && (
            <button type="button" onClick={() => setChoice(null)} className="ml-2 text-xs font-medium text-primary underline">
              Try again
            </button>
          )}
        </div>
      )}
      <p className="mt-2 text-[0.6875rem] text-muted">Practice question — not graded.</p>
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Annotated Odoo screen mockup                                        */
/* ------------------------------------------------------------------ */

function Marker({ n, active, onSelect }: { n?: number; active: number | null; onSelect: (n: number) => void }) {
  if (!n) return null;
  return (
    <button
      type="button"
      onClick={() => onSelect(n)}
      aria-label={`Annotation ${n}`}
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold ring-2 ring-surface transition",
        active === n ? "scale-125 bg-accent text-white" : "bg-warning text-white hover:scale-110",
      )}
    >
      {n}
    </button>
  );
}

export function MockupBlock({ data }: { data: VisualData<"mockup"> }) {
  const [active, setActive] = useState<number | null>(null);
  const hl = (n?: number) => (n && active === n ? "outline outline-2 outline-offset-2 outline-[var(--accent)] rounded" : "");
  return (
    <VisualFrame kind="Odoo screen" title={data.title} caption={data.note}>
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-warning-soft px-2 py-1 text-[0.6875rem] font-semibold text-warning">
        <TriangleAlert className="h-3.5 w-3.5" aria-hidden /> Illustrative mockup — not an Odoo screenshot
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Window */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface text-[0.8125rem] shadow-sm" aria-hidden="false">
          <div className="flex items-center gap-2 bg-[#714b67] px-3 py-1.5 text-xs font-medium text-white">
            <span className="flex gap-1" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-white/40" />
              <span className="h-2 w-2 rounded-full bg-white/40" />
              <span className="h-2 w-2 rounded-full bg-white/40" />
            </span>
            {data.app}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
            <div className="text-sm text-muted">
              {data.breadcrumb.map((b, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-1">/</span>}
                  <span className={i === data.breadcrumb.length - 1 ? "font-semibold text-fg" : "text-primary"}>{b}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-2/60 px-3 py-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {data.buttons.map((b) => (
                <span key={b.label} className={cn("inline-flex items-center gap-1", hl(b.marker))}>
                  <span className={cn("rounded px-2 py-1 text-xs font-medium", b.primary ? "bg-[#714b67] text-white" : "border border-border bg-surface text-fg")}>{b.label}</span>
                  <Marker n={b.marker} active={active} onSelect={setActive} />
                </span>
              ))}
            </div>
            {data.status && (
              <ol className="flex overflow-hidden rounded border border-border text-[0.6875rem]" aria-label="Status bar">
                {data.status.steps.map((s, i) => (
                  <li
                    key={s}
                    aria-current={i === data.status!.current ? "step" : undefined}
                    className={cn("px-2 py-1", i > 0 && "border-l border-border", i === data.status!.current ? "bg-primary-soft font-semibold text-primary" : "text-muted")}
                  >
                    {s}
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="p-3 sm:p-4">
            <dl className="grid gap-y-2">
              {data.fields.map((f) => (
                <div key={f.label} className={cn("flex items-baseline gap-2 border-b border-dashed border-border pb-1", hl(f.marker))}>
                  <dt className="w-36 shrink-0 text-xs font-semibold text-muted">{f.label}</dt>
                  <dd className="flex min-w-0 flex-1 items-baseline justify-between gap-2 break-words text-fg">
                    <span>{f.value}</span>
                    <Marker n={f.marker} active={active} onSelect={setActive} />
                  </dd>
                </div>
              ))}
            </dl>
            {data.lines && (
              <div className={cn("mt-4 overflow-x-auto", hl(data.lines.marker))}>
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-fg">
                  <span className="border-b-2 border-[#714b67] pb-0.5">Order Lines</span>
                  <Marker n={data.lines.marker} active={active} onSelect={setActive} />
                </div>
                <table className="w-full whitespace-nowrap text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted">
                      {data.lines.columns.map((c) => (
                        <th key={c} className="py-1.5 pr-3 font-semibold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.lines.rows.map((r, i) => (
                      <tr key={i} className="border-b border-border/60">
                        {r.map((c, j) => (
                          <td key={j} className="py-1.5 pr-3 text-fg">
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* Legend */}
        {data.annotations.length > 0 && (
          <ol className="space-y-2">
            {data.annotations.map((a) => (
              <li key={a.marker}>
                <button
                  type="button"
                  onClick={() => setActive(active === a.marker ? null : a.marker)}
                  aria-pressed={active === a.marker}
                  className={cn("flex w-full gap-3 rounded-xl border p-3 text-left transition", active === a.marker ? "border-accent bg-primary-soft" : "border-border hover:border-primary/40")}
                >
                  <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", active === a.marker ? "bg-accent" : "bg-warning")}>{a.marker}</span>
                  <span className="text-sm">
                    <span className="block font-semibold text-fg">{a.title}</span>
                    <InlineMd className="block text-muted">{a.text}</InlineMd>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Figure (Napkin AI exports, approved images)                         */
/* ------------------------------------------------------------------ */

export function FigureBlock({ data }: { data: VisualData<"figure"> }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <figure className="not-prose my-8">
      <button type="button" onClick={() => ref.current?.showModal()} className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-white" aria-label={`Enlarge: ${data.alt}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.src} alt={data.alt} width={data.width} height={data.height} loading="lazy" decoding="async" className="h-auto w-full" />
        <span className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="h-4 w-4" aria-hidden />
        </span>
      </button>
      {(data.caption || data.credit) && (
        <figcaption className="mt-2 text-xs text-muted">
          {data.caption}
          {data.credit && <span className="ml-1 italic">({data.credit})</span>}
        </figcaption>
      )}
      <dialog ref={ref} className="m-auto max-h-[92vh] max-w-[95vw] rounded-xl bg-white p-0 backdrop:bg-black/70" onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <button type="button" onClick={() => ref.current?.close()} className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.src} alt={data.alt} className="h-auto max-h-[90vh] w-auto" />
      </dialog>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Odoo screen: real screenshot with numbered callouts                 */
/* ------------------------------------------------------------------ */

export function ScreenBlock({ data }: { data: VisualData<"screen"> }) {
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const isStatic = useStaticRender();
  // A blinking outline around the data plus a number tag outside the box, so nothing covers what is being explained.
  const markers = (big: boolean) =>
    data.callouts.map((c, i) => {
      const w = c.w ?? 7;
      const h = c.h ?? 4;
      const left = c.x - w / 2;
      const top = c.y - h / 2;
      const side = c.tag ?? (top < 4 ? "bottom" : "top");
      const tagPos: React.CSSProperties =
        side === "top" ? { left: `${left}%`, top: `${top}%`, transform: "translate(0, calc(-100% - 3px))" }
        : side === "bottom" ? { left: `${left}%`, top: `${top + h}%`, transform: "translate(0, 3px)" }
        : side === "left" ? { left: `${left}%`, top: `${c.y}%`, transform: "translate(calc(-100% - 4px), -50%)" }
        : { left: `${left + w}%`, top: `${c.y}%`, transform: "translate(4px, -50%)" };
      const on = active === i;
      const handlers = {
        onMouseEnter: () => setActive(i),
        onMouseLeave: () => setActive(null),
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setActive(on ? null : i);
        },
      };
      return (
        <span key={i}>
          <span
            {...handlers}
            style={{ left: `${left}%`, top: `${top}%`, width: `${w}%`, height: `${h}%` }}
            className={cn("absolute cursor-pointer rounded-md border-2 transition-colors", on ? "border-accent bg-accent/10" : cn("border-[#e8590c]", !isStatic && "screen-blink"))}
            aria-hidden
          />
          <button
            type="button"
            {...handlers}
            onFocus={() => setActive(i)}
            style={tagPos}
            aria-label={`${i + 1}: ${c.title}`}
            className={cn(
              "absolute z-10 flex items-center justify-center rounded-full font-bold text-white shadow-md ring-2 ring-white transition",
              big ? "h-7 w-7 text-xs" : "h-5 w-5 text-[0.625rem] sm:h-6 sm:w-6 sm:text-[0.6875rem]",
              on ? "scale-110 bg-accent" : "bg-[#e8590c]",
            )}
          >
            {i + 1}
          </button>
        </span>
      );
    });
  return (
    <VisualFrame kind="Odoo screen" title={data.title} caption={data.caption} bodyClassName="p-0 sm:p-0">
      {(data.path || data.version) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2 sm:px-5">
          {data.path && <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs text-accent">{data.path}</span>}
          {data.version && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-primary">Real screen · {data.version}</span>}
        </div>
      )}
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="relative bg-white">
          {/* Markers are positioned against the image only: the grid cell can be taller than the image when the legend is long. */}
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.src} alt={data.alt} width={data.width} height={data.height} loading="lazy" decoding="async" className="block h-auto w-full" />
            {markers(false)}
          </div>
          {!isStatic && (
            <button type="button" onClick={() => ref.current?.showModal()} className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-xs text-white" aria-label="Open the screen full size">
              <ZoomIn className="h-3.5 w-3.5" aria-hidden /> Full size
            </button>
          )}
        </div>
        {data.callouts.length > 0 && (
          <ol className="divide-y divide-border border-t border-border text-sm lg:border-l lg:border-t-0">
            {data.callouts.map((c, i) => (
              <li key={i} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} className={cn("flex gap-2.5 px-3 py-2.5 transition", active === i && "bg-primary-soft")}>
                <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold text-white", active === i ? "bg-accent" : "bg-[#e8590c]")}>{i + 1}</span>
                <span className="min-w-0">
                  <span className="block font-semibold text-fg">{c.title}</span>
                  {c.text && <InlineMd className="block text-xs leading-relaxed text-muted">{c.text}</InlineMd>}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
      {!isStatic && (
        <dialog ref={ref} className="m-auto max-h-[94vh] max-w-[96vw] rounded-xl bg-white p-0 backdrop:bg-black/75" onClick={(e) => e.target === ref.current && ref.current?.close()}>
          <button type="button" onClick={() => ref.current?.close()} className="absolute right-2 top-2 z-10 rounded-md bg-black/60 p-1.5 text-white" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.src} alt={data.alt} className="block h-auto max-h-[92vh] w-auto" />
            {markers(true)}
          </div>
        </dialog>
      )}
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Practice checklists ("- [ ] task")                                  */
/* ------------------------------------------------------------------ */

/** Task-list checkbox that remembers its state per lesson in this browser. */
export function TaskCheckbox({ label }: { label: string }) {
  const pathname = usePathname();
  const key = `task:${pathname}:${label.slice(0, 120)}`;
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    try {
      setChecked(localStorage.getItem(key) === "1");
    } catch {
      /* storage unavailable */
    }
  }, [key]);
  return (
    <input
      type="checkbox"
      checked={checked}
      aria-label={label ? `Mark done: ${label}` : "Mark done"}
      onChange={(e) => {
        setChecked(e.target.checked);
        try {
          localStorage.setItem(key, e.target.checked ? "1" : "0");
        } catch {
          /* storage unavailable */
        }
      }}
      className="mr-2 h-4 w-4 translate-y-0.5 cursor-pointer accent-[var(--primary)]"
    />
  );
}

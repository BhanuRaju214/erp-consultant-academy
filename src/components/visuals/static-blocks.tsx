import { ArrowRight, ArrowUpDown, Check, CircleCheck, CircleX, Lightbulb, ThumbsDown, ThumbsUp } from "lucide-react";
import type { VisualData } from "@/lib/visuals/schemas";
import { cn } from "../ui";
import { VisualIcon } from "./icons";

/* ------------------------------------------------------------------ */
/* Shared frame                                                        */
/* ------------------------------------------------------------------ */

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";
export const toneBg: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-primary-soft text-primary",
  neutral: "bg-surface-2 text-muted",
};

/** Consistent wrapper for every visual: type label, title, body, caption. */
export function VisualFrame({
  kind,
  title,
  caption,
  children,
  className,
  bodyClassName,
}: {
  kind: string;
  title?: string;
  caption?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <figure className={cn("not-prose my-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm", className)}>
      {(title || kind) && (
        <div className="flex items-center gap-2 border-b border-border bg-surface-2/60 px-4 py-2.5 sm:px-5">
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">{kind}</span>
          {title && <span className="text-sm font-semibold text-fg">{title}</span>}
        </div>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
      {caption && <figcaption className="border-t border-border px-4 py-2.5 text-xs leading-relaxed text-muted sm:px-5">{caption}</figcaption>}
    </figure>
  );
}

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\*[^*\s][^*]*\*)/g;

/**
 * Inline Markdown for short texts inside visuals: **bold**, *italic*, `code`, [links](url).
 * A tiny tokenizer instead of a full Markdown parser keeps the client bundle small;
 * output is React text nodes, so no HTML is ever injected.
 */
export function InlineMd({ children, className }: { children: string; className?: string }) {
  const parts = children.split(INLINE).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.85em]">{p.slice(1, -1)}</code>;
        const link = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
          const href = link[2];
          const safe = /^(https?:\/\/|\/|#)/.test(href) ? href : "#";
          return (
            <a key={i} href={safe} className="text-primary underline" {...(safe.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {link[1]}
            </a>
          );
        }
        if (p.length > 2 && p.startsWith("*") && p.endsWith("*")) return <em key={i}>{p.slice(1, -1)}</em>;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

export function StepsBlock({ data }: { data: VisualData<"steps"> }) {
  return (
    <VisualFrame kind="Step by step" title={data.title}>
      <ol className="relative space-y-4">
        {data.steps.map((s, i) => (
          <li key={i} className="relative flex gap-4">
            {i < data.steps.length - 1 && <span className="absolute left-4 top-9 h-[calc(100%-1.25rem)] w-px bg-border" aria-hidden />}
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-fg">{i + 1}</span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="font-semibold text-fg">{s.title}</div>
              {s.path && <div className="mt-1 inline-block rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs text-accent">{s.path}</div>}
              {s.body && <InlineMd className="mt-1 block text-sm leading-relaxed text-muted">{s.body}</InlineMd>}
              {s.result && (
                <div className="mt-2 flex items-start gap-1.5 text-sm text-success">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    <span className="sr-only">Expected result: </span>
                    {s.result}
                  </span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </VisualFrame>
  );
}

function CellValue({ v }: { v: string | boolean }) {
  if (v === true) return <CircleCheck className="mx-auto h-5 w-5 text-success" aria-label="Yes" />;
  if (v === false) return <CircleX className="mx-auto h-5 w-5 text-danger/70" aria-label="No" />;
  return <InlineMd>{v}</InlineMd>;
}

export function CompareBlock({ data }: { data: VisualData<"compare"> }) {
  return (
    <VisualFrame kind="Comparison" title={data.title} caption={data.caption} bodyClassName="p-0 sm:p-0">
      {/* Cards on small screens, a table from sm up. */}
      <div className="grid gap-3 p-4 sm:hidden">
        {data.columns.map((c, ci) => (
          <div key={c} className={cn("rounded-xl border p-3", data.highlight === ci ? "border-primary bg-primary-soft/50" : "border-border")}>
            <div className="mb-2 font-semibold text-fg">{c}</div>
            <dl className="space-y-1.5 text-sm">
              {data.rows.map((r) => (
                <div key={r.label} className="flex justify-between gap-3">
                  <dt className="text-muted">{r.label}</dt>
                  <dd className="text-right text-fg">
                    <CellValue v={r.values[ci]} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr>
            <th className="w-1/4 px-4 py-3" />
            {data.columns.map((c, ci) => (
              <th key={c} scope="col" className={cn("px-4 py-3 text-center font-semibold text-fg", data.highlight === ci && "bg-primary-soft text-primary")}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="px-4 py-3 text-left font-medium text-muted">
                {r.label}
              </th>
              {r.values.map((v, i) => (
                <td key={i} className={cn("px-4 py-3 text-center text-fg", data.highlight === i && "bg-primary-soft/40")}>
                  <CellValue v={v} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </VisualFrame>
  );
}

export function BeforeAfterBlock({ data }: { data: VisualData<"beforeafter"> }) {
  return (
    <VisualFrame kind="Before & after" title={data.title}>
      <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border border-danger/25 bg-danger-soft/50 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-danger">Before · {data.before.title}</div>
          <ul className="space-y-1.5 text-sm text-fg">
            {data.before.points.map((p) => (
              <li key={p} className="flex gap-2">
                <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                <InlineMd>{p}</InlineMd>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center text-muted" aria-hidden>
          <ArrowRight className="h-6 w-6 rotate-90 md:rotate-0" />
        </div>
        <div className="rounded-xl border border-success/25 bg-success-soft/50 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-success">After · {data.after.title}</div>
          <ul className="space-y-1.5 text-sm text-fg">
            {data.after.points.map((p) => (
              <li key={p} className="flex gap-2">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                <InlineMd>{p}</InlineMd>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </VisualFrame>
  );
}

export function TimelineBlock({ data }: { data: VisualData<"timeline"> }) {
  return (
    <VisualFrame kind="Timeline" title={data.title}>
      <ol className="relative grid gap-4 md:grid-flow-col md:auto-cols-fr md:gap-3">
        <span className="absolute left-4 top-0 h-full w-px bg-border md:left-0 md:top-4 md:h-px md:w-full" aria-hidden />
        {data.items.map((it, i) => (
          <li key={i} className="relative flex gap-3 md:flex-col md:gap-2">
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-surface text-primary">
              <VisualIcon name={it.icon ?? "flag"} className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">{it.when}</div>
              <div className="font-semibold text-fg">{it.title}</div>
              {it.detail && <InlineMd className="mt-0.5 block text-sm text-muted">{it.detail}</InlineMd>}
            </div>
          </li>
        ))}
      </ol>
    </VisualFrame>
  );
}

const colsClass = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

export function CardsBlock({ data }: { data: VisualData<"cards"> }) {
  const cols = (data.columns ?? Math.min(3, data.cards.length)) as 1 | 2 | 3 | 4;
  return (
    <VisualFrame kind={data.label ?? "Key concepts"} title={data.title}>
      <div className={cn("grid gap-3", colsClass[cols])}>
        {data.cards.map((c, i) => (
          <div key={i} className="rounded-xl border border-border p-4 transition hover:border-primary/40 hover:shadow-sm">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneBg[(c.tone as Tone) ?? "info"])}>
              <VisualIcon name={c.icon ?? "lightbulb"} className="h-5 w-5" />
            </span>
            <div className="mt-3 font-semibold text-fg">{c.title}</div>
            {c.body && <InlineMd className="mt-1 block text-sm leading-relaxed text-muted">{c.body}</InlineMd>}
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

export function DoDontBlock({ data }: { data: VisualData<"dodont"> }) {
  return (
    <VisualFrame kind="Do & don't" title={data.title}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-success/30 p-4">
          <div className="mb-2 flex items-center gap-2 font-semibold text-success">
            <ThumbsUp className="h-4 w-4" aria-hidden /> Do
          </div>
          <ul className="space-y-2 text-sm text-fg">
            {data.do.map((d) => (
              <li key={d} className="flex gap-2">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                <InlineMd>{d}</InlineMd>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-danger/30 p-4">
          <div className="mb-2 flex items-center gap-2 font-semibold text-danger">
            <ThumbsDown className="h-4 w-4" aria-hidden /> Don&apos;t
          </div>
          <ul className="space-y-2 text-sm text-fg">
            {data.dont.map((d) => (
              <li key={d} className="flex gap-2">
                <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                <InlineMd>{d}</InlineMd>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </VisualFrame>
  );
}

export function ScenarioBlock({ data }: { data: VisualData<"scenario"> }) {
  return (
    <VisualFrame kind="Real-world example" title={data.title}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <VisualIcon name="building" className="h-5 w-5" />
        </span>
        <div>
          <div className="font-semibold text-fg">{data.company}</div>
          {data.industry && <div className="text-xs text-muted">{data.industry} · fictional company</div>}
        </div>
      </div>
      <InlineMd className="mt-3 block text-sm leading-relaxed text-fg">{data.situation}</InlineMd>
      {data.steps.length > 0 && (
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {data.steps.map((s, i) => (
            <li key={i} className="flex gap-2 rounded-lg bg-surface-2 p-2.5 text-sm text-fg">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-fg">{i + 1}</span>
              <InlineMd>{s}</InlineMd>
            </li>
          ))}
        </ol>
      )}
      {data.metrics.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {data.metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-border p-3">
              <div className="text-xs text-muted">{m.label}</div>
              {m.before && (
                <div className="mt-1 text-xs text-muted">
                  <span className="sr-only">Before: </span>
                  <span className="line-through decoration-danger/60">{m.before}</span>
                </div>
              )}
              <div className="mt-0.5 text-lg font-semibold leading-tight text-success">
                {m.before && <span className="sr-only">After: </span>}
                {m.after}
              </div>
            </div>
          ))}
        </div>
      )}
    </VisualFrame>
  );
}

export function JournalBlock({ data }: { data: VisualData<"journal"> }) {
  const debits = data.lines.filter((l) => l.debit);
  const credits = data.lines.filter((l) => l.credit);
  return (
    <VisualFrame kind="Accounting impact" title={data.title} caption={data.note}>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { label: "Debit (Dr)", rows: debits, key: "debit" as const, tone: "border-primary/30" },
          { label: "Credit (Cr)", rows: credits, key: "credit" as const, tone: "border-accent/30" },
        ].map((side) => (
          <div key={side.label} className={cn("rounded-xl border-2 p-3", side.tone)}>
            <div className="mb-2 border-b border-border pb-1 text-center text-xs font-semibold uppercase tracking-wide text-muted">{side.label}</div>
            <ul className="space-y-1 text-sm">
              {side.rows.map((r) => (
                <li key={r.account} className="flex justify-between gap-3">
                  <span className="text-fg">{r.account}</span>
                  <span className="font-mono tabular-nums text-fg">{r[side.key]}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

export function LayersBlock({ data }: { data: VisualData<"layers"> }) {
  return (
    <VisualFrame kind="Architecture" title={data.title} caption={data.caption}>
      <ol className="space-y-0">
        {data.layers.map((l, i) => (
          <li key={l.title}>
            <div
              className={cn(
                "grid gap-3 rounded-xl border p-3 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-center sm:p-4",
                i === 0 ? "border-primary/30 bg-primary-soft/60" : i === data.layers.length - 1 ? "border-sidebar/20 bg-sidebar text-white" : "border-border bg-surface-2/60",
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", i === data.layers.length - 1 ? "bg-white/10 text-brand" : "bg-primary text-primary-fg")}>
                  <VisualIcon name={l.icon ?? "layers"} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className={cn("text-sm font-semibold uppercase tracking-wide", i === data.layers.length - 1 ? "text-white" : "text-fg")}>{l.title}</div>
                  {l.subtitle && <div className={cn("text-xs", i === data.layers.length - 1 ? "text-white/70" : "text-muted")}>{l.subtitle}</div>}
                </div>
              </div>
              <div>
                {l.items.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {l.items.map((it) => (
                      <li
                        key={it}
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium",
                          i === data.layers.length - 1 ? "bg-white/10 text-white" : "border border-border bg-surface text-fg",
                        )}
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                )}
                {l.detail && <InlineMd className={cn("mt-1.5 block text-xs leading-relaxed", i === data.layers.length - 1 ? "text-white/75" : "text-muted")}>{l.detail}</InlineMd>}
              </div>
            </div>
            {i < data.layers.length - 1 && (
              <div className="flex justify-center py-1 text-muted" aria-hidden>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            )}
          </li>
        ))}
      </ol>
      {data.connects.length > 0 && (
        <div className="mt-4 border-t border-dashed border-border pt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Connects to</div>
          <div className={cn("grid gap-3", data.connects.length > 1 && "sm:grid-cols-2", data.connects.length > 2 && "lg:grid-cols-3")}>
            {data.connects.map((c) => (
              <div key={c.title} className="flex items-start gap-3 rounded-xl border border-dashed border-primary/40 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <VisualIcon name={c.icon ?? "plug"} className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-fg">{c.title}</div>
                  {c.detail && <InlineMd className="block text-xs text-muted">{c.detail}</InlineMd>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </VisualFrame>
  );
}

const toneStroke: Record<Tone, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--primary)",
  neutral: "var(--muted)",
};

/** Small line chart for qualitative trends (relative values, not real measurements). */
export function TrendBlock({ data }: { data: VisualData<"trend"> }) {
  const W = 640, H = 270, L = 40, R = 16, T = 32, B = 40;
  const max = Math.max(1, ...data.series.flatMap((s) => s.values));
  const x = (i: number) => L + (i * (W - L - R)) / (data.points.length - 1);
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  return (
    <VisualFrame kind="Trend" title={data.title} caption={data.caption}>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg">
        {data.series.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="h-1 w-5 rounded-full" style={{ background: toneStroke[(s.tone as Tone) ?? "info"] }} aria-hidden />
            {s.label}
          </li>
        ))}
      </ul>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${data.title ?? "Trend"}: ${data.series.map((s) => s.label).join(" versus ")}`}>
        <line x1={L} y1={T} x2={L} y2={H - B} stroke="var(--border)" strokeWidth={1.5} />
        <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="var(--border)" strokeWidth={1.5} />
        {data.points.map((p, i) => (
          <g key={p}>
            <line x1={x(i)} y1={T} x2={x(i)} y2={H - B} stroke="var(--border)" strokeDasharray="3 4" opacity={0.6} />
            <text x={x(i)} y={H - B + 18} textAnchor={i === 0 ? "start" : i === data.points.length - 1 ? "end" : "middle"} fontSize={12} fill="var(--muted)">
              {p}
            </text>
          </g>
        ))}
        {data.yLabel && (
          <text x={14} y={(H - B + T) / 2} fontSize={12} fill="var(--muted)" textAnchor="middle" transform={`rotate(-90 14 ${(H - B + T) / 2})`}>
            {data.yLabel}
          </text>
        )}
        {data.xLabel && (
          <text x={W - R} y={H - 4} fontSize={12} fill="var(--muted)" textAnchor="end">
            {data.xLabel} →
          </text>
        )}
        {data.series.map((s) => {
          const c = toneStroke[(s.tone as Tone) ?? "info"];
          const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
          return (
            <g key={s.label}>
              {data.series.length === 1 && <path d={`${d} L${x(s.values.length - 1)},${H - B} L${L},${H - B} Z`} fill={c} opacity={0.08} />}
              <path d={d} fill="none" stroke={c} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={4} fill="var(--surface)" stroke={c} strokeWidth={2} />
              ))}
              <text x={x(s.values.length - 1) - 6} y={y(s.values[s.values.length - 1]) - 10} textAnchor="end" fontSize={12} fontWeight={600} fill={c}>
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </VisualFrame>
  );
}

export function TakeawaysBlock({ data }: { data: VisualData<"takeaways"> }) {
  return (
    <section className="not-prose my-10 rounded-2xl border border-primary/25 bg-primary-soft/60 p-5 sm:p-6" aria-labelledby="key-takeaways">
      <h2 id="key-takeaways" className="flex scroll-mt-24 items-center gap-2 text-lg font-semibold text-fg">
        <Lightbulb className="h-5 w-5 text-primary" aria-hidden /> {data.title ?? "Key takeaways"}
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {data.items.map((t, i) => (
          <li key={i} className="flex gap-3 rounded-xl bg-surface p-3 text-sm leading-relaxed text-fg shadow-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-fg">{i + 1}</span>
            <InlineMd>{t}</InlineMd>
          </li>
        ))}
      </ul>
    </section>
  );
}

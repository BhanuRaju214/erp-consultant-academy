"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, CircleCheck, CircleX, MessageSquare, RotateCcw, Trophy, User } from "lucide-react";
import type { VisualData } from "@/lib/visuals/schemas";
import { cn } from "../ui";
import { InlineMd, VisualFrame } from "./static-blocks";
import { useStaticRender } from "./static-context";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Shuffle seeded from the content, so server and client render the same order (no hydration mismatch). */
function seededShuffle<T>(items: T[], seedText: string): T[] {
  let h = 2166136261;
  for (const ch of seedText) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rand = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // Never start already solved.
  if (out.every((x, i) => x === items[i]) && out.length > 1) [out[0], out[1]] = [out[1], out[0]];
  return out;
}

const btn = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition";

/* ------------------------------------------------------------------ */
/* Put in order                                                        */
/* ------------------------------------------------------------------ */

export function OrderBlock({ data }: { data: VisualData<"order"> }) {
  const isStatic = useStaticRender();
  const start = useMemo(() => seededShuffle(data.items, data.prompt), [data.items, data.prompt]);
  const [list, setList] = useState(start);
  const [checked, setChecked] = useState(false);
  if (isStatic) {
    return (
      <VisualFrame kind="Put in order" title={data.title}>
        <InlineMd className="mb-3 block text-sm text-muted">{data.prompt}</InlineMd>
        <ol className="space-y-1.5 text-sm">
          {data.items.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-fg">{i + 1}</span>
              <InlineMd className="text-fg">{it}</InlineMd>
            </li>
          ))}
        </ol>
        {data.explanation && <InlineMd className="mt-3 block text-sm text-muted">{data.explanation}</InlineMd>}
      </VisualFrame>
    );
  }
  const right = list.filter((x, i) => x === data.items[i]).length;
  const solved = checked && right === list.length;
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const n = [...list];
    [n[i], n[j]] = [n[j], n[i]];
    setList(n);
    setChecked(false);
  };
  return (
    <VisualFrame kind="Put in order" title={data.title}>
      <InlineMd className="mb-3 block text-sm font-medium text-fg">{data.prompt}</InlineMd>
      <ol className="space-y-1.5">
        {list.map((it, i) => {
          const ok = checked && it === data.items[i];
          const bad = checked && !ok;
          return (
            <li key={it} className={cn("flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm transition", ok ? "border-success bg-success-soft" : bad ? "border-danger bg-danger-soft" : "border-border bg-surface")}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-fg">{i + 1}</span>
              <InlineMd className="min-w-0 flex-1 text-fg">{it}</InlineMd>
              <span className="flex shrink-0 gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30" aria-label={`Move "${it}" up`}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-30" aria-label={`Move "${it}" down`}>
                  <ArrowDown className="h-4 w-4" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-2" role="status">
        {!solved && (
          <button type="button" onClick={() => setChecked(true)} className={cn(btn, "bg-primary text-primary-fg")}>
            Check order
          </button>
        )}
        {checked && !solved && <span className="text-sm text-warning">{right} of {list.length} in the right place. Green ones are correct.</span>}
        {checked && !solved && (
          <button type="button" onClick={() => { setList(data.items); setChecked(true); }} className="text-xs font-medium text-primary underline">
            Show answer
          </button>
        )}
        {solved && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
            <CircleCheck className="h-4 w-4" /> Correct order.
          </span>
        )}
        {checked && (
          <button type="button" onClick={() => { setList(start); setChecked(false); }} className="ml-auto inline-flex items-center gap-1 text-xs text-muted hover:text-fg">
            <RotateCcw className="h-3 w-3" /> Try again
          </button>
        )}
      </div>
      {solved && data.explanation && <InlineMd className="mt-2 block rounded-lg bg-success-soft p-3 text-sm text-fg">{data.explanation}</InlineMd>}
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Match pairs                                                         */
/* ------------------------------------------------------------------ */

export function MatchBlock({ data }: { data: VisualData<"match"> }) {
  const isStatic = useStaticRender();
  const rights = useMemo(() => seededShuffle(data.pairs.map((p) => p.right), data.prompt), [data.pairs, data.prompt]);
  const [pick, setPick] = useState<string[]>(() => data.pairs.map(() => ""));
  const [checked, setChecked] = useState(false);
  if (isStatic) {
    return (
      <VisualFrame kind="Match the pairs" title={data.title}>
        <InlineMd className="mb-3 block text-sm text-muted">{data.prompt}</InlineMd>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-muted">
              <th className="py-1 pr-3">{data.leftLabel ?? "Item"}</th>
              <th className="py-1">{data.rightLabel ?? "Match"}</th>
            </tr>
          </thead>
          <tbody>
            {data.pairs.map((p, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-1.5 pr-3 font-medium text-fg"><InlineMd>{p.left}</InlineMd></td>
                <td className="py-1.5 text-fg"><InlineMd>{p.right}</InlineMd></td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisualFrame>
    );
  }
  const right = data.pairs.filter((p, i) => pick[i] === p.right).length;
  const solved = checked && right === data.pairs.length;
  return (
    <VisualFrame kind="Match the pairs" title={data.title}>
      <InlineMd className="mb-3 block text-sm font-medium text-fg">{data.prompt}</InlineMd>
      {(data.leftLabel || data.rightLabel) && (
        <div className="mb-1 hidden grid-cols-2 gap-3 text-[11px] font-semibold uppercase tracking-wide text-muted sm:grid">
          <span>{data.leftLabel}</span>
          <span>{data.rightLabel}</span>
        </div>
      )}
      <ul className="space-y-2">
        {data.pairs.map((p, i) => {
          const ok = checked && pick[i] === p.right;
          const bad = checked && !ok;
          return (
            <li key={i} className={cn("grid gap-2 rounded-lg border p-2 text-sm sm:grid-cols-2 sm:items-center", ok ? "border-success bg-success-soft" : bad ? "border-danger bg-danger-soft" : "border-border")}>
              <InlineMd className="font-medium text-fg">{p.left}</InlineMd>
              <select
                value={pick[i]}
                onChange={(e) => { const n = [...pick]; n[i] = e.target.value; setPick(n); setChecked(false); }}
                className="w-full min-w-0 rounded-md border border-border bg-surface px-2 py-1.5 text-fg"
                aria-label={`Match for ${p.left}`}
              >
                <option value="">Choose…</option>
                {rights.map((r) => (
                  <option key={r} value={r}>{r.replace(/\*\*/g, "")}</option>
                ))}
              </select>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2" role="status">
        {!solved && (
          <button type="button" onClick={() => setChecked(true)} disabled={pick.some((x) => !x)} className={cn(btn, "bg-primary text-primary-fg disabled:opacity-40")}>
            Check matches
          </button>
        )}
        {checked && !solved && <span className="text-sm text-warning">{right} of {data.pairs.length} correct.</span>}
        {checked && !solved && (
          <button type="button" onClick={() => { setPick(data.pairs.map((p) => p.right)); setChecked(true); }} className="text-xs font-medium text-primary underline">
            Show answer
          </button>
        )}
        {solved && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-success">
            <CircleCheck className="h-4 w-4" /> All matched.
          </span>
        )}
      </div>
      {solved && data.explanation && <InlineMd className="mt-2 block rounded-lg bg-success-soft p-3 text-sm text-fg">{data.explanation}</InlineMd>}
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* GST calculator                                                      */
/* ------------------------------------------------------------------ */

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const r2 = (n: number) => Math.round(n * 100) / 100;

function gstSplit(amount: number, rate: number, intra: boolean) {
  const tax = r2((amount * rate) / 100);
  const half = r2(tax / 2);
  return intra ? { cgst: half, sgst: r2(tax - half), igst: 0, total: r2(amount + tax) } : { cgst: 0, sgst: 0, igst: tax, total: r2(amount + tax) };
}

function GstTable({ amount, rate, intra }: { amount: number; rate: number; intra: boolean }) {
  const s = gstSplit(amount, rate, intra);
  const rows: [string, string][] = intra
    ? [["Taxable value", inr(amount)], [`CGST ${rate / 2}%`, inr(s.cgst)], [`SGST ${rate / 2}%`, inr(s.sgst)]]
    : [["Taxable value", inr(amount)], [`IGST ${rate}%`, inr(s.igst)]];
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b border-border">
            <td className="py-1.5 text-muted">{k}</td>
            <td className="py-1.5 text-right font-mono text-fg">{v}</td>
          </tr>
        ))}
        <tr>
          <td className="py-1.5 font-semibold text-fg">Invoice total</td>
          <td className="py-1.5 text-right font-mono font-semibold text-fg">{inr(s.total)}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function GstBlock({ data }: { data: VisualData<"gst"> }) {
  const isStatic = useStaticRender();
  const other = data.states.find((s) => s !== data.sellerState) ?? data.sellerState;
  const [amount, setAmount] = useState(data.amount);
  const [rate, setRate] = useState(data.rate);
  const [pos, setPos] = useState(other);
  if (isStatic) {
    return (
      <VisualFrame kind="GST calculator" title={data.title} caption={data.caption}>
        <div className="grid gap-4 sm:grid-cols-2">
          {[data.sellerState, other].map((p) => (
            <div key={p} className="rounded-lg border border-border p-3">
              <div className="mb-1 text-xs font-semibold text-muted">Seller in {data.sellerState}, place of supply {p}: {p === data.sellerState ? "intra-state" : "inter-state"}</div>
              <GstTable amount={data.amount} rate={data.rate} intra={p === data.sellerState} />
            </div>
          ))}
        </div>
      </VisualFrame>
    );
  }
  const intra = pos === data.sellerState;
  const valid = Number.isFinite(amount) && amount >= 0;
  return (
    <VisualFrame kind="GST calculator" title={data.title} caption={data.caption}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">Taxable value (₹)</span>
            <input type="number" min={0} step="0.01" value={Number.isFinite(amount) ? amount : ""} onChange={(e) => setAmount(parseFloat(e.target.value))} className="w-full rounded-md border border-border bg-surface px-2 py-1.5 font-mono text-fg" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">GST rate</span>
            <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-fg">
              {data.rates.map((r) => (
                <option key={r} value={r}>{r}%</option>
              ))}
            </select>
          </label>
          <div className="rounded-md bg-surface-2 px-2 py-1.5 text-xs text-muted">
            Seller registered in <b className="text-fg">{data.sellerState}</b>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">Place of supply (buyer&apos;s state)</span>
            <select value={pos} onChange={(e) => setPos(e.target.value)} className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-fg">
              {data.states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <div aria-live="polite">
          <div className={cn("mb-2 rounded-lg px-3 py-2 text-sm font-medium", intra ? "bg-primary-soft text-primary" : "bg-warning-soft text-fg")}>
            {intra ? `Same state: intra-state supply, so CGST + SGST (${rate / 2}% each).` : `Different states: inter-state supply, so IGST ${rate}%.`}
          </div>
          {valid ? <GstTable amount={amount} rate={rate} intra={intra} /> : <p className="text-sm text-danger">Enter a valid amount.</p>}
          <p className="mt-2 text-[11px] text-muted">The place of supply, not the seller&apos;s choice, decides intra- vs inter-state. Rounded to paise per tax line.</p>
        </div>
      </div>
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Sequence diagram                                                    */
/* ------------------------------------------------------------------ */

export function SequenceBlock({ data }: { data: VisualData<"sequence"> }) {
  const isStatic = useStaticRender();
  const [step, setStep] = useState(isStatic ? data.messages.length : 1);
  const n = data.actors.length;
  const col = (a: string) => ((data.actors.indexOf(a) + 0.5) / n) * 100;
  const shown = isStatic ? data.messages.length : step;
  const current = data.messages[shown - 1];
  return (
    <VisualFrame kind="Sequence" title={data.title} caption={data.caption}>
      <div className="overflow-x-auto">
        <div className="relative min-w-[30rem]">
          {/* Actors */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {data.actors.map((a) => (
              <div key={a} className="px-1 text-center">
                <span className="inline-block rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs font-semibold text-fg">{a}</span>
              </div>
            ))}
          </div>
          {/* Lifelines + messages */}
          <div className="relative mt-1">
            {data.actors.map((a) => (
              <span key={a} className="absolute bottom-0 top-0 w-px -translate-x-1/2 border-l border-dashed border-border" style={{ left: `${col(a)}%` }} aria-hidden />
            ))}
            <ol className="relative">
              {data.messages.map((m, i) => {
                const vis = i < shown;
                const active = !isStatic && i === shown - 1;
                const from = col(m.from);
                const to = col(m.to);
                const self = m.kind === "self" || m.from === m.to;
                const left = Math.min(from, to);
                const width = Math.max(Math.abs(to - from), 0);
                const rtl = to < from;
                return (
                  <li key={i} className={cn("relative h-14 transition-opacity duration-300", vis ? "opacity-100" : "opacity-0")} aria-hidden={!vis}>
                    {self ? (
                      <div className="absolute top-2" style={{ left: `${from}%` }}>
                        <div className={cn("h-7 w-10 rounded-r-md border-2 border-l-0", active ? "border-accent" : "border-primary/60")} />
                        <span className={cn("absolute left-12 top-0 whitespace-nowrap rounded px-1 text-[11px] font-medium", active ? "bg-accent text-white" : "bg-surface text-fg")}>
                          {i + 1}. {m.label}
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-6" style={{ left: `${left}%`, width: `${width}%` }}>
                        <div className={cn("relative border-t-2", m.kind === "response" || m.kind === "async" ? "border-dashed" : "", active ? "border-accent" : "border-primary/60")}>
                          <span
                            className={cn("absolute -top-[7px] h-0 w-0 border-y-[6px] border-y-transparent", rtl ? "-left-1 border-r-[8px]" : "-right-1 border-l-[8px]", active ? (rtl ? "border-r-accent" : "border-l-accent") : rtl ? "border-r-primary/60" : "border-l-primary/60")}
                            aria-hidden
                          />
                        </div>
                        <span className={cn("absolute -top-6 left-1/2 max-w-[18rem] -translate-x-1/2 truncate whitespace-nowrap rounded px-1.5 text-[11px] font-medium", active ? "bg-accent text-white" : "bg-surface text-fg")} title={m.label}>
                          {i + 1}. {m.label}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
      {isStatic ? (
        data.messages.some((m) => m.note) && (
          <ol className="mt-3 space-y-1 text-sm">
            {data.messages.map((m, i) => m.note && (
              <li key={i} className="text-muted"><b className="text-fg">{i + 1}.</b> <InlineMd>{m.note}</InlineMd></li>
            ))}
          </ol>
        )
      ) : (
        <div className="mt-3 flex flex-wrap items-start gap-3 border-t border-border pt-3 text-sm">
          <div className="min-w-0 flex-1" aria-live="polite">
            <div className="font-semibold text-fg">
              {shown}. {current.from} → {current.to}: {current.label}
            </div>
            {current.note && <InlineMd className="mt-0.5 block text-muted">{current.note}</InlineMd>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} disabled={step === 1} className={cn(btn, "border border-border text-fg disabled:opacity-40")} aria-label="Restart">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setStep((s) => Math.min(s + 1, data.messages.length))} disabled={step === data.messages.length} className={cn(btn, "bg-primary text-primary-fg disabled:opacity-40")}>
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Annotated code                                                      */
/* ------------------------------------------------------------------ */

export function CodewalkBlock({ data }: { data: VisualData<"codewalk"> }) {
  const isStatic = useStaticRender();
  const [active, setActive] = useState(0);
  const ranges = data.notes.map((n) => {
    const [a, b = a] = n.lines.split("-").map(Number);
    return [a, b] as const;
  });
  const hl = isStatic ? null : ranges[active];
  return (
    <VisualFrame kind="Code walkthrough" title={data.title} caption={data.caption} bodyClassName="p-0 sm:p-0">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 border-b border-border lg:border-b-0 lg:border-r">
          {data.file && <div className="border-b border-border bg-surface-2 px-3 py-1.5 font-mono text-xs text-muted">{data.file}</div>}
          <pre className="overflow-x-auto bg-[#0f172a] py-2 text-[12.5px] leading-6 text-slate-200" aria-label={`${data.language} code`}>
            <code>
              {data.code.map((line, i) => {
                const ln = i + 1;
                const on = hl && ln >= hl[0] && ln <= hl[1];
                const noteIdx = ranges.findIndex(([a]) => a === ln);
                return (
                  <div key={i} className={cn("flex pr-4", on ? "bg-amber-400/20" : hl ? "opacity-60" : "")}>
                    <span className={cn("w-10 shrink-0 select-none pr-3 text-right", on ? "text-amber-300" : "text-slate-500")}>{ln}</span>
                    <span className="whitespace-pre">{line || " "}</span>
                    {!isStatic && noteIdx >= 0 && (
                      <button type="button" onClick={() => setActive(noteIdx)} className="ml-3 shrink-0 rounded-full bg-[#e8590c] px-1.5 text-[10px] font-bold leading-5 text-white" aria-label={`Note ${noteIdx + 1}: ${data.notes[noteIdx].title}`}>
                        {noteIdx + 1}
                      </button>
                    )}
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
        <ol className="divide-y divide-border text-sm">
          {data.notes.map((n, i) => (
            <li key={i}>
              <button
                type="button"
                disabled={isStatic}
                onClick={() => setActive(i)}
                className={cn("flex w-full gap-2.5 px-3 py-2.5 text-left transition", !isStatic && active === i ? "bg-primary-soft" : "hover:bg-surface-2")}
              >
                <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white", !isStatic && active === i ? "bg-accent" : "bg-[#e8590c]")}>{i + 1}</span>
                <span className="min-w-0">
                  <span className="block font-semibold text-fg">
                    {n.title} <span className="font-mono text-[11px] font-normal text-muted">L{n.lines}</span>
                  </span>
                  {n.text && <InlineMd className="block text-xs leading-relaxed text-muted">{n.text}</InlineMd>}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Consultant role-play                                                */
/* ------------------------------------------------------------------ */

const qualityStyle = {
  best: { box: "border-success bg-success-soft", label: "Strong answer", icon: CircleCheck, color: "text-success" },
  ok: { box: "border-warning bg-warning-soft", label: "Acceptable, but…", icon: MessageSquare, color: "text-warning" },
  poor: { box: "border-danger bg-danger-soft", label: "Risky answer", icon: CircleX, color: "text-danger" },
} as const;

export function RoleplayBlock({ data }: { data: VisualData<"roleplay"> }) {
  const isStatic = useStaticRender();
  const [round, setRound] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState<number[]>([]);
  const done = round >= data.rounds.length;
  if (isStatic) {
    return (
      <VisualFrame kind="Consultant role-play" title={data.title}>
        <InlineMd className="mb-3 block text-sm text-muted">{data.setting}</InlineMd>
        <ol className="space-y-3 text-sm">
          {data.rounds.map((r, i) => {
            const best = r.options.find((o) => o.quality === "best")!;
            return (
              <li key={i} className="rounded-lg border border-border p-3">
                <div className="font-medium text-fg">{data.client}: “<InlineMd>{r.says}</InlineMd>”</div>
                <div className="mt-1 text-fg"><b>Strong answer:</b> <InlineMd>{best.text}</InlineMd></div>
                <InlineMd className="mt-1 block text-muted">{best.feedback}</InlineMd>
              </li>
            );
          })}
        </ol>
      </VisualFrame>
    );
  }
  const restart = () => { setRound(0); setChoice(null); setScore([]); };
  const r = data.rounds[Math.min(round, data.rounds.length - 1)];
  const picked = choice !== null ? r.options[choice] : null;
  const best = score.filter((s) => s === 1).length;
  return (
    <VisualFrame kind="Consultant role-play" title={data.title}>
      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted">
        <InlineMd className="min-w-0">{data.setting}</InlineMd>
        <span className="shrink-0 font-semibold">{done ? "Finished" : `Round ${round + 1} of ${data.rounds.length}`}</span>
      </div>
      {done ? (
        <div className="space-y-3 text-sm" role="status">
          <div className="flex items-center gap-2 text-base font-semibold text-success">
            <Trophy className="h-5 w-5" /> {best} of {data.rounds.length} strong answers
          </div>
          {data.wrapup && <InlineMd className="block text-fg">{data.wrapup}</InlineMd>}
          <button type="button" onClick={restart} className={cn(btn, "border border-border text-fg")}>
            <RotateCcw className="h-4 w-4" /> Play again
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted"><User className="h-4 w-4" /></span>
            <div className="rounded-2xl rounded-tl-sm bg-surface-2 px-3 py-2 text-sm text-fg">
              <div className="text-[11px] font-semibold text-muted">{data.client}</div>
              <InlineMd>{r.says}</InlineMd>
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            {r.options.map((o, i) => {
              const q = qualityStyle[o.quality];
              const isPicked = choice === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={choice !== null}
                  onClick={() => { setChoice(i); setScore((s) => [...s, o.quality === "best" ? 1 : 0]); }}
                  className={cn("rounded-lg border px-3 py-2 text-left text-sm transition", isPicked ? q.box : choice !== null && o.quality === "best" ? "border-success/60" : "border-border hover:bg-surface-2", choice !== null && !isPicked && "opacity-70")}
                >
                  <span className="text-[11px] font-semibold text-muted">You: </span>
                  <InlineMd className="text-fg">{o.text}</InlineMd>
                </button>
              );
            })}
          </div>
          {picked && (
            <div className={cn("mt-3 rounded-lg border p-3 text-sm", qualityStyle[picked.quality].box)} role="status">
              <div className={cn("mb-1 flex items-center gap-1.5 font-semibold", qualityStyle[picked.quality].color)}>
                {(() => { const I = qualityStyle[picked.quality].icon; return <I className="h-4 w-4" />; })()} {qualityStyle[picked.quality].label}
              </div>
              <InlineMd className="text-fg">{picked.feedback}</InlineMd>
              <div className="mt-2 flex justify-end">
                <button type="button" onClick={() => { setRound((x) => x + 1); setChoice(null); }} className={cn(btn, "bg-primary text-primary-fg")}>
                  {round + 1 < data.rounds.length ? "Next question" : "See result"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </VisualFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Narrated video with chapters                                        */
/* ------------------------------------------------------------------ */

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function VideoBlock({ data }: { data: VisualData<"video"> }) {
  const isStatic = useStaticRender();
  const ref = useRef<HTMLVideoElement>(null);
  const [now, setNow] = useState(0);
  const current = data.chapters.reduce((acc, c, i) => (now >= c.t ? i : acc), 0);
  if (isStatic) {
    return (
      <VisualFrame kind="Video" title={data.title} caption={data.caption}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {data.poster && <img src={data.poster} alt={`Video: ${data.title}`} className="block w-full rounded-lg" />}
        <p className="mt-2 text-sm text-muted">Watch the narrated video ({data.duration ?? "MP4"}) in the training portal.</p>
      </VisualFrame>
    );
  }
  return (
    <VisualFrame kind={`Video${data.duration ? ` · ${data.duration}` : ""}`} title={data.title} caption={data.caption} bodyClassName="p-0 sm:p-0">
      <div className={cn("grid", data.chapters.length > 0 && "lg:grid-cols-[minmax(0,1fr)_16rem]")}>
        <video ref={ref} controls preload="metadata" playsInline poster={data.poster} onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)} onSeeked={(e) => setNow(e.currentTarget.currentTime)} className="block aspect-video w-full bg-black">
          <source src={data.src} type="video/mp4" />
        </video>
        {data.chapters.length > 0 && (
          <ol className="max-h-[22rem] divide-y divide-border overflow-y-auto border-t border-border text-sm lg:max-h-none lg:border-l lg:border-t-0">
            {data.chapters.map((c, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => { const v = ref.current; if (v) { v.currentTime = c.t; void v.play(); } }}
                  className={cn("flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-surface-2", i === current && "bg-primary-soft font-semibold text-primary")}
                >
                  <span className="w-10 shrink-0 font-mono text-xs text-muted">{fmt(c.t)}</span>
                  <InlineMd className="min-w-0">{c.label}</InlineMd>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </VisualFrame>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, Eye, MousePointerClick, RotateCcw, Trophy, TriangleAlert } from "lucide-react";
import type { VisualData } from "@/lib/visuals/schemas";
import { cn } from "../ui";
import { InlineMd, VisualFrame } from "./static-blocks";
import { useStaticRender } from "./static-context";

type Sim = VisualData<"simulate">;
type Step = Sim["steps"][number];
type Box = { x: number; y: number; w: number; h: number };
type Phase = "click" | "input" | "done";
type Feedback = { tone: "miss" | "trap" | "input"; text: string } | null;

/** Clicks this close to a target (in % of the image) still count: screenshots are small on phones. */
const PAD = 1.2;
const inBox = (b: Box, x: number, y: number) => x >= b.x - PAD && x <= b.x + b.w + PAD && y >= b.y - PAD && y <= b.y + b.h + PAD;
const boxStyle = (b: Box) => ({ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` });
const norm = (s: string) => s.trim().toLowerCase().replace(/,/g, "").replace(/\.0+$/, "");

/* ------------------------------------------------------------------ */
/* Click-through simulator on real screenshots                         */
/* ------------------------------------------------------------------ */

export function SimulateBlock({ data }: { data: Sim }) {
  const isStatic = useStaticRender();
  if (isStatic) return <StaticSimulate data={data} />;
  return <InteractiveSimulate data={data} />;
}

/** Pause after a correct click so the learner sees the green confirmation before the next screen. */
const ADVANCE_MS = 900;
/** Screens with nothing to click stay up long enough to read their note. */
const readMs = (s: string) => Math.min(7000, Math.max(3500, 1500 + s.length * 40));

function InteractiveSimulate({ data }: { data: Sim }) {
  const steps = data.steps;
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>(steps[0].target ? "click" : "done");
  const [feedback, setFeedback] = useState<Feedback>(null);
  /** What Odoo did on the previous screen, shown on the new one. */
  const [prev, setPrev] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [finished, setFinished] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; ok: boolean; k: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const step: Step = steps[idx];
  const isLook = !step.target;

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clearTimer, []);
  useEffect(() => {
    const next = steps[idx + 1];
    if (next) new Image().src = next.src;
  }, [idx, steps]);
  useEffect(() => {
    if (phase === "input") inputRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const go = (i: number, carried: string | null) => {
    clearTimer();
    setIdx(i);
    setPhase(steps[i].target ? "click" : "done");
    setFeedback(null);
    setPrev(carried);
    setValue("");
    setRipple(null);
  };
  const advance = (from: number) => {
    const s = steps[from];
    if (from + 1 < steps.length) go(from + 1, s.target ? s.explain : null);
    else {
      clearTimer();
      setPrev(s.target ? s.explain : null);
      setFinished(true);
    }
  };
  // Look-only screens move on by themselves.
  useEffect(() => {
    if (finished || !isLook) return;
    timer.current = setTimeout(() => advance(idx), readMs(step.explain));
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, finished, isLook]);

  const restart = () => {
    setFinished(false);
    go(0, null);
  };
  const succeed = () => {
    setFeedback(null);
    setPhase("done");
    const from = idx;
    timer.current = setTimeout(() => advance(from), ADVANCE_MS);
  };
  const solved = () => {
    if (step.input) {
      setFeedback(null);
      setPhase("input");
    } else succeed();
  };

  const onImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== "click" || !step.target) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const ok = [step.target, ...step.also].some((b) => inBox(b, x, y));
    setRipple({ x, y, ok, k: Date.now() });
    if (ok) return solved();
    const trap = step.traps.find((t) => inBox(t, x, y));
    setFeedback(trap ? { tone: "trap", text: trap.feedback } : { tone: "miss", text: `Not there. Click the highlighted spot: **${step.target.label}**.` });
  };
  const checkInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!step.input) return;
    if (norm(value) === norm(step.input.answer)) succeed();
    else setFeedback({ tone: "input", text: "That value is not right. Re-read the task: the number you need is in it." });
  };

  const t = step.target;
  // Put the "Click here" bubble below the target when it sits near the top edge.
  const bubbleBelow = t ? t.y < 14 : false;

  return (
    <VisualFrame kind="Try it in Odoo" title={data.title} caption={data.caption} bodyClassName="p-0 sm:p-0">
      {/* Progress */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-2 sm:px-5">
        <span className="text-xs font-semibold text-fg">
          Step {idx + 1} of {steps.length}
        </span>
        <div className="flex min-w-24 flex-1 gap-1" aria-hidden>
          {steps.map((_, i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < idx || finished || (i === idx && phase === "done") ? "bg-success" : i === idx ? "bg-[#e8590c]" : "bg-border")} />
          ))}
        </div>
        {step.path && <span className="hidden rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs text-accent sm:inline">{step.path}</span>}
        {data.version && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">Real screens · {data.version}</span>}
      </div>

      {/* Task: above the screen, so it stays put while the learner clicks */}
      <div className="flex items-start gap-2.5 border-b border-border bg-surface-2/40 px-4 py-3 text-sm sm:px-5" aria-live="polite">
        {finished ? (
          <>
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
              <Trophy className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="font-semibold text-success">Process complete</span>
          </>
        ) : (
          <>
            <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white", isLook ? "bg-accent" : "bg-[#e8590c]")}>
              {isLook ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <MousePointerClick className="h-3.5 w-3.5" aria-hidden />}
            </span>
            <span className="min-w-0">
              {idx === 0 && data.intro && <InlineMd className="mb-1 block text-xs text-muted">{data.intro}</InlineMd>}
              <InlineMd className="block font-medium leading-relaxed text-fg">{step.task}</InlineMd>
            </span>
          </>
        )}
      </div>

      {/* What the previous click did */}
      {prev && !finished && (
        <div key={`prev-${idx}`} className="flex items-start gap-2 border-b border-border bg-success-soft px-4 py-2 text-sm sm:px-5">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
          <InlineMd className="block leading-relaxed text-fg">{prev}</InlineMd>
        </div>
      )}

      {/* Screen */}
      <div className={cn("relative select-none overflow-hidden bg-white", phase === "click" && !finished && "cursor-pointer")} onClick={finished ? undefined : onImageClick}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={step.src} src={step.src} alt={step.alt} width={data.width} height={data.height} decoding="async" draggable={false} className="block h-auto w-full animate-[sim-in_.25s_ease-out] motion-reduce:animate-none" />
        {t && !finished && (
          <span
            style={boxStyle(t)}
            className={cn("pointer-events-none absolute rounded-md ring-[3px] ring-offset-2", phase === "click" ? "sim-target ring-[#e8590c]" : phase === "input" ? "ring-[#e8590c]" : "bg-success/15 ring-success")}
            aria-hidden
          />
        )}
        {t && !finished && phase === "click" && (
          <span
            style={{ left: `${Math.min(Math.max(t.x + t.w / 2, 7), 93)}%`, top: `${bubbleBelow ? t.y + t.h : t.y}%` }}
            className={cn("pointer-events-none absolute z-10 -translate-x-1/2", bubbleBelow ? "pt-2" : "-translate-y-full pb-2")}
            aria-hidden
          >
            <span className="sim-bob flex items-center gap-1 whitespace-nowrap rounded-full bg-[#e8590c] px-2 py-0.5 text-[11px] font-bold text-white shadow-lg sm:px-2.5 sm:py-1 sm:text-xs">
              <MousePointerClick className="h-3.5 w-3.5" /> Click here
            </span>
          </span>
        )}
        {ripple && (
          <span
            key={ripple.k}
            style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }}
            className={cn("sim-ripple pointer-events-none absolute h-8 w-8 rounded-full", ripple.ok ? "bg-success/50" : "bg-danger/50")}
            aria-hidden
          />
        )}
        {/* Keyboard access: the target is a real button (screen readers announce what to press). */}
        {phase === "click" && t && !finished && (
          <button
            type="button"
            style={boxStyle(t)}
            onClick={(e) => {
              e.stopPropagation();
              setRipple(null);
              solved();
            }}
            className="absolute rounded-md opacity-0 focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-accent"
            aria-label={`Click ${t.label}`}
          />
        )}
      </div>

      {/* Coach: feedback, typing, notes on look-only screens, completion */}
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm sm:px-5" aria-live="polite">
        {finished ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 space-y-1">
              {prev && <InlineMd className="block leading-relaxed text-fg">{prev}</InlineMd>}
              {data.outcome && <InlineMd className="block leading-relaxed text-muted">{data.outcome}</InlineMd>}
            </div>
            <button type="button" onClick={restart} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-fg hover:bg-surface-2">
              <RotateCcw className="h-4 w-4" aria-hidden /> Practise again
            </button>
          </div>
        ) : (
          <>
            {feedback && (
              <div className={cn("flex items-start gap-2 rounded-lg px-3 py-2", feedback.tone === "trap" ? "bg-warning-soft" : "bg-danger-soft")}>
                <TriangleAlert className={cn("mt-0.5 h-4 w-4 shrink-0", feedback.tone === "trap" ? "text-warning" : "text-danger")} aria-hidden />
                <InlineMd className="block leading-relaxed text-fg">{feedback.text}</InlineMd>
              </div>
            )}

            {phase === "input" && step.input && (
              <form onSubmit={checkInput} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#e8590c]/40 bg-surface-2/50 px-3 py-2">
                <label className="text-xs font-semibold text-fg" htmlFor={`sim-in-${idx}`}>
                  {step.input.label}
                </label>
                <input
                  id={`sim-in-${idx}`}
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={step.input.placeholder}
                  inputMode="decimal"
                  autoComplete="off"
                  className="w-32 min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1.5 font-mono text-fg sm:max-w-48"
                />
                <button type="submit" className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-fg">
                  Enter
                </button>
              </form>
            )}

            {phase === "done" && !isLook && (
              <div className="flex items-center gap-2 font-medium text-success">
                <CircleCheck className="h-4 w-4" aria-hidden /> Correct. Loading the next screen…
              </div>
            )}

            {isLook && (
              <div className="space-y-2">
                <div className="flex items-start gap-2 rounded-lg bg-surface-2 px-3 py-2">
                  <Eye className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  <InlineMd className="block leading-relaxed text-fg">{step.explain}</InlineMd>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-border" aria-hidden>
                  <div key={`bar-${idx}`} className="sim-timer h-full bg-accent" style={{ animationDuration: `${readMs(step.explain)}ms` }} />
                </div>
              </div>
            )}

            {phase === "click" && !feedback && <p className="text-xs text-muted">Click the highlighted spot on the screen, just as you would in Odoo.</p>}

            {idx > 0 && (
              <button type="button" onClick={restart} className="inline-flex items-center gap-1 self-end text-xs text-muted hover:text-fg">
                <RotateCcw className="h-3 w-3" aria-hidden /> Start over
              </button>
            )}
          </>
        )}
      </div>
    </VisualFrame>
  );
}


/** Static export (e.g. TrainerCentral): every step as a screen with the target outlined and the explanation. */
function StaticSimulate({ data }: { data: Sim }) {
  return (
    <VisualFrame kind="Walkthrough" title={data.title} caption={data.caption}>
      {data.intro && <InlineMd className="mb-4 block text-sm text-muted">{data.intro}</InlineMd>}
      <ol className="space-y-6">
        {data.steps.map((s, i) => (
          <li key={i}>
            <div className="mb-2 flex items-start gap-2 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8590c] text-xs font-bold text-white">{i + 1}</span>
              <span>
                <InlineMd className="block font-medium text-fg">{s.task}</InlineMd>
                {s.input && (
                  <span className="block text-muted">
                    Enter: <b>{s.input.answer}</b>
                  </span>
                )}
              </span>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={s.alt} width={data.width} height={data.height} className="block h-auto w-full" />
              {s.target && <span style={boxStyle(s.target)} className="absolute rounded-md ring-[3px] ring-[#e8590c] ring-offset-2" aria-hidden />}
            </div>
            <InlineMd className="mt-2 block text-sm leading-relaxed text-muted">{s.explain}</InlineMd>
          </li>
        ))}
      </ol>
    </VisualFrame>
  );
}

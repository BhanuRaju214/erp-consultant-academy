"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { Callout, Field, buttonClass, inputClass, inputSmClass } from "./ui";

interface LessonPlan {
  title: string;
  objective: string;
  durationMin: number;
}
interface Outline {
  title: string;
  subtitle: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  highlights: string[];
  modules: { title: string; summary: string; chapters: { title: string; lessons: LessonPlan[] }[] }[];
}

const MAX_LESSONS = 60;

/**
 * Two-step AI course builder: (1) brief → AI outline, (2) edit the outline →
 * create the draft course and start writing lessons in the background.
 */
export function AiCourseBuilder({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [brief, setBrief] = useState({ topic: "", audience: "", level: "beginner", modules: 5, lessonsPerModule: 4, quizQuestions: 8, language: "English", instructions: "" });
  const [outline, setOutline] = useState<Outline | null>(null);
  const [busy, setBusy] = useState<"outline" | "create" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lessonCount = outline?.modules.reduce((n, m) => n + m.chapters.reduce((k, c) => k + c.lessons.length, 0), 0) ?? 0;

  async function draftOutline(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy("outline");
    try {
      const res = await fetch("/api/admin/ai/outline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't draft the outline.");
      setOutline(data.outline);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function createCourse() {
    if (!outline) return;
    setError(null);
    setBusy("create");
    try {
      const res = await fetch("/api/admin/ai/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief, outline }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't create the course.");
      router.push(`/admin/programs/${data.programId}/ai`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  /** Immutable update helper for the nested outline. */
  const edit = (fn: (draft: Outline) => void) =>
    setOutline((o) => {
      if (!o) return o;
      const draft = structuredClone(o);
      fn(draft);
      return draft;
    });

  if (!outline) {
    return (
      <form onSubmit={draftOutline} className="space-y-4">
        {!enabled && <Callout tone="warning" title="AI not connected">Add OPENAI_API_KEY to the server settings to use the AI builder.</Callout>}
        {error && <Callout tone="danger">{error}</Callout>}
        <Field label="What should the course teach?" htmlFor="ai-topic" hint="Be specific: the subject, the outcome, and any tools or standards to cover.">
          <textarea
            id="ai-topic"
            required
            rows={3}
            value={brief.topic}
            onChange={(e) => setBrief({ ...brief, topic: e.target.value })}
            placeholder="e.g. Advanced Excel for finance analysts: formulas, pivot tables, Power Query and dashboards for monthly reporting"
            className={inputClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Who is it for?" htmlFor="ai-audience">
            <input id="ai-audience" value={brief.audience} onChange={(e) => setBrief({ ...brief, audience: e.target.value })} placeholder="e.g. Accountants with basic Excel skills" className={inputClass} />
          </Field>
          <Field label="Language" htmlFor="ai-language">
            <input id="ai-language" value={brief.language} onChange={(e) => setBrief({ ...brief, language: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Level" htmlFor="ai-level">
            <select id="ai-level" value={brief.level} onChange={(e) => setBrief({ ...brief, level: e.target.value })} className={inputClass}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>
          <Field label="Modules" htmlFor="ai-modules" hint="1–10">
            <input id="ai-modules" type="number" min={1} max={10} value={brief.modules} onChange={(e) => setBrief({ ...brief, modules: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Lessons per module" htmlFor="ai-lpm" hint={`Up to ${MAX_LESSONS} lessons in total`}>
            <input id="ai-lpm" type="number" min={1} max={12} value={brief.lessonsPerModule} onChange={(e) => setBrief({ ...brief, lessonsPerModule: Number(e.target.value) })} className={inputClass} />
          </Field>
          <Field label="Quiz questions per module" htmlFor="ai-quiz" hint="0 = no graded quizzes">
            <input id="ai-quiz" type="number" min={0} max={15} value={brief.quizQuestions} onChange={(e) => setBrief({ ...brief, quizQuestions: Number(e.target.value) })} className={inputClass} />
          </Field>
        </div>
        <Field label="Extra instructions (optional)" htmlFor="ai-instructions" hint="Style, examples to use, topics to include or avoid, local context (e.g. Indian GST rules).">
          <textarea id="ai-instructions" rows={3} value={brief.instructions} onChange={(e) => setBrief({ ...brief, instructions: e.target.value })} className={inputClass} />
        </Field>
        <button disabled={!enabled || busy !== null} className={buttonClass("primary")}>
          {busy === "outline" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Wand2 className="h-4 w-4" aria-hidden />}
          {busy === "outline" ? "Drafting outline (up to a minute)…" : "Draft outline"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      {error && <Callout tone="danger">{error}</Callout>}
      <Callout tone="info" title="Review the outline">
        Edit titles, remove or add lessons, then create the course. Lessons are written in the background and saved as a <strong>draft</strong>: nothing is visible to learners until you publish.
      </Callout>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Course title" htmlFor="o-title">
          <input id="o-title" value={outline.title} onChange={(e) => edit((d) => void (d.title = e.target.value))} className={inputClass} />
        </Field>
        <Field label="Subtitle" htmlFor="o-subtitle">
          <input id="o-subtitle" value={outline.subtitle} onChange={(e) => edit((d) => void (d.subtitle = e.target.value))} className={inputClass} />
        </Field>
      </div>

      <ol className="space-y-4">
        {outline.modules.map((m, mi) => (
          <li key={mi} className="rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border bg-surface-2/60 p-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Module {mi + 1}</span>
              <input value={m.title} onChange={(e) => edit((d) => void (d.modules[mi].title = e.target.value))} aria-label={`Module ${mi + 1} title`} className={`${inputSmClass} flex-1 font-semibold`} />
              <button type="button" onClick={() => edit((d) => void d.modules.splice(mi, 1))} disabled={outline.modules.length === 1} className="rounded p-1.5 text-muted hover:text-danger disabled:opacity-30" aria-label={`Remove module ${mi + 1}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-3">
              {m.chapters.map((c, ci) => (
                <div key={ci}>
                  <input value={c.title} onChange={(e) => edit((d) => void (d.modules[mi].chapters[ci].title = e.target.value))} aria-label="Chapter title" className={`${inputSmClass} mb-1.5 w-full text-xs font-semibold uppercase tracking-wider`} />
                  <ul className="space-y-1.5">
                    {c.lessons.map((l, li) => (
                      <li key={li} className="flex items-center gap-2">
                        <input value={l.title} onChange={(e) => edit((d) => void (d.modules[mi].chapters[ci].lessons[li].title = e.target.value))} aria-label="Lesson title" title={l.objective} className={`${inputSmClass} flex-1`} />
                        <span className="w-14 shrink-0 text-right text-xs text-muted">{l.durationMin} min</span>
                        <button
                          type="button"
                          onClick={() => edit((d) => void d.modules[mi].chapters[ci].lessons.splice(li, 1))}
                          disabled={c.lessons.length === 1}
                          className="rounded p-1 text-muted hover:text-danger disabled:opacity-30"
                          aria-label="Remove lesson"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => edit((d) => void d.modules[mi].chapters[ci].lessons.push({ title: "New lesson", objective: "", durationMin: 12 }))}
                    disabled={c.lessons.length >= 6}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add lesson
                  </button>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${lessonCount > MAX_LESSONS ? "text-danger" : "text-muted"}`}>
          {outline.modules.length} modules · {lessonCount} lessons{lessonCount > MAX_LESSONS ? ` (max ${MAX_LESSONS})` : ""}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOutline(null)} disabled={busy !== null} className={buttonClass("secondary")}>
            Start over
          </button>
          <button type="button" onClick={createCourse} disabled={busy !== null || lessonCount > MAX_LESSONS} className={buttonClass("primary")}>
            {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
            {busy === "create" ? "Creating…" : `Create course & write ${lessonCount} lessons${brief.quizQuestions > 0 ? ` + ${outline.modules.length} quizzes` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Live progress of a lesson-writing job, with resume / retry / cancel. */
export function GenerationProgress({ id, initial }: { id: string; initial: GenerationView }) {
  const router = useRouter();
  const [g, setG] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Poll while the job is running.
  useEffect(() => {
    if (initial.status !== "generating" || initial.stalled) return;
    const t = setInterval(async () => {
      const res = await fetch(`/api/admin/ai/generations/${id}`, { cache: "no-store" }).catch(() => null);
      if (!res?.ok) return;
      const next = (await res.json()) as GenerationView;
      setG(next);
      if (next.status !== "generating" || next.stalled) {
        clearInterval(t);
        router.refresh();
      }
    }, 4000);
    return () => clearInterval(t);
  }, [id, initial.status, initial.stalled, router]);

  async function act(action: "resume" | "retry-failed" | "cancel") {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/admin/ai/generations/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) setMessage(data.error ?? "Something went wrong.");
    else window.location.reload();
  }

  const finished = g.lessonsDone + g.lessonsFailed + g.quizzesDone + g.quizzesFailed;
  const totalItems = g.lessonsTotal + g.quizzesTotal;
  const pct = totalItems ? Math.round((finished / totalItems) * 100) : 0;
  const failed = g.lessonsFailed + g.quizzesFailed;
  const writingQuizzes = g.lessonsDone + g.lessonsFailed >= g.lessonsTotal && g.quizzesTotal > 0;
  const running = g.status === "generating" && !g.stalled;
  return (
    <div className="space-y-4">
      {message && <Callout tone="danger">{message}</Callout>}
      {g.stalled && <Callout tone="warning" title="Writing stopped">The job stopped (for example the server restarted). Resume to continue where it left off.</Callout>}
      {g.status === "done" && failed === 0 && (
        <Callout tone="success" title={g.quizzesTotal ? "All lessons and quizzes written" : "All lessons written"}>
          Review them in the course content, then publish the course.
        </Callout>
      )}
      {g.status === "done" && failed > 0 && (
        <Callout tone="warning" title={[g.lessonsFailed && `${g.lessonsFailed} lesson(s)`, g.quizzesFailed && `${g.quizzesFailed} quiz(zes)`].filter(Boolean).join(" and ") + " failed"}>
          {g.error ?? "Retry them, or write them by hand in the course content."}
        </Callout>
      )}
      {g.status === "failed" && <Callout tone="danger" title="The job failed">{g.error}</Callout>}
      {g.status === "cancelled" && <Callout tone="info">Cancelled. Lessons already written are kept.</Callout>}

      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="flex items-center gap-2 font-semibold text-fg">
            {running && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />}
            {running ? (writingQuizzes ? "Writing module quizzes…" : "Writing lessons…") : "Progress"}
          </span>
          <span className="text-muted">
            {g.lessonsDone}/{g.lessonsTotal} lessons{g.quizzesTotal ? ` · ${g.quizzesDone}/${g.quizzesTotal} quizzes` : ""}
            {failed ? ` · ${failed} failed` : ""}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">
          Model {g.model} · {(g.promptTokens + g.completionTokens).toLocaleString("en-IN")} tokens used ({g.promptTokens.toLocaleString("en-IN")} in, {g.completionTokens.toLocaleString("en-IN")} out)
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {running && (
          <button onClick={() => act("cancel")} disabled={busy} className={buttonClass("secondary")}>
            Cancel
          </button>
        )}
        {(g.stalled || g.status === "cancelled" || g.status === "failed") && (
          <button onClick={() => act("resume")} disabled={busy} className={buttonClass("primary")}>
            Resume writing
          </button>
        )}
        {!running && failed > 0 && (
          <button onClick={() => act("retry-failed")} disabled={busy} className={buttonClass("primary")}>
            Retry failed items
          </button>
        )}
      </div>
    </div>
  );
}

export interface GenerationView {
  id: string;
  programId: string;
  status: "generating" | "done" | "failed" | "cancelled";
  stalled: boolean;
  lessonsTotal: number;
  lessonsDone: number;
  lessonsFailed: number;
  quizzesTotal: number;
  quizzesDone: number;
  quizzesFailed: number;
  promptTokens: number;
  completionTokens: number;
  model: string;
  error: string | null;
}

"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import {
  addQuestionAction,
  deleteQuestionAction,
  deleteQuizAction,
  generateQuizAction,
  moveQuestionAction,
  saveQuizSettingsAction,
  updateQuestionAction,
  type QuizFormState,
} from "@/app/actions/quizzes";
import { Callout, Field, buttonClass, cn, inputClass, inputSmClass } from "./ui";

type Kind = "single" | "multiple" | "truefalse";
const OPTION_ROWS = 6;

export interface EditableQuestion {
  id: string;
  prompt: string;
  kind: Kind;
  options: string[];
  correct: number[];
  explanation: string;
}

const KIND_LABEL: Record<Kind, string> = { single: "Single answer", multiple: "Multiple answers", truefalse: "True / false" };

export function QuizSettingsForm({ moduleId, title, passMark }: { moduleId: string; title: string; passMark: number }) {
  const [state, action, pending] = useActionState<QuizFormState, FormData>(saveQuizSettingsAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="moduleId" value={moduleId} />
      <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
        <Field label="Quiz title" htmlFor="quiz-title">
          <input id="quiz-title" name="title" defaultValue={title} required className={inputClass} />
        </Field>
        <Field label="Pass mark (%)" htmlFor="quiz-pass">
          <input id="quiz-pass" name="passMark" type="number" min={1} max={100} defaultValue={passMark} required className={inputClass} />
        </Field>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button disabled={pending} className={buttonClass("secondary")}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        {state.saved && !pending && <span className="text-sm text-success">Saved.</span>}
      </div>
    </form>
  );
}

/** Add or edit one question. Blank option rows are ignored. */
export function QuestionForm({ moduleId, question, onDone }: { moduleId: string; question?: EditableQuestion; onDone?: () => void }) {
  const ref = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<Kind>(question?.kind ?? "single");
  const [state, action, pending] = useActionState<QuizFormState, FormData>(question ? updateQuestionAction : addQuestionAction, {});
  useEffect(() => {
    if (!state.saved) return;
    if (!question) {
      ref.current?.reset();
      setKind("single");
    }
    onDone?.();
  }, [state.saved, question, onDone]);

  const prefix = question?.id ?? `new-${moduleId}`;
  const rows = kind === "truefalse" ? ["True", "False"] : Array.from({ length: OPTION_ROWS }, (_, i) => question?.options[i] ?? "");
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="moduleId" value={moduleId} />
      {question && <input type="hidden" name="questionId" value={question.id} />}
      <Field label="Question" htmlFor={`${prefix}-prompt`}>
        <textarea id={`${prefix}-prompt`} name="prompt" rows={2} required defaultValue={question?.prompt} className={inputClass} />
      </Field>
      <Field label="Type" htmlFor={`${prefix}-kind`}>
        <select id={`${prefix}-kind`} name="kind" value={kind} onChange={(e) => setKind(e.target.value as Kind)} className={`${inputClass} sm:w-60`}>
          {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </select>
      </Field>
      <fieldset>
        <legend className="text-sm font-semibold text-fg">
          Options <span className="font-normal text-muted">· tick {kind === "multiple" ? "every correct option" : "the correct option"}</span>
        </legend>
        <div className="mt-1.5 space-y-1.5" key={kind}>
          {rows.map((value, i) => (
            <label key={i} className="flex items-center gap-2">
              <input
                type={kind === "multiple" ? "checkbox" : "radio"}
                name="correct"
                value={i}
                defaultChecked={question?.kind === kind ? question.correct.includes(i) : false}
                className="accent-[var(--primary)]"
                aria-label={`Option ${i + 1} is correct`}
              />
              {kind === "truefalse" ? (
                <span className="text-sm text-fg">{value}</span>
              ) : (
                <input name={`option${i}`} defaultValue={value} placeholder={i < 2 ? `Option ${i + 1}` : `Option ${i + 1} (optional)`} className={`${inputSmClass} w-full`} />
              )}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Explanation" htmlFor={`${prefix}-explanation`} hint="Shown to the learner after they submit.">
        <textarea id={`${prefix}-explanation`} name="explanation" rows={2} defaultValue={question?.explanation} className={inputClass} />
      </Field>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <button disabled={pending} className={buttonClass(question ? "secondary" : "primary")}>
        {question ? null : <Plus className="h-4 w-4" aria-hidden />}
        {pending ? "Saving…" : question ? "Save question" : "Add question"}
      </button>
    </form>
  );
}

/** One question in the list: read view with move / edit / delete. */
export function QuestionItem({ moduleId, question, index, first, last }: { moduleId: string; question: EditableQuestion; index: number; first: boolean; last: boolean }) {
  const [editing, setEditing] = useState(false);
  const btn = "rounded p-1.5 text-muted transition hover:bg-surface-2 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <li className="rounded-lg border border-border p-4">
      <div className="flex items-start gap-3">
        <span className="pt-0.5 text-sm font-semibold text-muted">{index + 1}.</span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-fg">{question.prompt}</p>
          <p className="mt-0.5 text-xs text-muted">{KIND_LABEL[question.kind]}</p>
        </div>
        <div className="flex shrink-0 items-center">
          {(["up", "down"] as const).map((direction) => (
            <form key={direction} action={moveQuestionAction}>
              <input type="hidden" name="questionId" value={question.id} />
              <input type="hidden" name="direction" value={direction} />
              <button disabled={direction === "up" ? first : last} className={btn} aria-label={`Move question ${index + 1} ${direction}`} title={`Move ${direction}`}>
                {direction === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </button>
            </form>
          ))}
          <form
            action={deleteQuestionAction}
            onSubmit={(e) => {
              if (!confirm(`Delete question ${index + 1}?`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="questionId" value={question.id} />
            <button className={cn(btn, "hover:text-danger")} aria-label={`Delete question ${index + 1}`} title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
      {editing ? (
        <div className="mt-4 border-t border-border pt-4">
          <QuestionForm moduleId={moduleId} question={question} onDone={() => setEditing(false)} />
          <button type="button" onClick={() => setEditing(false)} className={buttonClass("ghost", "mt-2")}>
            Cancel
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-3 space-y-1 pl-6 text-sm">
            {question.options.map((o, i) => (
              <li key={i} className={question.correct.includes(i) ? "font-semibold text-success" : "text-fg"}>
                {question.correct.includes(i) ? "✓ " : "· "}
                {o}
              </li>
            ))}
          </ul>
          {question.explanation && <p className="mt-2 pl-6 text-sm text-muted">{question.explanation}</p>}
          <button type="button" onClick={() => setEditing(true)} className="mt-2 pl-6 text-sm font-semibold text-primary hover:underline">
            Edit
          </button>
        </>
      )}
    </li>
  );
}

/** Writes the quiz with the AI from the module's lessons (replaces existing questions). */
export function GenerateQuizForm({ moduleId, enabled, hasQuestions }: { moduleId: string; enabled: boolean; hasQuestions: boolean }) {
  const [state, action, pending] = useActionState<QuizFormState, FormData>(generateQuizAction, {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (hasQuestions && !confirm("Replace all current questions with a new AI-written quiz? Learners' past scores are kept.")) e.preventDefault();
      }}
      className="space-y-3"
    >
      <input type="hidden" name="moduleId" value={moduleId} />
      {!enabled && <Callout tone="warning">Add OPENAI_API_KEY to the server settings to write quizzes with the AI.</Callout>}
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Questions" htmlFor={`gen-count-${moduleId}`}>
          <input id={`gen-count-${moduleId}`} name="count" type="number" min={3} max={15} defaultValue={8} className={`${inputClass} w-24`} />
        </Field>
        <button disabled={!enabled || pending} className={buttonClass("primary")}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Wand2 className="h-4 w-4" aria-hidden />}
          {pending ? "Writing quiz (up to a minute)…" : hasQuestions ? "Rewrite quiz with AI" : "Write quiz with AI"}
        </button>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.saved && !pending && <p className="text-sm text-success">Quiz written. Review every question below.</p>}
    </form>
  );
}

export function DeleteQuizForm({ moduleId }: { moduleId: string }) {
  return (
    <form
      action={deleteQuizAction}
      onSubmit={(e) => {
        if (!confirm("Delete this quiz and all its questions? Learners' attempts on it are deleted too.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="moduleId" value={moduleId} />
      <button className={buttonClass("ghost", "text-danger")}>
        <Trash2 className="h-4 w-4" aria-hidden /> Delete quiz
      </button>
    </form>
  );
}

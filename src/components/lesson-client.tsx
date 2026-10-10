"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, CircleCheck, RotateCcw } from "lucide-react";
import { postDiscussion, type PostState, saveNote, toggleBookmark, toggleLessonComplete } from "@/app/actions/learning";
import { Callout, buttonClass, cn, inputClass } from "./ui";

export function LessonActions({ lessonId, completed, bookmarked, path }: { lessonId: string; completed: boolean; bookmarked: boolean; path: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => toggleLessonComplete(lessonId, !completed, path))}
        className={buttonClass(completed ? "secondary" : "primary")}
      >
        {completed ? (
          <>
            <RotateCcw className="h-4 w-4" /> Mark as not complete
          </>
        ) : (
          <>
            <CircleCheck className="h-4 w-4" /> Mark lesson complete
          </>
        )}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => toggleBookmark(lessonId, path))}
        className={buttonClass("secondary")}
        aria-pressed={bookmarked}
      >
        {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </button>
    </div>
  );
}

export function Flashcards({ cards }: { cards: { term: string; definition: string }[] }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  if (!cards.length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((c, i) => {
        const open = flipped.has(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() =>
              setFlipped((prev) => {
                const n = new Set(prev);
                if (n.has(i)) n.delete(i);
                else n.add(i);
                return n;
              })
            }
            aria-expanded={open}
            className={cn(
              "min-h-24 rounded-lg border p-4 text-left text-sm transition",
              open ? "border-primary/40 bg-primary-soft text-fg" : "border-border bg-surface hover:border-primary/40",
            )}
          >
            <span className="block font-semibold text-fg">{c.term}</span>
            {open ? <span className="mt-1 block text-fg/90">{c.definition}</span> : <span className="mt-1 block text-xs text-muted">Click to reveal definition</span>}
          </button>
        );
      })}
    </div>
  );
}

export function LessonNotes({ lessonId, initial }: { lessonId: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string>();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const schedule = (v: string) => {
    setValue(v);
    setStatus("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await saveNote(lessonId, v);
      setStatus(res.ok ? "saved" : "error");
      setError(res.error);
    }, 800);
  };

  return (
    <div>
      <label htmlFor="lesson-notes" className="sr-only">
        My notes
      </label>
      <textarea
        id="lesson-notes"
        value={value}
        onChange={(e) => schedule(e.target.value)}
        rows={6}
        placeholder="Private notes for this lesson — key settings, questions for your trainer, client examples…"
        className={inputClass}
      />
      <p className="mt-1 text-xs text-muted" aria-live="polite">
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? error ?? "Could not save" : "Notes are private to you and auto-save."}
      </p>
    </div>
  );
}

export function AskQuestionForm({ lessonId }: { lessonId?: string }) {
  const [state, action, pending] = useActionState<PostState, FormData>(postDiscussion, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);
  return (
    <form ref={formRef} action={action} className="space-y-2">
      {lessonId && <input type="hidden" name="lessonId" value={lessonId} />}
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      {state.ok && <Callout tone="success">Posted. Trainers are notified on their dashboard.</Callout>}
      <label htmlFor="q-title" className="sr-only">
        Question title
      </label>
      <input id="q-title" name="title" placeholder="Short title, e.g. Why is my delivery not reserving stock?" className={inputClass} maxLength={160} />
      <label htmlFor="q-body" className="sr-only">
        Details
      </label>
      <textarea id="q-body" name="body" rows={3} placeholder="Describe what you tried, the Odoo version, and the exact error message." className={inputClass} />
      <button disabled={pending} className={buttonClass("secondary")}>
        {pending ? "Posting…" : "Ask a question"}
      </button>
    </form>
  );
}

export function ReplyForm({ parentId }: { parentId: string }) {
  const [state, action, pending] = useActionState<PostState, FormData>(postDiscussion, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);
  return (
    <form ref={formRef} action={action} className="mt-2 flex gap-2">
      <input type="hidden" name="parentId" value={parentId} />
      <label htmlFor={`reply-${parentId}`} className="sr-only">
        Reply
      </label>
      <input id={`reply-${parentId}`} name="body" placeholder="Write a reply…" className={inputClass} />
      <button disabled={pending} className={buttonClass("secondary")}>
        Reply
      </button>
      {state.error && <span className="self-center text-xs text-danger">{state.error}</span>}
    </form>
  );
}

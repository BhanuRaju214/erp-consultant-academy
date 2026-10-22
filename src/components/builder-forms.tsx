"use client";

import { useActionState, useRef } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  addChapterAction,
  addLessonAction,
  addModuleAction,
  deleteItemAction,
  moveItemAction,
  renameChapterAction,
  updateModuleAction,
  type BuilderState,
} from "@/app/actions/builder";
import { buttonClass, cn, inputClass, inputSmClass } from "./ui";

type Kind = "module" | "chapter" | "lesson";

/** Up / down / delete controls for one item. */
export function ItemControls({ kind, id, label, first, last }: { kind: Kind; id: string; label: string; first: boolean; last: boolean }) {
  const btn = "rounded p-1.5 text-muted transition hover:bg-surface-2 hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex shrink-0 items-center">
      <form action={moveItemAction}>
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="up" />
        <button disabled={first} className={btn} aria-label={`Move ${label} up`} title="Move up">
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
      <form action={moveItemAction}>
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="down" />
        <button disabled={last} className={btn} aria-label={`Move ${label} down`} title="Move down">
          <ArrowDown className="h-4 w-4" />
        </button>
      </form>
      <form
        action={deleteItemAction}
        onSubmit={(e) => {
          const warn = kind === "lesson" ? "" : ` Everything inside this ${kind} is deleted too.`;
          if (!confirm(`Delete ${kind} "${label}"?${warn} Learner progress on it is lost. This can't be undone.`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <button className={cn(btn, "hover:text-danger")} aria-label={`Delete ${label}`} title="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

/** A one-field "add" form that clears itself after a successful submit. */
function AddForm({
  action,
  hidden,
  placeholder,
  label,
  small,
}: {
  action: (s: BuilderState, f: FormData) => Promise<BuilderState>;
  hidden: Record<string, string>;
  placeholder: string;
  label: string;
  small?: boolean;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<BuilderState, FormData>(async (s, f) => {
    const r = await action(s, f);
    if (!r.error) ref.current?.reset();
    return r;
  }, {});
  return (
    <form ref={ref} action={formAction} className="space-y-1">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`add-${Object.values(hidden)[0]}-${label}`}>
          {label}
        </label>
        <input id={`add-${Object.values(hidden)[0]}-${label}`} name="title" placeholder={placeholder} className={small ? `${inputSmClass} w-full` : inputClass} />
        <button disabled={pending} className={buttonClass(small ? "secondary" : "primary", cn("shrink-0", small && "px-3 py-1.5 text-xs"))}>
          <Plus className="h-4 w-4" aria-hidden /> {label}
        </button>
      </div>
      {state.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}

export function AddModuleForm({ programId }: { programId: string }) {
  return <AddForm action={addModuleAction} hidden={{ programId }} placeholder="New module title, e.g. Getting started" label="Add module" />;
}

export function AddChapterForm({ moduleId }: { moduleId: string }) {
  return <AddForm action={addChapterAction} hidden={{ moduleId }} placeholder="New chapter title" label="Add chapter" small />;
}

export function AddLessonForm({ chapterId }: { chapterId: string }) {
  return <AddForm action={addLessonAction} hidden={{ chapterId }} placeholder="New lesson title" label="Add lesson" small />;
}

export function ModuleForm({ module }: { module: { id: string; title: string; summary: string; published: boolean } }) {
  const [state, action, pending] = useActionState<BuilderState, FormData>(updateModuleAction, {});
  return (
    <form action={action} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start">
      <input type="hidden" name="moduleId" value={module.id} />
      <div className="min-w-0 flex-1 space-y-2">
        <input name="title" defaultValue={module.title} aria-label="Module title" className={`${inputSmClass} w-full font-semibold`} />
        <textarea name="summary" defaultValue={module.summary} aria-label="Module summary" rows={2} placeholder="One or two sentences about this module" className={`${inputSmClass} w-full`} />
        {state.error && <p className="text-xs text-danger">{state.error}</p>}
      </div>
      <div className="flex items-center gap-2">
        <select name="published" defaultValue={String(module.published)} aria-label="Module visibility" className={inputSmClass}>
          <option value="true">Visible</option>
          <option value="false">Hidden</option>
        </select>
        <button disabled={pending} className={buttonClass("secondary", "px-3 py-1.5 text-xs")}>
          {pending ? "Saving…" : "Save"}
        </button>

      </div>
    </form>
  );
}

export function ChapterTitleForm({ chapterId, title }: { chapterId: string; title: string }) {
  const [state, action, pending] = useActionState<BuilderState, FormData>(renameChapterAction, {});
  return (
    <form action={action} className="flex min-w-0 flex-1 items-center gap-2">
      <input type="hidden" name="chapterId" value={chapterId} />
      <input name="title" defaultValue={title} aria-label="Chapter title" className={`${inputSmClass} min-w-0 flex-1 font-medium`} />
      <button disabled={pending} className={buttonClass("ghost", "px-2 py-1 text-xs")}>
        Rename
      </button>
      {state.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}

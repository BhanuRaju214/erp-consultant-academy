"use client";

import { useActionState, useState } from "react";
import { createUserAction, updateLessonAction, type AdminState } from "@/app/actions/admin";
import { Callout, buttonClass, inputClass } from "./ui";
import { PasswordInput } from "./password-input";
import { Markdown } from "./markdown";
import { EditPreviewTabs, PreviewNote, type EditView } from "./edit-preview-tabs";

export function CreateUserForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(createUserAction, {});
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <label className="sr-only" htmlFor="nu-name">
        Name
      </label>
      <input id="nu-name" name="name" placeholder="Full name" className={inputClass} required />
      <label className="sr-only" htmlFor="nu-email">
        Email
      </label>
      <input id="nu-email" name="email" type="email" placeholder="Email" className={inputClass} required />
      <label className="sr-only" htmlFor="nu-password">
        Initial password
      </label>
      <PasswordInput id="nu-password" name="password" placeholder="Initial password (10+ chars)" required autoComplete="new-password" />
      <label className="sr-only" htmlFor="nu-role">
        Role
      </label>
      <select id="nu-role" name="role" className={inputClass} defaultValue="student">
        <option value="student">Student</option>
        <option value="trainer">Trainer</option>
        <option value="admin">Admin</option>
      </select>
      <button disabled={pending} className={buttonClass("primary")}>
        {pending ? "Creating…" : "Create user"}
      </button>
      {(state.error || state.ok) && (
        <div className="sm:col-span-2 lg:col-span-5">
          <Callout tone={state.error ? "danger" : "success"}>{state.error ?? state.ok}</Callout>
        </div>
      )}
    </form>
  );
}

const SCOPES = ["standard", "configuration", "enterprise", "customization", "third-party"] as const;

export function LessonEditor({
  lesson,
  odooFields = true,
}: {
  lesson: { id: string; title: string; durationMin: number; odooVersions: string | null; scope: string[]; body: string };
  /** Odoo version and feature-scope labels only apply to the Odoo course. */
  odooFields?: boolean;
}) {
  const [state, action, pending] = useActionState<AdminState, FormData>(updateLessonAction, {});
  const [view, setView] = useState<EditView>("edit");
  const [title, setTitle] = useState(lesson.title);
  const [body, setBody] = useState(lesson.body);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lessonId" value={lesson.id} />
      <EditPreviewTabs view={view} onChange={setView} label="Preview lesson" />
      {view === "preview" && (
        <div className="space-y-4">
          <PreviewNote>Preview of your unsaved changes, as learners will see the lesson. Click Save lesson to publish them.</PreviewNote>
          <article className="rounded-lg border border-border bg-bg p-5 sm:p-8">
            <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-fg">{title || "Untitled lesson"}</h1>
            <div className="mt-6">{body.trim() ? <Markdown enhance>{body}</Markdown> : <Callout tone="info">This lesson hasn’t been written yet.</Callout>}</div>
          </article>
        </div>
      )}
      {/* The fields stay mounted while previewing so Save always sends the latest text. */}
      <div hidden={view === "preview"} className="space-y-4">
      {(state.error || state.ok) && <Callout tone={state.error ? "danger" : "success"}>{state.error ?? state.ok}</Callout>}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="le-title" className="mb-1 block text-sm font-medium text-fg">
            Title
          </label>
          <input id="le-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="le-duration" className="mb-1 block text-sm font-medium text-fg">
            Duration (min)
          </label>
          <input id="le-duration" name="durationMin" type="number" min={1} defaultValue={lesson.durationMin} className={inputClass} />
        </div>
        {odooFields ? (
          <div className="sm:col-span-2">
            <label htmlFor="le-versions" className="mb-1 block text-sm font-medium text-fg">
              Applicable Odoo version(s)
            </label>
            <input id="le-versions" name="odooVersions" defaultValue={lesson.odooVersions ?? ""} className={inputClass} placeholder="Odoo 17.0 / 18.0 or Version-independent" />
          </div>
        ) : (
          <input type="hidden" name="odooVersions" value={lesson.odooVersions ?? ""} />
        )}
      </div>
      {odooFields && (
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-fg">Feature scope labels</legend>
        <div className="flex flex-wrap gap-3">
          {SCOPES.map((s) => (
            <label key={s} className="flex items-center gap-1.5 text-sm text-fg">
              <input type="checkbox" name="scope" value={s} defaultChecked={lesson.scope.includes(s)} className="accent-[var(--primary)]" />
              {s}
            </label>
          ))}
        </div>
      </fieldset>
      )}
      <div>
        <label htmlFor="le-body" className="mb-1 block text-sm font-medium text-fg">
          Body (Markdown, GitHub-flavoured; raw HTML is not rendered)
        </label>
        <textarea id="le-body" name="body" value={body} onChange={(e) => setBody(e.target.value)} rows={28} className={`${inputClass} font-mono text-xs`} spellCheck={false} />
      </div>
      </div>
      <button disabled={pending} className={buttonClass("primary")}>
        {pending ? "Saving…" : "Save lesson"}
      </button>
    </form>
  );
}

"use client";

import { useActionState, useRef, useState } from "react";
import { ArrowRight, CircleCheck, Clock, UserPlus } from "lucide-react";
import { enrollByEmailAction, enrollSelfAction, saveProgramAction, type ProgramFormState } from "@/app/actions/programs";
import type { Program } from "@/lib/db/schema";
import { GST_RATE_PERCENT, formatRupees, gstOn } from "@/lib/gst";
import { EditPreviewTabs, PreviewNote, type EditView } from "./edit-preview-tabs";
import { Markdown } from "./markdown";
import { ProgramCard, priceLabel } from "./program-card";
import { Callout, Field, LevelBadge, buttonClass, inputClass } from "./ui";

export function EnrollButton({ slug, label = "Enroll now" }: { slug: string; label?: string }) {
  const [state, action, pending] = useActionState<ProgramFormState, FormData>(enrollSelfAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full sm:w-auto")}>
        {pending ? "Enrolling…" : label} <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}

export interface ProgramFormValues {
  id?: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  level: string;
  durationHours: number | null;
  highlights: string[];
  coverAssetId: string | null;
  status: string;
  enrollmentMode: string;
  position: number;
  pricePaise: number | null;
}

/** Reads the form as it is now (saved or not) into the shape the preview renders. */
function draftFromForm(form: HTMLFormElement, values: ProgramFormValues): Program {
  const fd = new FormData(form);
  const s = (k: string) => String(fd.get(k) ?? "").trim();
  const price = s("price");
  return {
    ...(values as unknown as Program),
    id: values.id ?? "preview",
    title: s("title") || "Untitled course",
    slug: s("slug") || "new-course",
    subtitle: s("subtitle"),
    description: s("description"),
    level: (s("level") || "beginner") as Program["level"],
    durationHours: s("durationHours") ? Number(s("durationHours")) : null,
    highlights: s("highlights")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 12),
    coverAssetId: s("coverAssetId") || null,
    status: s("status") as Program["status"],
    enrollmentMode: s("enrollmentMode") as Program["enrollmentMode"],
    pricePaise: price === "" ? null : Math.round(Number(price) * 100),
  };
}

/** How the course will look in the catalogue and on its course page. */
function ProgramPreview({ program }: { program: Program }) {
  const paid = program.enrollmentMode === "paid" && (program.pricePaise ?? 0) > 0;
  return (
    <div className="space-y-6">
      <PreviewNote>
        Preview of your unsaved changes{program.status === "draft" ? " (the course is a draft, so learners can’t see it yet)" : ""}. Click{" "}
        {program.id === "preview" ? "Create course" : "Save changes"} to keep them.
      </PreviewNote>
      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Catalogue card</h3>
        <div className="pointer-events-none max-w-sm" aria-hidden>
          <ProgramCard data={{ program, enrolled: false, lessonsDone: 0, lessonsTotal: 0, subCourses: 0 }} mode="catalog" />
        </div>
      </section>
      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Course page</h3>
        <article className="overflow-hidden rounded-lg border border-border bg-bg">
          <header className="bg-ink px-6 py-8 text-white">
            <h1 className="text-3xl font-extrabold tracking-[-0.02em]">{program.title}</h1>
            {program.subtitle && <p className="mt-2 max-w-2xl text-white/80">{program.subtitle}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80">
              <LevelBadge level={program.level} />
              {program.durationHours ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden /> {program.durationHours} hours
                </span>
              ) : null}
              <span className="font-semibold text-white">{priceLabel(program)}</span>
            </div>
          </header>
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_16rem]">
            <div className="space-y-6">
              {program.highlights.length > 0 && (
                <div className="rounded-lg border border-border bg-surface p-5">
                  <h2 className="text-lg font-bold text-fg">What you’ll learn</h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {program.highlights.map((h) => (
                      <li key={h} className="flex gap-2 text-sm text-fg">
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {program.description ? <Markdown>{program.description}</Markdown> : <p className="text-sm text-muted">No description yet.</p>}
            </div>
            <aside className="h-fit rounded-lg border border-border bg-surface p-5">
              {paid ? (
                <>
                  <div className="text-3xl font-extrabold tracking-[-0.02em] text-fg">{formatRupees(program.pricePaise!)}</div>
                  <p className="mt-0.5 text-xs text-muted">+ {GST_RATE_PERCENT}% GST · one-time payment</p>
                  <p className="mt-3 text-sm text-fg">
                    Learner pays <strong>{formatRupees(program.pricePaise! + gstOn(program.pricePaise!))}</strong>
                  </p>
                  <span className={buttonClass("primary", "mt-4 w-full")}>Buy now</span>
                </>
              ) : program.enrollmentMode === "paid" ? (
                <Callout tone="warning">Set a price for a paid course.</Callout>
              ) : (
                <>
                  <div className="text-2xl font-extrabold text-fg">{priceLabel(program)}</div>
                  <span className={buttonClass("primary", "mt-4 w-full")}>{program.enrollmentMode === "open" ? "Enroll for free" : "By invitation"}</span>
                </>
              )}
            </aside>
          </div>
        </article>
      </section>
    </div>
  );
}

export function ProgramForm({ values, images }: { values: ProgramFormValues; images: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<ProgramFormState, FormData>(saveProgramAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [view, setView] = useState<EditView>("edit");
  const [draft, setDraft] = useState<Program | null>(null);
  const switchView = (v: EditView) => {
    if (v === "preview" && formRef.current) setDraft(draftFromForm(formRef.current, values));
    setView(v);
  };
  return (
    <form ref={formRef} action={action} className="space-y-4">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      {state.success && <Callout tone="success">{state.success}</Callout>}
      <EditPreviewTabs view={view} onChange={switchView} label="Preview course" />
      {view === "preview" && draft && <ProgramPreview program={draft} />}
      {/* The fields stay mounted while previewing so saving always sends what was typed. */}
      <div hidden={view === "preview"} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Course title" htmlFor="p-title">
          <input id="p-title" name="title" defaultValue={values.title} required maxLength={120} className={inputClass} />
        </Field>
        <Field label="URL name" htmlFor="p-slug" hint="Used in the address, e.g. /catalog/odoo-erp-consultant">
          <input id="p-slug" name="slug" defaultValue={values.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} />
        </Field>
      </div>
      <Field label="Subtitle" htmlFor="p-subtitle" hint="One line shown on the course card.">
        <input id="p-subtitle" name="subtitle" defaultValue={values.subtitle} maxLength={200} className={inputClass} />
      </Field>
      <Field label="Description" htmlFor="p-description" hint="Shown on the course page. Markdown is supported.">
        <textarea id="p-description" name="description" defaultValue={values.description} rows={6} className={inputClass} />
      </Field>
      <Field label="What you'll learn" htmlFor="p-highlights" hint="One point per line (up to 12).">
        <textarea id="p-highlights" name="highlights" defaultValue={values.highlights.join("\n")} rows={5} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Level" htmlFor="p-level">
          <select id="p-level" name="level" defaultValue={values.level} className={inputClass}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Field>
        <Field label="Duration (hours)" htmlFor="p-duration">
          <input id="p-duration" name="durationHours" type="number" min={0} max={2000} defaultValue={values.durationHours ?? ""} className={inputClass} />
        </Field>
        <Field label="Order in catalogue" htmlFor="p-position" hint="Lower numbers come first.">
          <input id="p-position" name="position" type="number" min={0} defaultValue={values.position} className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Cover image" htmlFor="p-cover" hint="Upload images in the Media library first.">
          <select id="p-cover" name="coverAssetId" defaultValue={values.coverAssetId ?? ""} className={inputClass}>
            <option value="">Default cover</option>
            {images.map((img) => (
              <option key={img.id} value={img.id}>
                {img.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" htmlFor="p-status">
          <select id="p-status" name="status" defaultValue={values.status} className={inputClass}>
            <option value="draft">Draft (hidden from learners)</option>
            <option value="published">Published (in the catalogue)</option>
            <option value="archived">Archived (enrolled learners keep access)</option>
          </select>
        </Field>
        <Field label="Who can enrol" htmlFor="p-mode">
          <select id="p-mode" name="enrollmentMode" defaultValue={values.enrollmentMode} className={inputClass}>
            <option value="paid">Paid (buy with Razorpay)</option>
            <option value="open">Free (anyone signed in)</option>
            <option value="invite">Invite only (admins enrol learners)</option>
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price (₹, before GST)" htmlFor="p-price" hint="Used when enrolment is Paid. 18% GST is added at checkout (₹1,000 → learner pays ₹1,180).">
          <input
            id="p-price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={values.pricePaise != null ? values.pricePaise / 100 : ""}
            placeholder="e.g. 4999"
            className={inputClass}
          />
        </Field>
      </div>
      </div>
      <button type="submit" disabled={pending} className={buttonClass("primary")}>
        {pending ? "Saving…" : values.id ? "Save changes" : "Create course"}
      </button>
    </form>
  );
}

export function EnrollUserForm({ programId }: { programId: string }) {
  const [state, action, pending] = useActionState<ProgramFormState, FormData>(enrollByEmailAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="programId" value={programId} />
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      {state.success && <Callout tone="success">{state.success}</Callout>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="enroll-email" className="sr-only">
          Learner email
        </label>
        <input id="enroll-email" name="email" type="email" required placeholder="learner@example.com" className={inputClass} />
        <button type="submit" disabled={pending} className={buttonClass("primary", "shrink-0")}>
          <UserPlus className="h-4 w-4" aria-hidden /> {pending ? "Enrolling…" : "Enroll learner"}
        </button>
      </div>
    </form>
  );
}

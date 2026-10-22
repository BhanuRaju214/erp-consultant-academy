"use client";

import { useActionState } from "react";
import { ArrowRight, UserPlus } from "lucide-react";
import { enrollByEmailAction, enrollSelfAction, saveProgramAction, type ProgramFormState } from "@/app/actions/programs";
import { Callout, Field, buttonClass, inputClass } from "./ui";

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

export function ProgramForm({ values, images }: { values: ProgramFormValues; images: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<ProgramFormState, FormData>(saveProgramAction, {});
  return (
    <form action={action} className="space-y-4">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      {state.success && <Callout tone="success">{state.success}</Callout>}
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
        <Field label="Price (₹, including GST)" htmlFor="p-price" hint="Used when enrolment is Paid. Learners pay exactly this amount.">
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

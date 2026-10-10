"use client";

import { useActionState, useEffect, useRef } from "react";
import { giveFeedback, reviewSubmission, submitAssignment, type SubmitState } from "@/app/actions/assignments";
import { Callout, buttonClass, inputClass } from "./ui";

export function SubmissionForm({ assignmentId }: { assignmentId: string }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitAssignment, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      {state.ok && <Callout tone="success">Submitted. Your trainer will review it and leave feedback on your dashboard.</Callout>}
      <div>
        <label htmlFor="sub-body" className="mb-1 block text-sm font-medium text-fg">
          Answer / summary
        </label>
        <textarea id="sub-body" name="body" rows={8} className={inputClass} placeholder="Summarise your approach, assumptions and results. Markdown tables are fine." />
      </div>
      <div>
        <label htmlFor="sub-file" className="mb-1 block text-sm font-medium text-fg">
          Attachment (optional, max 5 MB)
        </label>
        <input
          id="sub-file"
          name="file"
          type="file"
          accept=".pdf,.docx,.xlsx,.csv,.zip,.png,.jpg,.jpeg,.txt,.md,.py,.xml"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
        />
        <p className="mt-1 text-xs text-muted">Use fictional data only. Never upload real customer data, credentials or API keys.</p>
      </div>
      <button disabled={pending} className={buttonClass("primary")}>
        {pending ? "Submitting…" : "Submit assignment"}
      </button>
    </form>
  );
}

export function ReviewForm({ submissionId }: { submissionId: string }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(reviewSubmission, {});
  return (
    <form action={action} className="mt-3 space-y-2 rounded-lg bg-surface-2 p-3">
      <input type="hidden" name="submissionId" value={submissionId} />
      <label htmlFor={`fb-${submissionId}`} className="sr-only">
        Feedback
      </label>
      <textarea id={`fb-${submissionId}`} name="feedback" rows={3} className={inputClass} placeholder="Feedback against the rubric…" />
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`gr-${submissionId}`} className="text-xs text-muted">
          Grade
        </label>
        <input id={`gr-${submissionId}`} name="grade" type="number" min={0} max={100} className={`${inputClass} w-24`} />
        <button name="status" value="accepted" disabled={pending} className={buttonClass("primary", "text-xs")}>
          Accept
        </button>
        <button name="status" value="needs_revision" disabled={pending} className={buttonClass("secondary", "text-xs")}>
          Request revision
        </button>
        {state.error && <span className="text-xs text-danger">{state.error}</span>}
        {state.ok && <span className="text-xs text-success">Review saved.</span>}
      </div>
    </form>
  );
}

export function FeedbackForm({ studentId }: { studentId: string }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(giveFeedback, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-2">
      <input type="hidden" name="studentId" value={studentId} />
      <label htmlFor="general-feedback" className="sr-only">
        Feedback
      </label>
      <textarea id="general-feedback" name="feedback" rows={3} className={inputClass} placeholder="General coaching feedback shown on the trainee's dashboard…" />
      <div className="flex items-center gap-2">
        <button disabled={pending} className={buttonClass("primary")}>
          Send feedback
        </button>
        {state.error && <span className="text-sm text-danger">{state.error}</span>}
        {state.ok && <span className="text-sm text-success">Sent.</span>}
      </div>
    </form>
  );
}

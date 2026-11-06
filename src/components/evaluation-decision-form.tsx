"use client";

import Link from "next/link";
import { useActionState } from "react";
import { decideEvaluationAction, type DecisionState } from "@/app/actions/evaluation";
import { EVALUATION_PASS_MARK } from "@/lib/evaluation/rubric";
import { Callout, buttonClass, inputClass } from "./ui";

export function EvaluationDecisionForm({ evaluationId, aiScore }: { evaluationId: string; aiScore: number | null }) {
  const [state, action, pending] = useActionState<DecisionState, FormData>(decideEvaluationAction, {});
  if (state.ok) {
    return state.serial ? (
      <Callout tone="success" title="Approved — final certificate issued">
        <Link href={`/certificates/${state.serial}`} className="font-medium underline">Certificate {state.serial}</Link>
      </Callout>
    ) : (
      <Callout tone="info">Sent back to the trainee. They can start a new attempt.</Callout>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="evaluationId" value={evaluationId} />
      {state.error && <Callout tone="danger">{state.error}</Callout>}
      <div>
        <label htmlFor="ev-score" className="mb-1 block text-sm font-medium text-fg">
          Confirmed score (0–100, pass mark {EVALUATION_PASS_MARK})
        </label>
        <input id="ev-score" name="score" type="number" min={0} max={100} required defaultValue={aiScore ?? ""} className={inputClass} />
        <p className="mt-1 text-xs text-muted">Pre-filled with the AI score. Adjust it if your review of the recording differs.</p>
      </div>
      <div>
        <label htmlFor="ev-note" className="mb-1 block text-sm font-medium text-fg">
          Note to the trainee
        </label>
        <textarea id="ev-note" name="note" rows={4} required className={inputClass} placeholder="What was strong, and what to improve (required when sending back)." />
      </div>
      <div className="flex flex-wrap gap-2">
        <button name="decision" value="approved" disabled={pending} className={buttonClass("primary")}>
          Approve and issue certificate
        </button>
        <button name="decision" value="needs_revision" disabled={pending} className={buttonClass("secondary")}>
          Ask to present again
        </button>
      </div>
    </form>
  );
}

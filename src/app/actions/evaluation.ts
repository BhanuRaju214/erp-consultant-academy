"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { decideEvaluation } from "@/lib/services/evaluation";

export type DecisionState = { error?: string; ok?: boolean; serial?: string | null };

const schema = z.object({
  evaluationId: z.string().uuid(),
  decision: z.enum(["approved", "needs_revision"]),
  score: z.coerce.number().int().min(0).max(100),
  note: z.string().trim().min(3, "Write a note for the trainee.").max(5000),
});

/** Trainer confirms (issues the final certificate) or asks the trainee to present again. */
export async function decideEvaluationAction(_: DecisionState, formData: FormData): Promise<DecisionState> {
  const trainer = await requirePermission("trainer:review");
  const parsed = schema.safeParse({
    evaluationId: formData.get("evaluationId"),
    decision: formData.get("decision"),
    score: formData.get("score"),
    note: formData.get("note"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const res = await decideEvaluation(await getDb(), { ...parsed.data, trainerId: trainer.id });
  if (!res.ok) return { error: res.error };
  revalidatePath("/trainer/evaluations");
  revalidatePath(`/trainer/evaluations/${parsed.data.evaluationId}`);
  return { ok: true, serial: res.certificate?.serial ?? null };
}

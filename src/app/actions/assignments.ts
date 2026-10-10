"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assignments, submissions, trainerFeedback } from "@/lib/db/schema";
import { saveUpload, validateUpload } from "@/lib/storage";

export type SubmitState = { error?: string; ok?: boolean };

export async function submitAssignment(_: SubmitState, formData: FormData): Promise<SubmitState> {
  const user = await requireUser();
  const db = await getDb();
  const assignmentId = z.string().uuid().safeParse(formData.get("assignmentId"));
  if (!assignmentId.success) return { error: "Unknown assignment." };
  const assignment = await db.query.assignments.findFirst({ where: eq(assignments.id, assignmentId.data) });
  if (!assignment) return { error: "Unknown assignment." };

  const body = String(formData.get("body") ?? "").trim().slice(0, 20_000);
  const file = formData.get("file");
  const hasFile = file instanceof File && file.size > 0;
  if (!body && !hasFile) return { error: "Write your answer or attach a file." };

  let stored: { relPath: string; fileName: string } | null = null;
  if (hasFile) {
    const err = validateUpload(file);
    if (err) return { error: err };
    stored = await saveUpload(`submissions-${user.id}`, file);
  }
  await db.insert(submissions).values({
    assignmentId: assignment.id,
    userId: user.id,
    body,
    fileName: stored?.fileName ?? null,
    filePath: stored?.relPath ?? null,
  });
  revalidatePath(`/assignments/${assignment.slug}`);
  revalidatePath("/trainer");
  return { ok: true };
}

const reviewSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(["needs_revision", "accepted"]),
  grade: z.coerce.number().int().min(0).max(100).optional(),
  feedback: z.string().trim().min(3, "Write feedback for the trainee.").max(5000),
});

export async function reviewSubmission(_: SubmitState, formData: FormData): Promise<SubmitState> {
  const trainer = await requirePermission("trainer:review");
  const parsed = reviewSchema.safeParse({
    submissionId: formData.get("submissionId"),
    status: formData.get("status"),
    grade: formData.get("grade") || undefined,
    feedback: formData.get("feedback"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const db = await getDb();
  const sub = await db.query.submissions.findFirst({ where: eq(submissions.id, parsed.data.submissionId) });
  if (!sub) return { error: "Submission not found." };
  await db.transaction(async (tx) => {
    await tx.update(submissions).set({ status: parsed.data.status, grade: parsed.data.grade ?? null }).where(eq(submissions.id, sub.id));
    await tx.insert(trainerFeedback).values({ trainerId: trainer.id, studentId: sub.userId, submissionId: sub.id, body: parsed.data.feedback });
  });
  revalidatePath("/trainer");
  return { ok: true };
}

export async function giveFeedback(_: SubmitState, formData: FormData): Promise<SubmitState> {
  const trainer = await requirePermission("trainer:review");
  const parsed = z
    .object({ studentId: z.string().uuid(), feedback: z.string().trim().min(3, "Write some feedback.").max(5000) })
    .safeParse({ studentId: formData.get("studentId"), feedback: formData.get("feedback") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await (await getDb()).insert(trainerFeedback).values({ trainerId: trainer.id, studentId: parsed.data.studentId, body: parsed.data.feedback });
  revalidatePath(`/trainer/students/${parsed.data.studentId}`);
  return { ok: true };
}

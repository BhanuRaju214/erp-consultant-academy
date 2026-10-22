"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assessments, questions } from "@/lib/db/schema";
import { openAiClient } from "@/lib/ai/llm";
import { rateLimit } from "@/lib/rate-limit";
import { QUIZ_LIMITS, addQuestion, deleteQuestion, deleteQuiz, moveQuestion, programForModule, saveQuizSettings, updateQuestion, writeModuleQuiz } from "@/lib/services/quizzes";

export interface QuizFormState {
  error?: string;
  saved?: number;
}

const id = z.string().uuid();

async function refresh(moduleId: string) {
  const program = await programForModule(await getDb(), moduleId);
  if (!program) return;
  revalidatePath(`/admin/programs/${program.id}`, "layout");
  revalidatePath(`/admin/programs/${program.id}/quiz/${moduleId}`);
  revalidatePath(`/programs/${program.slug}`, "layout");
}

async function moduleIdForQuestion(questionId: string): Promise<string | null> {
  const db = await getDb();
  const q = await db.query.questions.findFirst({ where: eq(questions.id, questionId), columns: { assessmentId: true } });
  if (!q) return null;
  const a = await db.query.assessments.findFirst({ where: eq(assessments.id, q.assessmentId), columns: { courseId: true } });
  return a?.courseId ?? null;
}

/** Question fields from the editor form: option0..option5 and one "correct" entry per ticked option. */
function questionFromForm(formData: FormData) {
  return {
    prompt: String(formData.get("prompt") ?? ""),
    kind: String(formData.get("kind") ?? "single") as "single" | "multiple" | "truefalse",
    options: Array.from({ length: QUIZ_LIMITS.options }, (_, i) => String(formData.get(`option${i}`) ?? "")),
    correct: formData.getAll("correct").map((v) => Number(v)).filter((n) => Number.isInteger(n) && n >= 0),
    explanation: String(formData.get("explanation") ?? ""),
  };
}

export async function saveQuizSettingsAction(_: QuizFormState, formData: FormData): Promise<QuizFormState> {
  await requirePermission("admin:content");
  const moduleId = id.parse(formData.get("moduleId"));
  const res = await saveQuizSettings(await getDb(), moduleId, { title: String(formData.get("title") ?? ""), passMark: String(formData.get("passMark") ?? "") });
  if (!res.ok) return { error: res.error };
  await refresh(moduleId);
  return { saved: Date.now() };
}

export async function addQuestionAction(_: QuizFormState, formData: FormData): Promise<QuizFormState> {
  await requirePermission("admin:content");
  const moduleId = id.parse(formData.get("moduleId"));
  const res = await addQuestion(await getDb(), moduleId, questionFromForm(formData));
  if (!res.ok) return { error: res.error };
  await refresh(moduleId);
  return { saved: Date.now() };
}

export async function updateQuestionAction(_: QuizFormState, formData: FormData): Promise<QuizFormState> {
  await requirePermission("admin:content");
  const questionId = id.parse(formData.get("questionId"));
  const res = await updateQuestion(await getDb(), questionId, questionFromForm(formData));
  if (!res.ok) return { error: res.error };
  const moduleId = await moduleIdForQuestion(questionId);
  if (moduleId) await refresh(moduleId);
  return { saved: Date.now() };
}

export async function deleteQuestionAction(formData: FormData) {
  await requirePermission("admin:content");
  const questionId = id.parse(formData.get("questionId"));
  const moduleId = await moduleIdForQuestion(questionId);
  await deleteQuestion(await getDb(), questionId);
  if (moduleId) await refresh(moduleId);
}

export async function moveQuestionAction(formData: FormData) {
  await requirePermission("admin:content");
  const questionId = id.parse(formData.get("questionId"));
  await moveQuestion(await getDb(), questionId, formData.get("direction") === "up" ? "up" : "down");
  const moduleId = await moduleIdForQuestion(questionId);
  if (moduleId) await refresh(moduleId);
}

export async function deleteQuizAction(formData: FormData) {
  await requirePermission("admin:content");
  const moduleId = id.parse(formData.get("moduleId"));
  await deleteQuiz(await getDb(), moduleId);
  await refresh(moduleId);
}

/** Writes (or rewrites) the module's quiz with the AI from its lessons. Takes up to a minute. */
export async function generateQuizAction(_: QuizFormState, formData: FormData): Promise<QuizFormState> {
  const user = await requirePermission("admin:content");
  const moduleId = id.parse(formData.get("moduleId"));
  const count = z.coerce.number().int().min(3).max(15).safeParse(formData.get("count"));
  if (!count.success) return { error: "Choose 3-15 questions." };
  const llm = openAiClient();
  if (!llm) return { error: "The AI isn't set up yet: add OPENAI_API_KEY to the server settings." };
  if (!rateLimit(`ai-quiz:${user.id}`, 30, 60 * 60_000)) return { error: "Too many AI requests this hour. Try again later." };
  try {
    await writeModuleQuiz(await getDb(), llm, moduleId, { count: count.data, language: String(formData.get("language") ?? "") || undefined });
  } catch (err) {
    return { error: (err as Error).message };
  }
  await refresh(moduleId);
  return { saved: Date.now() };
}

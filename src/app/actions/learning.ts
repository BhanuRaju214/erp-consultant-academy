"use server";

import { and, eq } from "drizzle-orm";
import { requireCourseUser, requireLessonUser, requireProgramUser } from "@/lib/auth/course-access";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { assessments, bookmarks, certificates,discussions, learningPaths, notes, questions, users } from "@/lib/db/schema";
import { getProgramCertificateStatus, setLessonCompleted, submitAssessment } from "@/lib/services/learning";
import { FLAGSHIP_PROGRAM } from "@/lib/services/programs";
import { programForAssessment } from "@/lib/services/quizzes";
import { importProjectTestCases, setStepCompleted, setTaskStatus } from "@/lib/services/practice";

export async function toggleLessonComplete(lessonId: string, completed: boolean, path: string) {
  const user = await requireLessonUser(lessonId);
  await setLessonCompleted(await getDb(), user.id, z.string().uuid().parse(lessonId), completed);
  revalidatePath(path);
}

export async function toggleBookmark(lessonId: string, path: string) {
  const user = await requireLessonUser(lessonId);
  const db = await getDb();
  const id = z.string().uuid().parse(lessonId);
  const existing = await db.query.bookmarks.findFirst({ where: and(eq(bookmarks.userId, user.id), eq(bookmarks.lessonId, id)) });
  if (existing) await db.delete(bookmarks).where(and(eq(bookmarks.userId, user.id), eq(bookmarks.lessonId, id)));
  else await db.insert(bookmarks).values({ userId: user.id, lessonId: id });
  revalidatePath(path);
}

export async function saveNote(lessonId: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const user = await requireLessonUser(lessonId);
  const parsed = z.object({ lessonId: z.string().uuid(), body: z.string().max(20_000) }).safeParse({ lessonId, body });
  if (!parsed.success) return { ok: false, error: "Note is too long (max 20,000 characters)." };
  const db = await getDb();
  if (!parsed.data.body.trim()) {
    await db.delete(notes).where(and(eq(notes.userId, user.id), eq(notes.lessonId, parsed.data.lessonId)));
    return { ok: true };
  }
  await db
    .insert(notes)
    .values({ userId: user.id, lessonId: parsed.data.lessonId, body: parsed.data.body })
    .onConflictDoUpdate({ target: [notes.userId, notes.lessonId], set: { body: parsed.data.body, updatedAt: new Date() } });
  return { ok: true };
}

export async function submitQuiz(assessmentId: string, answers: Record<string, number[]>) {
  const db = await getDb();
  const id = z.string().uuid().parse(assessmentId);
  // Quizzes of builder courses need access to that course; everything else is the Odoo course.
  const program = await programForAssessment(db, id);
  const builderCourse = program && program.slug !== FLAGSHIP_PROGRAM.slug ? program : null;
  const user = builderCourse ? await requireProgramUser(builderCourse.slug) : await requireCourseUser();
  const schema = z.record(z.string().uuid(), z.array(z.number().int().min(0).max(20)).max(20));
  const parsed = schema.safeParse(answers);
  if (!parsed.success) return { ok: false as const, error: "Invalid answers." };
  const res = await submitAssessment(db, user.id, id, parsed.data);
  // The answer key is only revealed after submission.
  const key = await db.select({ id: questions.id, correct: questions.correct, explanation: questions.explanation }).from(questions).where(eq(questions.assessmentId, id));
  const assessment = await db.query.assessments.findFirst({ where: eq(assessments.id, id) });
  const cert = builderCourse
    ? (await getProgramCertificateStatus(db, user.id, builderCourse.id)).certificate
    : assessment?.courseId
      ? await db.query.certificates.findFirst({ where: and(eq(certificates.userId, user.id), eq(certificates.courseId, assessment.courseId)) })
      : undefined;
  if (builderCourse) revalidatePath(`/programs/${builderCourse.slug}`, "layout");
  revalidatePath("/assessments");
  revalidatePath("/dashboard");
  revalidatePath("/learn");
  return {
    ok: true as const,
    score: res.score,
    passed: res.passed,
    review: res.graded.map((g) => {
      const k = key.find((q) => q.id === g.questionId);
      return { questionId: g.questionId, isCorrect: g.correct, correct: k?.correct ?? [], explanation: k?.explanation ?? "" };
    }),
    certificateSerial: cert?.serial ?? null,
  };
}

export async function toggleExerciseStep(stepId: string, completed: boolean, path: string) {
  const user = await requireCourseUser();
  const res = await setStepCompleted(await getDb(), user.id, z.string().uuid().parse(stepId), completed);
  revalidatePath(path);
  return res;
}

export async function updateProjectTask(taskId: string, status: "todo" | "in_progress" | "done", path: string) {
  const user = await requireCourseUser();
  await setTaskStatus(await getDb(), user.id, z.string().uuid().parse(taskId), z.enum(["todo", "in_progress", "done"]).parse(status));
  revalidatePath(path);
}

export async function loadProjectTestCases(projectId: string) {
  const user = await requireCourseUser();
  const n = await importProjectTestCases(await getDb(), user.id, z.string().uuid().parse(projectId));
  revalidatePath("/testing");
  return n;
}

export async function changeLearningPath(formData: FormData) {
  const user = await requireCourseUser();
  const db = await getDb();
  const slug = String(formData.get("path") ?? "");
  const path = await db.query.learningPaths.findFirst({ where: eq(learningPaths.slug, slug) });
  await db.update(users).set({ learningPathId: path?.id ?? null }).where(eq(users.id, user.id));
  revalidatePath("/dashboard");
  revalidatePath("/learn");
}

const postSchema = z.object({
  title: z.string().trim().max(160).optional(),
  body: z.string().trim().min(3, "Write at least a few words.").max(5000),
  lessonId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
});

export type PostState = { error?: string; ok?: boolean };

export async function postDiscussion(_: PostState, formData: FormData): Promise<PostState> {
  const user = await requireCourseUser();
  const parsed = postSchema.safeParse({
    title: formData.get("title") || undefined,
    body: formData.get("body"),
    lessonId: formData.get("lessonId") || undefined,
    parentId: formData.get("parentId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (!parsed.data.parentId && !parsed.data.title) return { error: "Add a short title for your question." };
  await (await getDb()).insert(discussions).values({ ...parsed.data, userId: user.id });
  revalidatePath("/discussions");
  return { ok: true };
}

export async function resolveDiscussion(id: string) {
  const user = await requireCourseUser();
  const db = await getDb();
  const d = await db.query.discussions.findFirst({ where: eq(discussions.id, z.string().uuid().parse(id)) });
  if (!d) return;
  // Authors and trainers/admins may mark a question resolved.
  if (d.userId !== user.id) await requirePermission("trainer:review");
  await db.update(discussions).set({ resolved: !d.resolved }).where(eq(discussions.id, d.id));
  revalidatePath("/discussions");
}

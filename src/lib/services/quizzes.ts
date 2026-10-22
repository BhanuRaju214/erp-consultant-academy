import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/lib/db/client";
import { assessments, courseModules, courses, lessons, programs, questions } from "@/lib/db/schema";
import type { LlmClient, LlmUsage } from "@/lib/ai/llm";
import { slugify } from "./builder";
import type { ServiceResult } from "./users";

/**
 * Graded module quizzes for courses built in the course builder. Each module
 * (`courses` row) has at most one quiz (`assessments.courseId`). Learners earn the
 * course certificate by completing every lesson and passing every module quiz.
 */

export const QUIZ_LIMITS = { questions: 30, options: 6 } as const;
export const TRUE_FALSE = ["True", "False"];

export const questionInputSchema = z
  .object({
    prompt: z.string().trim().min(5, "Write the question (at least 5 characters).").max(1000),
    kind: z.enum(["single", "multiple", "truefalse"]),
    options: z.array(z.string().trim().max(300)).max(QUIZ_LIMITS.options),
    correct: z.array(z.number().int().min(0)).max(QUIZ_LIMITS.options),
    explanation: z.string().trim().max(1500).default(""),
  })
  .transform((q) => {
    // Blank options are dropped; correct indexes are remapped to the remaining ones.
    if (q.kind === "truefalse") return { ...q, options: TRUE_FALSE, correct: q.correct.filter((i) => i < 2).slice(0, 1) };
    const keep = q.options.map((o, i) => ({ o, i })).filter((x) => x.o.length > 0);
    const correct = keep.flatMap((x, ni) => (q.correct.includes(x.i) ? [ni] : []));
    return { ...q, options: keep.map((x) => x.o), correct };
  })
  .superRefine((q, ctx) => {
    if (q.options.length < 2) ctx.addIssue({ code: "custom", message: "Give at least two options." });
    if (new Set(q.options.map((o) => o.toLowerCase())).size !== q.options.length) ctx.addIssue({ code: "custom", message: "Options must be different from each other." });
    if (q.correct.length === 0) ctx.addIssue({ code: "custom", message: "Mark the correct answer." });
    if (q.kind !== "multiple" && q.correct.length > 1) ctx.addIssue({ code: "custom", message: "A single-answer question has exactly one correct option." });
  });
export type QuestionInput = z.output<typeof questionInputSchema>;

export const quizSettingsSchema = z.object({
  title: z.string().trim().min(2, "Enter a quiz title.").max(200),
  passMark: z.coerce.number().int().min(1, "Pass mark is 1-100%.").max(100, "Pass mark is 1-100%."),
});

/** The module's quiz with its questions (answer key included: staff only). */
export async function getModuleQuiz(db: Db, moduleId: string) {
  return (
    (await db.query.assessments.findFirst({
      where: eq(assessments.courseId, moduleId),
      with: { questions: { orderBy: [asc(questions.position)] } },
    })) ?? null
  );
}

/** Creates the module's quiz if it doesn't exist yet. */
async function ensureQuiz(db: Db, moduleId: string, settings?: { title: string; passMark: number }) {
  const existing = await db.query.assessments.findFirst({ where: eq(assessments.courseId, moduleId) });
  if (existing) return existing;
  const mod = await db.query.courses.findFirst({ where: eq(courses.id, moduleId), columns: { slug: true, title: true } });
  if (!mod) throw new Error("Module not found.");
  const base = `${mod.slug}-quiz`;
  const taken = new Set((await db.select({ slug: assessments.slug }).from(assessments).where(sql`${assessments.slug} like ${base + "%"}`)).map((r) => r.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  const [created] = await db
    .insert(assessments)
    .values({ slug, courseId: moduleId, title: settings?.title ?? `${mod.title}: quiz`, passMark: settings?.passMark ?? 70 })
    .onConflictDoNothing()
    .returning();
  return created ?? (await db.query.assessments.findFirst({ where: eq(assessments.courseId, moduleId) }))!;
}

export async function saveQuizSettings(db: Db, moduleId: string, input: { title: string; passMark: number | string }): Promise<ServiceResult<{ id: string }>> {
  const parsed = quizSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the quiz settings." };
  const quiz = await ensureQuiz(db, moduleId, parsed.data);
  await db.update(assessments).set({ title: parsed.data.title, passMark: parsed.data.passMark, updatedAt: new Date() }).where(eq(assessments.id, quiz.id));
  return { ok: true, value: { id: quiz.id } };
}

export async function deleteQuiz(db: Db, moduleId: string): Promise<void> {
  await db.delete(assessments).where(eq(assessments.courseId, moduleId));
}

export async function addQuestion(db: Db, moduleId: string, input: z.input<typeof questionInputSchema>): Promise<ServiceResult<{ id: string }>> {
  const parsed = questionInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the question." };
  const quiz = await ensureQuiz(db, moduleId);
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(questions).where(eq(questions.assessmentId, quiz.id));
  if (n >= QUIZ_LIMITS.questions) return { ok: false, error: `A quiz can have at most ${QUIZ_LIMITS.questions} questions.` };
  const [row] = await db
    .insert(questions)
    .values({ assessmentId: quiz.id, ...parsed.data, position: n })
    .returning({ id: questions.id });
  return { ok: true, value: row };
}

export async function updateQuestion(db: Db, questionId: string, input: z.input<typeof questionInputSchema>): Promise<ServiceResult<null>> {
  const parsed = questionInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the question." };
  await db.update(questions).set(parsed.data).where(eq(questions.id, questionId));
  return { ok: true, value: null };
}

export async function deleteQuestion(db: Db, questionId: string): Promise<void> {
  const q = await db.query.questions.findFirst({ where: eq(questions.id, questionId) });
  if (!q) return;
  await db.delete(questions).where(eq(questions.id, questionId));
  await renumber(db, q.assessmentId);
}

export async function moveQuestion(db: Db, questionId: string, direction: "up" | "down"): Promise<void> {
  const q = await db.query.questions.findFirst({ where: eq(questions.id, questionId) });
  if (!q) return;
  const ids = await renumber(db, q.assessmentId);
  const i = ids.indexOf(questionId);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  await db.update(questions).set({ position: j }).where(eq(questions.id, ids[i]));
  await db.update(questions).set({ position: i }).where(eq(questions.id, ids[j]));
}

/** Keeps positions dense (0, 1, 2…) and returns the ids in order. */
async function renumber(db: Db, assessmentId: string): Promise<string[]> {
  const rows = await db.select({ id: questions.id, position: questions.position }).from(questions).where(eq(questions.assessmentId, assessmentId)).orderBy(asc(questions.position), asc(questions.prompt));
  for (const [i, r] of rows.entries()) if (r.position !== i) await db.update(questions).set({ position: i }).where(eq(questions.id, r.id));
  return rows.map((r) => r.id);
}

/** Replaces every question of the module's quiz (used by the AI writer). Past attempts keep their scores. */
export async function replaceQuizQuestions(db: Db, moduleId: string, list: QuestionInput[]): Promise<string> {
  const quiz = await ensureQuiz(db, moduleId);
  await db.transaction(async (tx) => {
    await tx.delete(questions).where(eq(questions.assessmentId, quiz.id));
    if (list.length) await tx.insert(questions).values(list.map((q, position) => ({ assessmentId: quiz.id, ...q, position })));
  });
  return quiz.id;
}

/** Program the module belongs to (for access checks and revalidation). */
export async function programForModule(db: Db, moduleId: string) {
  const [row] = await db
    .select({ id: programs.id, slug: programs.slug })
    .from(courses)
    .innerJoin(programs, eq(programs.id, courses.programId))
    .where(eq(courses.id, moduleId))
    .limit(1);
  return row ?? null;
}

export async function programForAssessment(db: Db, assessmentId: string) {
  const [row] = await db
    .select({ id: programs.id, slug: programs.slug, homePath: programs.homePath })
    .from(assessments)
    .innerJoin(courses, eq(courses.id, assessments.courseId))
    .innerJoin(programs, eq(programs.id, courses.programId))
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  return row ?? null;
}

/* ------------------------------------------------------------------ */
/* AI quiz writer                                                      */
/* ------------------------------------------------------------------ */

const QUIZ_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["prompt", "kind", "options", "correct", "explanation"],
        properties: {
          prompt: { type: "string" },
          kind: { type: "string", enum: ["single", "multiple", "truefalse"] },
          options: { type: "array", items: { type: "string" } },
          correct: { type: "array", items: { type: "integer" } },
          explanation: { type: "string" },
        },
      },
    },
  },
} as const;

/** Models tend to put the right answer in the same place; shuffle so its position gives nothing away. */
export function shuffleOptions(q: QuestionInput, random: () => number = Math.random): QuestionInput {
  if (q.kind === "truefalse") return q;
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), correct: order.flatMap((oldIndex, newIndex) => (q.correct.includes(oldIndex) ? [newIndex] : [])) };
}

/** Lesson text sent to the model per lesson, and in total, to keep prompts bounded. */
const LESSON_CHARS = 5000;
const TOTAL_CHARS = 40000;

/**
 * Writes the module's graded quiz from its lessons and replaces the current
 * questions. Invalid questions from the model are dropped; at least half of the
 * requested number must survive.
 */
export async function writeModuleQuiz(
  db: Db,
  llm: LlmClient,
  moduleId: string,
  opts: { count: number; language?: string; level?: string; instructions?: string },
): Promise<{ usage: LlmUsage; questions: number }> {
  const [mod] = await db
    .select({ title: courses.title, summary: courses.summary, courseTitle: programs.title })
    .from(courses)
    .innerJoin(programs, eq(programs.id, courses.programId))
    .where(eq(courses.id, moduleId))
    .limit(1);
  if (!mod) throw new Error("Module not found.");
  const rows = await db
    .select({ title: lessons.title, body: lessons.body })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .where(and(eq(courseModules.courseId, moduleId)))
    .orderBy(asc(courseModules.position), asc(lessons.position));
  let budget = TOTAL_CHARS;
  const material = rows
    .map((l) => {
      const text = l.body.replace(/```[\s\S]*?```/g, "").slice(0, Math.max(0, Math.min(LESSON_CHARS, budget)));
      budget -= text.length;
      return `### ${l.title}\n${text || "(no text yet)"}`;
    })
    .join("\n\n");
  if (!rows.some((l) => l.body.trim().length > 100)) throw new Error("Write the module's lessons before its quiz.");

  const count = Math.max(1, Math.min(QUIZ_LIMITS.questions, opts.count));
  const system = [
    "You are a senior instructional designer writing graded assessments for Nexsademy, a practical online learning platform.",
    "Questions must be answerable from the lesson material provided. Never test trivia, wording or numbers that aren't in the material.",
    `Use ${opts.language || "English"}. Write clear, unambiguous questions with one defensible answer key.`,
  ].join(" ");
  const user = [
    `Write the end-of-module quiz for the module "${mod.title}" of the course "${mod.courseTitle}".${opts.level ? ` Level: ${opts.level}.` : ""}`,
    mod.summary && `Module summary: ${mod.summary}`,
    `Write exactly ${count} questions covering the whole module, with more application questions (realistic scenarios: "what should you do", "which is correct") than recall questions.`,
    `Mix the kinds: mostly "single" (4 options, exactly one correct), a few "multiple" (4-5 options, always 2 or 3 correct) and at most ${Math.max(1, Math.floor(count / 5))} "truefalse" (the prompt is a statement, not a question, e.g. "A vague subject line makes an email easier to find later."; options exactly ["True", "False"]).`,
    `Only the marked options may be correct: no wrong option may also be a defensible answer.`,
    `"correct" lists the zero-based indexes of the correct options. Every wrong option must be a mistake a real learner could make: plausible, on topic, similar in length and tone to the right one. Never use joke options, obviously careless behaviour, "all of the above" or "none of the above".`,
    `Write the question text only (no "True or False:" prefix, no numbering).`,
    `"explanation" says in 1-2 sentences why the answer is right (and, if useful, why a tempting wrong option is wrong).`,
    opts.instructions && `Additional instructions from the course owner: ${opts.instructions}`,
    `\nLesson material:\n\n${material}`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await llm.json<{ questions?: unknown[] }>({ system, user, schemaName: "module_quiz", schema: QUIZ_JSON_SCHEMA as unknown as Record<string, unknown>, maxTokens: 6000 });
  const valid: QuestionInput[] = [];
  for (const raw of res.data?.questions ?? []) {
    const parsed = questionInputSchema.safeParse(raw);
    // A true/false "question" ("Which statement is correct?") can't be answered with True or False.
    if (!parsed.success || (parsed.data.kind === "truefalse" && parsed.data.prompt.endsWith("?"))) continue;
    // "All/none of the above" makes questions ambiguous (and breaks once options are shuffled).
    let q = parsed.data;
    const keep = q.options.map((o, i) => ({ o, i })).filter((x) => !/^(all|none|both) of the (above|options)\.?$/i.test(x.o));
    if (keep.length < q.options.length) {
      q = { ...q, options: keep.map((x) => x.o), correct: keep.flatMap((x, ni) => (q.correct.includes(x.i) ? [ni] : [])) };
      if (q.options.length < 2 || q.correct.length === 0) continue;
    }
    // "Select all that apply" with one right answer is really a single-answer question.
    if (q.kind === "multiple" && q.correct.length === 1) q = { ...q, kind: "single" };
    valid.push(shuffleOptions(q));
  }
  const list = valid.slice(0, count);
  if (list.length < Math.ceil(count / 2)) throw new Error(`The AI wrote only ${list.length} usable questions out of ${count}. Try again.`);
  await replaceQuizQuestions(db, moduleId, list);
  return { usage: res.usage, questions: list.length };
}

import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/lib/db/client";
import { aiGenerations, assessments, courseModules, courses, lessons, programs, questions } from "@/lib/db/schema";
import type { LlmClient, LlmUsage } from "@/lib/ai/llm";
import { parseVisual } from "@/lib/visuals/schemas";
import { addChapter, addLesson, addModule, programLessonIds, slugify } from "./builder";
import { writeModuleQuiz } from "./quizzes";
import type { ServiceResult } from "./users";

/* ------------------------------------------------------------------ */
/* The admin's brief and the outline the model proposes               */
/* ------------------------------------------------------------------ */

export const LIMITS = { modules: 10, chaptersPerModule: 4, lessonsPerChapter: 6, lessons: 60 } as const;

export const briefSchema = z.object({
  topic: z.string().trim().min(3, "Describe the course topic.").max(300),
  audience: z.string().trim().max(300).default(""),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  modules: z.coerce.number().int().min(1).max(LIMITS.modules).default(5),
  lessonsPerModule: z.coerce.number().int().min(1).max(12).default(4),
  /** Graded quiz questions per module (0 = no quizzes). */
  quizQuestions: z.coerce.number().int().min(0).max(15).default(8),
  language: z.string().trim().max(40).default("English"),
  instructions: z.string().trim().max(3000).default(""),
});
export type Brief = z.output<typeof briefSchema>;

const lessonPlan = z.object({ title: z.string().trim().min(2).max(200), objective: z.string().trim().max(500), durationMin: z.number().int().min(3).max(120) });
export const outlineSchema = z.object({
  title: z.string().trim().min(3).max(120),
  subtitle: z.string().trim().max(200),
  description: z.string().trim().max(4000),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  highlights: z.array(z.string().trim().min(2).max(200)).max(12),
  modules: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(200),
        summary: z.string().trim().max(1000),
        chapters: z
          .array(z.object({ title: z.string().trim().min(2).max(200), lessons: z.array(lessonPlan).min(1).max(LIMITS.lessonsPerChapter) }))
          .min(1)
          .max(LIMITS.chaptersPerModule),
      }),
    )
    .min(1)
    .max(LIMITS.modules),
});
export type Outline = z.infer<typeof outlineSchema>;

/** JSON Schema for OpenAI structured outputs (strict mode: every field required, no extras). */
const str = { type: "string" } as const;
const OUTLINE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "subtitle", "description", "level", "highlights", "modules"],
  properties: {
    title: str,
    subtitle: str,
    description: str,
    level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
    highlights: { type: "array", items: str },
    modules: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "summary", "chapters"],
        properties: {
          title: str,
          summary: str,
          chapters: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "lessons"],
              properties: {
                title: str,
                lessons: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["title", "objective", "durationMin"],
                    properties: { title: str, objective: str, durationMin: { type: "integer" } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

const LESSON_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["body", "durationMin", "flashcards"],
  properties: {
    body: str,
    durationMin: { type: "integer" },
    flashcards: { type: "array", items: { type: "object", additionalProperties: false, required: ["term", "definition"], properties: { term: str, definition: str } } },
  },
} as const;

const SYSTEM = [
  "You are a senior instructional designer writing courses for Nexsademy, a practical, job-ready online learning platform.",
  "Write accurate, specific, practical content for working professionals. Prefer concrete examples, realistic scenarios and step-by-step guidance over generic statements.",
  "Never invent statistics, studies, quotes, prices, laws or product features. If something depends on a product version, region or regulation, say so and tell the learner to verify it.",
  "Use the requested language. Use plain, friendly, professional wording.",
].join(" ");

export function countLessons(outline: Outline): number {
  return outline.modules.reduce((n, m) => n + m.chapters.reduce((k, c) => k + c.lessons.length, 0), 0);
}

export async function generateOutline(llm: LlmClient, input: z.input<typeof briefSchema>): Promise<ServiceResult<{ outline: Outline; usage: LlmUsage }>> {
  const brief = briefSchema.safeParse(input);
  if (!brief.success) return { ok: false, error: brief.error.issues[0]?.message ?? "Check the course brief." };
  const b = brief.data;
  const user = [
    `Design a course outline.`,
    `Topic: ${b.topic}`,
    b.audience && `Audience: ${b.audience}`,
    `Level: ${b.level}`,
    `Language: ${b.language}`,
    `Size: exactly ${b.modules} modules. Each module has exactly ${b.lessonsPerModule} lessons in total, grouped into 1-${LIMITS.chaptersPerModule} chapters (at most ${LIMITS.lessonsPerChapter} lessons per chapter). Count carefully: the whole course must have exactly ${b.modules * b.lessonsPerModule} lessons.`,
    `Order modules and lessons so each builds on the previous one, from foundations to applied practice. End with a practical capstone or project module where it suits the topic.`,
    `Each lesson needs a one-sentence learning objective and a realistic duration in minutes (8-30).`,
    `"highlights" are 4-6 concrete "what you'll learn" points. "description" is 2-3 short paragraphs for the course page.`,
    b.instructions && `Additional instructions from the course owner: ${b.instructions}`,
  ]
    .filter(Boolean)
    .join("\n");
  try {
    const res = await llm.json<unknown>({ system: SYSTEM, user, schemaName: "course_outline", schema: OUTLINE_JSON_SCHEMA as unknown as Record<string, unknown>, maxTokens: 8000 });
    const parsed = outlineSchema.safeParse(res.data);
    if (!parsed.success) return { ok: false, error: `The AI returned an outline we couldn't use (${parsed.error.issues[0]?.message}). Try again.` };
    if (countLessons(parsed.data) > LIMITS.lessons) return { ok: false, error: `The outline has more than ${LIMITS.lessons} lessons. Ask for fewer modules or lessons.` };
    return { ok: true, value: { outline: parsed.data, usage: res.usage } };
  } catch (err) {
    return { ok: false, error: `Outline generation failed: ${(err as Error).message}` };
  }
}

/* ------------------------------------------------------------------ */
/* Creating the draft course                                           */
/* ------------------------------------------------------------------ */

export async function createCourseFromOutline(
  db: Db,
  input: { brief: z.input<typeof briefSchema>; outline: unknown; model: string; createdById: string },
): Promise<ServiceResult<{ programId: string; generationId: string }>> {
  const brief = briefSchema.safeParse(input.brief);
  if (!brief.success) return { ok: false, error: brief.error.issues[0]?.message ?? "Check the course brief." };
  const parsed = outlineSchema.safeParse(input.outline);
  if (!parsed.success) return { ok: false, error: `The outline is incomplete: ${parsed.error.issues[0]?.message} (${parsed.error.issues[0]?.path.join(".")}).` };
  const outline = parsed.data;
  if (countLessons(outline) > LIMITS.lessons) return { ok: false, error: `A course can have at most ${LIMITS.lessons} AI-written lessons.` };

  const base = slugify(outline.title, 50);
  const taken = new Set((await db.select({ slug: programs.slug }).from(programs).where(sql`${programs.slug} like ${base + "%"}`)).map((r) => r.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;

  const [program] = await db
    .insert(programs)
    .values({
      slug,
      title: outline.title,
      subtitle: outline.subtitle,
      description: outline.description,
      level: outline.level,
      highlights: outline.highlights.slice(0, 12),
      homePath: `/programs/${slug}`,
      status: "draft",
      enrollmentMode: "invite",
      position: 100,
    })
    .returning();

  const objectives: Record<string, string> = {};
  for (const m of outline.modules) {
    const mod = await addModule(db, program.id, { title: m.title, summary: m.summary });
    if (!mod.ok) return mod;
    for (const c of m.chapters) {
      const chapter = await addChapter(db, mod.value.id, c.title);
      if (!chapter.ok) return chapter;
      for (const l of c.lessons) {
        const lesson = await addLesson(db, chapter.value.id, { title: l.title, durationMin: l.durationMin, aiStatus: "pending" });
        if (!lesson.ok) return lesson;
        objectives[lesson.value.id] = l.objective;
      }
    }
  }

  const [generation] = await db
    .insert(aiGenerations)
    .values({
      programId: program.id,
      brief: { ...brief.data, objectives },
      model: input.model,
      lessonsTotal: Object.keys(objectives).length,
      quizzesTotal: brief.data.quizQuestions > 0 ? outline.modules.length : 0,
      createdById: input.createdById,
    })
    .returning();
  return { ok: true, value: { programId: program.id, generationId: generation.id } };
}

/* ------------------------------------------------------------------ */
/* Writing lessons                                                     */
/* ------------------------------------------------------------------ */

/**
 * Keeps only well-formed knowledge checks (```visual-check) and drops any other
 * visual blocks the model may have invented, so lessons always render.
 */
export function sanitizeLessonBody(body: string): string {
  return body
    .replace(/^#\s+.*\n+/, "") // the page already shows the lesson title
    .replace(/^(#{2,4} .*?)[ \t]+$/gm, "$1") // trailing spaces on headings
    .replace(/```visual-([\w-]+)\n([\s\S]*?)```/g, (block, type: string, source: string) => {
      if (type !== "check") return "";
      const parsed = parseVisual("check", source);
      if (!parsed.ok) return "";
      const data = parsed.data as { options: string[]; correct: number };
      return data.correct < data.options.length ? block : "";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const lessonResultSchema = z.object({
  body: z.string().min(200, "The lesson is too short."),
  durationMin: z.number().int().min(3).max(180),
  flashcards: z.array(z.object({ term: z.string().trim().min(1).max(120), definition: z.string().trim().min(1).max(600) })).max(10),
});

async function lessonContext(db: Db, lessonId: string) {
  const [row] = await db
    .select({
      lessonTitle: lessons.title,
      chapterId: courseModules.id,
      chapterTitle: courseModules.title,
      moduleTitle: courses.title,
      moduleSummary: courses.summary,
      courseTitle: programs.title,
      courseSubtitle: programs.subtitle,
    })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .innerJoin(programs, eq(programs.id, courses.programId))
    .where(eq(lessons.id, lessonId))
    .limit(1);
  if (!row) return null;
  const siblings = await db.select({ title: lessons.title }).from(lessons).where(eq(lessons.moduleId, row.chapterId)).orderBy(asc(lessons.position));
  return { ...row, siblings: siblings.map((s) => s.title) };
}

/** Writes one lesson with the model and stores it. Returns token usage. */
export async function writeLesson(db: Db, llm: LlmClient, lessonId: string, brief: Brief & { objectives?: Record<string, string> }): Promise<LlmUsage> {
  const ctx = await lessonContext(db, lessonId);
  if (!ctx) throw new Error("Lesson not found.");
  await db.update(lessons).set({ aiStatus: "generating", aiError: null }).where(eq(lessons.id, lessonId));
  const user = [
    `Write one lesson of the course "${ctx.courseTitle}"${ctx.courseSubtitle ? ` (${ctx.courseSubtitle})` : ""}.`,
    `Course topic: ${brief.topic}. Level: ${brief.level}.${brief.audience ? ` Audience: ${brief.audience}.` : ""} Language: ${brief.language}.`,
    `Module: ${ctx.moduleTitle}${ctx.moduleSummary ? ` (${ctx.moduleSummary})` : ""}. Chapter: ${ctx.chapterTitle}.`,
    `Lessons in this chapter, in order: ${ctx.siblings.map((t) => `"${t}"`).join(", ")}. Don't repeat what the other lessons cover.`,
    `This lesson: "${ctx.lessonTitle}".${brief.objectives?.[lessonId] ? ` Learning objective: ${brief.objectives[lessonId]}` : ""}`,
    brief.instructions && `Additional instructions from the course owner: ${brief.instructions}`,
    "",
    "Format the body as GitHub-flavoured Markdown, 700-1300 words, without a top-level # heading (the title is shown separately).",
    "Use this structure, with these exact ## headings for parts 3-6 (all six parts are required):",
    "1. A short opening paragraph (no heading) explaining why this matters in real work.",
    "2. Two to four ## sections with your own descriptive headings, teaching the concepts with concrete examples. Use tables, numbered steps and short lists where they help.",
    "3. '## Worked example': a realistic scenario solved step by step.",
    "4. '## Try it yourself': a practical exercise the learner can do, then what a good answer looks like.",
    "5. '## Check your understanding': one or two multiple-choice questions, each written exactly as a fenced block like:",
    '```visual-check\n{"question": "…", "options": ["…", "…", "…", "…"], "correct": 0, "explanation": "…"}\n```',
    '   ("correct" is the zero-based index of the right option; the JSON must be valid.)',
    "6. '## Key takeaways': 3-5 bullet points.",
    'Highlight important advice as blockquotes that start with "Tip:", "Note:" or "Warning:".',
    "Do not include images, links or HTML. Also return the lesson's realistic duration in minutes and 2-5 flashcards for its key terms (or none if it has no specific terms).",
  ]
    .filter(Boolean)
    .join("\n");
  const res = await llm.json<unknown>({ system: SYSTEM, user, schemaName: "lesson", schema: LESSON_JSON_SCHEMA as unknown as Record<string, unknown>, maxTokens: 6000 });
  const parsed = lessonResultSchema.safeParse(res.data);
  if (!parsed.success) throw new Error(`Unusable lesson from the model: ${parsed.error.issues[0]?.message}`);
  await db
    .update(lessons)
    .set({ body: sanitizeLessonBody(parsed.data.body), durationMin: parsed.data.durationMin, flashcards: parsed.data.flashcards, aiStatus: "done", aiError: null })
    .where(eq(lessons.id, lessonId));
  return res.usage;
}

/** Process-local guard so one generation is never run twice in parallel. */
const running = new Set<string>();

/** A job whose heartbeat is older than this is considered stopped (e.g. the server restarted). */
export const STALE_AFTER_MS = 3 * 60_000;

/**
 * Writes every pending lesson of a generation, one at a time, then one graded
 * quiz per module that doesn't have one yet. Stops if the generation is
 * cancelled. Failed lessons and quizzes are counted and skipped.
 */
export async function runGeneration(db: Db, llm: LlmClient, generationId: string): Promise<void> {
  if (running.has(generationId)) return;
  running.add(generationId);
  try {
    const gen = await db.query.aiGenerations.findFirst({ where: eq(aiGenerations.id, generationId) });
    if (!gen || gen.status === "cancelled") return;
    await db.update(aiGenerations).set({ status: "generating", heartbeatAt: new Date(), error: null }).where(eq(aiGenerations.id, generationId));
    const brief = gen.brief as Brief & { objectives?: Record<string, string> };
    for (const lessonId of await programLessonIds(db, gen.programId)) {
      const current = await db.query.aiGenerations.findFirst({ where: eq(aiGenerations.id, generationId) });
      if (!current || current.status === "cancelled") return;
      const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId), columns: { aiStatus: true } });
      // Only lessons still waiting for the AI (hand-edited ones have aiStatus null).
      if (lesson?.aiStatus !== "pending" && lesson?.aiStatus !== "generating") continue;
      try {
        const usage = await writeLesson(db, llm, lessonId, brief);
        await db
          .update(aiGenerations)
          .set({
            lessonsDone: sql`${aiGenerations.lessonsDone} + 1`,
            promptTokens: sql`${aiGenerations.promptTokens} + ${usage.promptTokens}`,
            completionTokens: sql`${aiGenerations.completionTokens} + ${usage.completionTokens}`,
            heartbeatAt: new Date(),
          })
          .where(eq(aiGenerations.id, generationId));
      } catch (err) {
        const message = (err as Error).message.slice(0, 500);
        await db.update(lessons).set({ aiStatus: "error", aiError: message }).where(eq(lessons.id, lessonId));
        await db
          .update(aiGenerations)
          .set({ lessonsFailed: sql`${aiGenerations.lessonsFailed} + 1`, heartbeatAt: new Date(), error: message })
          .where(eq(aiGenerations.id, generationId));
      }
    }
    if ((brief.quizQuestions ?? 0) > 0) {
      for (const moduleId of await modulesWithoutQuiz(db, gen.programId)) {
        const current = await db.query.aiGenerations.findFirst({ where: eq(aiGenerations.id, generationId) });
        if (!current || current.status === "cancelled") return;
        try {
          const { usage } = await writeModuleQuiz(db, llm, moduleId, { count: brief.quizQuestions, language: brief.language, level: brief.level, instructions: brief.instructions });
          await db
            .update(aiGenerations)
            .set({
              quizzesDone: sql`${aiGenerations.quizzesDone} + 1`,
              promptTokens: sql`${aiGenerations.promptTokens} + ${usage.promptTokens}`,
              completionTokens: sql`${aiGenerations.completionTokens} + ${usage.completionTokens}`,
              heartbeatAt: new Date(),
            })
            .where(eq(aiGenerations.id, generationId));
        } catch (err) {
          const message = (err as Error).message.slice(0, 500);
          await db
            .update(aiGenerations)
            .set({ quizzesFailed: sql`${aiGenerations.quizzesFailed} + 1`, heartbeatAt: new Date(), error: `Quiz: ${message}` })
            .where(eq(aiGenerations.id, generationId));
        }
      }
    }
    await db
      .update(aiGenerations)
      .set({ status: "done", heartbeatAt: new Date() })
      .where(and(eq(aiGenerations.id, generationId), eq(aiGenerations.status, "generating")));
  } catch (err) {
    await db.update(aiGenerations).set({ status: "failed", error: (err as Error).message.slice(0, 500) }).where(eq(aiGenerations.id, generationId));
  } finally {
    running.delete(generationId);
  }
}

/** Modules of the course (in order) whose quiz is missing or has no questions. */
async function modulesWithoutQuiz(db: Db, programId: string): Promise<string[]> {
  const rows = await db
    .select({ id: courses.id, questions: sql<number>`(select count(*) from ${questions} q join ${assessments} a on a.id = q.assessment_id where a.course_id = "courses"."id")::int` })
    .from(courses)
    .where(eq(courses.programId, programId))
    .orderBy(asc(courses.position), asc(courses.title));
  return rows.filter((r) => r.questions === 0).map((r) => r.id);
}

export function isRunningHere(generationId: string): boolean {
  return running.has(generationId);
}

/** Puts failed lessons back in the queue so a resumed run retries them (missing quizzes are always retried). */
export async function requeueFailedLessons(db: Db, programId: string): Promise<number> {
  const ids = await programLessonIds(db, programId);
  if (!ids.length) return 0;
  const rows = await db
    .update(lessons)
    .set({ aiStatus: "pending", aiError: null })
    .where(and(sql`${lessons.id} in (${sql.join(ids.map((i) => sql`${i}`), sql`, `)})`, sql`${lessons.aiStatus} in ('error', 'generating')`))
    .returning({ id: lessons.id });
  await db.update(aiGenerations).set({ lessonsFailed: 0, quizzesFailed: 0 }).where(eq(aiGenerations.programId, programId));
  return rows.length;
}

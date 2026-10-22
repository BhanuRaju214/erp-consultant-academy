import { and, asc, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { courses, questions, type Program } from "@/lib/db/schema";
import { getCourseOutline, getProgramCertificateStatus } from "./learning";

/**
 * Learner view of a course built in the course builder: its visible modules (in
 * order), each with chapters, lessons, its graded quiz and the learner's progress,
 * plus where the learner stands on the course certificate.
 */
export async function getProgramPlayer(db: Db, program: Program, userId: string) {
  const mods = await db
    .select({ slug: courses.slug })
    .from(courses)
    .where(and(eq(courses.programId, program.id), eq(courses.published, true)))
    .orderBy(asc(courses.position), asc(courses.title));
  const modules = [];
  const statusByLesson = new Map<string, string>();
  for (const m of mods) {
    const outline = await getCourseOutline(db, m.slug, userId);
    if (!outline) continue;
    outline.statusByLesson.forEach((v, k) => statusByLesson.set(k, v));
    const a = outline.assessment;
    const questionCount = a
      ? ((await db.select({ n: sql<number>`count(*)::int` }).from(questions).where(eq(questions.assessmentId, a.id)))[0]?.n ?? 0)
      : 0;
    modules.push({
      id: outline.course.id,
      slug: outline.course.slug,
      title: outline.course.title,
      summary: outline.course.summary,
      chapters: outline.course.modules.map((c) => ({ id: c.id, title: c.title, lessons: c.lessons })),
      quiz:
        a && questionCount > 0
          ? { id: a.id, title: a.title, passMark: a.passMark, questions: questionCount, best: outline.best?.score ?? null, passed: Boolean(outline.best && outline.best.score >= a.passMark) }
          : null,
    });
  }
  // Every lesson in reading order, with the module it belongs to (for prev/next across modules).
  const order = modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons.map((l) => ({ ...l, moduleSlug: m.slug, moduleTitle: m.title }))));
  const done = order.filter((l) => statusByLesson.get(l.id) === "completed").length;
  const next = order.find((l) => statusByLesson.get(l.id) !== "completed") ?? null;
  const minutes = order.reduce((n, l) => n + l.durationMin, 0);
  const certificate = await getProgramCertificateStatus(db, userId, program.id);
  return { modules, order, statusByLesson, done, total: order.length, minutes, next, certificate };
}

export function quizHref(programSlug: string, moduleSlug: string) {
  return `/programs/${programSlug}/quiz/${moduleSlug}`;
}

export function lessonHref(programSlug: string, moduleSlug: string, lessonSlug: string) {
  return `/programs/${programSlug}/${moduleSlug}/${lessonSlug}`;
}

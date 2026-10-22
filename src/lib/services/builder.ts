import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/lib/db/client";
import { courseModules, courses, lessons, programs } from "@/lib/db/schema";
import type { ServiceResult } from "./users";

/**
 * Course builder. Structure: program (course) → module (`courses` row) →
 * chapter (`course_modules` row) → lesson. Positions are kept dense (0, 1, 2…).
 */

export function slugify(text: string, max = 60): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, max)
      .replace(/-+$/, "") || "item"
  );
}

/** First free slug of the form base, base-2, base-3… according to `taken`. */
function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

const titleSchema = z.string().trim().min(2, "Enter a title (at least 2 characters).").max(200);

export type ContentTree = Awaited<ReturnType<typeof getProgramContent>>;

export async function getProgramContent(db: Db, programId: string) {
  const mods = await db.query.courses.findMany({
    where: eq(courses.programId, programId),
    orderBy: [asc(courses.position), asc(courses.title)],
    with: {
      modules: {
        orderBy: [asc(courseModules.position)],
        with: {
          lessons: {
            orderBy: [asc(lessons.position)],
            columns: { id: true, slug: true, title: true, durationMin: true, aiStatus: true, aiError: true, body: true },
          },
        },
      },
    },
  });
  return mods.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    summary: m.summary,
    published: m.published,
    chapters: m.modules.map((c) => ({
      id: c.id,
      title: c.title,
      lessons: c.lessons.map(({ body, ...l }) => ({ ...l, words: body.trim() ? body.trim().split(/\s+/).length : 0 })),
    })),
  }));
}

/* ------------------------------------------------------------------ */
/* Modules                                                             */
/* ------------------------------------------------------------------ */

export async function addModule(db: Db, programId: string, input: { title: string; summary?: string }): Promise<ServiceResult<{ id: string; slug: string }>> {
  const title = titleSchema.safeParse(input.title);
  if (!title.success) return { ok: false, error: title.error.issues[0].message };
  const program = await db.query.programs.findFirst({ where: eq(programs.id, programId) });
  if (!program) return { ok: false, error: "Course not found." };
  const base = `${program.slug}-${slugify(title.data, 40)}`;
  const taken = new Set((await db.select({ slug: courses.slug }).from(courses).where(sql`${courses.slug} like ${base + "%"}`)).map((r) => r.slug));
  const [{ next }] = await db.select({ next: sql<number>`coalesce(max(${courses.position}) + 1, 0)::int` }).from(courses).where(eq(courses.programId, programId));
  const [row] = await db
    .insert(courses)
    .values({
      programId,
      slug: uniqueSlug(base, taken),
      section: "custom",
      title: title.data,
      summary: input.summary?.trim() ?? "",
      level: program.level,
      position: next,
    })
    .returning({ id: courses.id, slug: courses.slug });
  return { ok: true, value: row };
}

export async function updateModule(db: Db, moduleId: string, input: { title: string; summary: string; published: boolean }): Promise<ServiceResult<null>> {
  const title = titleSchema.safeParse(input.title);
  if (!title.success) return { ok: false, error: title.error.issues[0].message };
  await db.update(courses).set({ title: title.data, summary: input.summary.trim().slice(0, 2000), published: input.published }).where(eq(courses.id, moduleId));
  return { ok: true, value: null };
}

export async function deleteModule(db: Db, moduleId: string): Promise<void> {
  const row = await db.query.courses.findFirst({ where: eq(courses.id, moduleId) });
  if (!row) return;
  await db.delete(courses).where(eq(courses.id, moduleId));
  if (row.programId) await renumber(db, "module", row.programId);
}

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export async function addChapter(db: Db, moduleId: string, title: string): Promise<ServiceResult<{ id: string }>> {
  const t = titleSchema.safeParse(title);
  if (!t.success) return { ok: false, error: t.error.issues[0].message };
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${courseModules.position}) + 1, 0)::int` })
    .from(courseModules)
    .where(eq(courseModules.courseId, moduleId));
  const [row] = await db.insert(courseModules).values({ courseId: moduleId, title: t.data, position: next }).returning({ id: courseModules.id });
  return { ok: true, value: row };
}

export async function renameChapter(db: Db, chapterId: string, title: string): Promise<ServiceResult<null>> {
  const t = titleSchema.safeParse(title);
  if (!t.success) return { ok: false, error: t.error.issues[0].message };
  await db.update(courseModules).set({ title: t.data }).where(eq(courseModules.id, chapterId));
  return { ok: true, value: null };
}

export async function deleteChapter(db: Db, chapterId: string): Promise<void> {
  const row = await db.query.courseModules.findFirst({ where: eq(courseModules.id, chapterId) });
  if (!row) return;
  await db.delete(courseModules).where(eq(courseModules.id, chapterId));
  await renumber(db, "chapter", row.courseId);
}

/* ------------------------------------------------------------------ */
/* Lessons                                                             */
/* ------------------------------------------------------------------ */

/** Lesson slugs must be unique across the whole module, because lesson URLs are /<module>/<lesson>. */
async function takenLessonSlugs(db: Db, moduleId: string): Promise<Set<string>> {
  const rows = await db
    .select({ slug: lessons.slug })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .where(eq(courseModules.courseId, moduleId));
  return new Set(rows.map((r) => r.slug));
}

export async function addLesson(
  db: Db,
  chapterId: string,
  input: { title: string; body?: string; durationMin?: number; aiStatus?: string | null },
): Promise<ServiceResult<{ id: string; slug: string }>> {
  const t = titleSchema.safeParse(input.title);
  if (!t.success) return { ok: false, error: t.error.issues[0].message };
  const chapter = await db.query.courseModules.findFirst({ where: eq(courseModules.id, chapterId) });
  if (!chapter) return { ok: false, error: "Chapter not found." };
  const slug = uniqueSlug(slugify(t.data), await takenLessonSlugs(db, chapter.courseId));
  const [{ next }] = await db.select({ next: sql<number>`coalesce(max(${lessons.position}) + 1, 0)::int` }).from(lessons).where(eq(lessons.moduleId, chapterId));
  const [row] = await db
    .insert(lessons)
    .values({
      moduleId: chapterId,
      slug,
      title: t.data,
      body: input.body ?? "",
      durationMin: Math.max(1, Math.min(240, Math.round(input.durationMin ?? 10))),
      position: next,
      aiStatus: input.aiStatus ?? null,
    })
    .returning({ id: lessons.id, slug: lessons.slug });
  return { ok: true, value: row };
}

export async function deleteLesson(db: Db, lessonId: string): Promise<void> {
  const row = await db.query.lessons.findFirst({ where: eq(lessons.id, lessonId) });
  if (!row) return;
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  await renumber(db, "lesson", row.moduleId);
}

/* ------------------------------------------------------------------ */
/* Ordering                                                            */
/* ------------------------------------------------------------------ */

type Kind = "module" | "chapter" | "lesson";

async function siblings(db: Db, kind: Kind, parentId: string): Promise<string[]> {
  if (kind === "module") return (await db.select({ id: courses.id }).from(courses).where(eq(courses.programId, parentId)).orderBy(asc(courses.position), asc(courses.title))).map((r) => r.id);
  if (kind === "chapter") return (await db.select({ id: courseModules.id }).from(courseModules).where(eq(courseModules.courseId, parentId)).orderBy(asc(courseModules.position))).map((r) => r.id);
  return (await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.moduleId, parentId)).orderBy(asc(lessons.position))).map((r) => r.id);
}

async function writeOrder(db: Db, kind: Kind, ids: string[]) {
  for (const [i, id] of ids.entries()) {
    if (kind === "module") await db.update(courses).set({ position: i }).where(eq(courses.id, id));
    else if (kind === "chapter") await db.update(courseModules).set({ position: i }).where(eq(courseModules.id, id));
    else await db.update(lessons).set({ position: i }).where(eq(lessons.id, id));
  }
}

async function renumber(db: Db, kind: Kind, parentId: string) {
  await writeOrder(db, kind, await siblings(db, kind, parentId));
}

async function parentOf(db: Db, kind: Kind, id: string): Promise<string | null> {
  if (kind === "module") return (await db.query.courses.findFirst({ where: eq(courses.id, id) }))?.programId ?? null;
  if (kind === "chapter") return (await db.query.courseModules.findFirst({ where: eq(courseModules.id, id) }))?.courseId ?? null;
  return (await db.query.lessons.findFirst({ where: eq(lessons.id, id) }))?.moduleId ?? null;
}

/** Moves an item one place up or down among its siblings. */
export async function moveItem(db: Db, kind: Kind, id: string, direction: "up" | "down"): Promise<void> {
  const parent = await parentOf(db, kind, id);
  if (!parent) return;
  const ids = await siblings(db, kind, parent);
  const i = ids.indexOf(id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await writeOrder(db, kind, ids);
}

/** Program id for a module, chapter or lesson (for permission checks and revalidation). */
export async function programIdFor(db: Db, kind: Kind, id: string): Promise<string | null> {
  if (kind === "module") return parentOf(db, "module", id);
  if (kind === "chapter") {
    const chapter = await db.query.courseModules.findFirst({ where: eq(courseModules.id, id) });
    return chapter ? parentOf(db, "module", chapter.courseId) : null;
  }
  const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, id) });
  return lesson ? programIdFor(db, "chapter", lesson.moduleId) : null;
}

/** Program slug for a lesson, used to check a learner's access. */
export async function programSlugForLesson(db: Db, lessonId: string): Promise<string | null> {
  const rows = await db
    .select({ slug: programs.slug })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .innerJoin(programs, eq(programs.id, courses.programId))
    .where(eq(lessons.id, lessonId))
    .limit(1);
  return rows[0]?.slug ?? null;
}

/** Lesson ids of a program in reading order (module → chapter → lesson). */
export async function programLessonIds(db: Db, programId: string): Promise<string[]> {
  const mods = await db.select({ id: courses.id }).from(courses).where(eq(courses.programId, programId)).orderBy(asc(courses.position));
  if (!mods.length) return [];
  const rows = await db
    .select({ id: lessons.id, m: courses.position, c: courseModules.position, l: lessons.position })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .where(and(inArray(courses.id, mods.map((m) => m.id))));
  return rows.sort((a, b) => a.m - b.m || a.c - b.c || a.l - b.l).map((r) => r.id);
}

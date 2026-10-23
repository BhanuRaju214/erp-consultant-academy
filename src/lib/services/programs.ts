import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/lib/db/client";
import { courseModules, courses, enrollments, lessonProgress, lessons, mediaAssets, programs, users, type Program, type User } from "@/lib/db/schema";
import { can } from "@/lib/auth/rbac";
import { findUserByEmail, type ServiceResult } from "./users";
import { sectionRank } from "./library";

/** The original academy content (the 14 sections) is this program. */
export const FLAGSHIP_PROGRAM = {
  slug: "odoo-erp-consultant",
  title: "Odoo ERP Consultant Program",
  subtitle: "Become a job-ready Odoo techno-functional consultant",
  homePath: "/learn",
  level: "beginner" as const,
  description: [
    "A complete, hands-on path from ERP fundamentals to running a real Odoo implementation.",
    "",
    "You learn in the order consultants work: understand the business, understand the process, learn the Odoo apps, configure, import data, execute transactions, test, customise, implement and support.",
  ].join("\n"),
  highlights: [
    "ERP fundamentals and 6 end-to-end business processes",
    "Odoo CRM, Sales, Purchase, Inventory, Accounting (incl. India GST), Manufacturing and eCommerce",
    "Configuration lab, data migration lab and 32 Odoo simulators",
    "Technical development, integrations, and testing & QA",
    "Real-time business projects, assessments and certificates",
  ],
};

/** Trainers and admins can open every program without an enrolment. */
export function isStaff(user: Pick<User, "role">): boolean {
  return can(user.role, "trainer:dashboard");
}

export async function getProgramBySlug(db: Db, slug: string): Promise<Program | null> {
  return (await db.query.programs.findFirst({ where: eq(programs.slug, slug) })) ?? null;
}

export async function isEnrolled(db: Db, userId: string, programId: string): Promise<boolean> {
  const rows = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.programId, programId), isNull(enrollments.revokedAt)))
    .limit(1);
  return rows.length > 0;
}

/** Whether the user may open the program's content. */
export async function canAccessProgram(db: Db, user: Pick<User, "id" | "role">, slug: string): Promise<boolean> {
  if (isStaff(user)) return true;
  const program = await getProgramBySlug(db, slug);
  if (!program || program.status === "draft") return false;
  return isEnrolled(db, user.id, program.id);
}

/** Creates or re-activates an enrolment. */
export async function enroll(
  db: Db,
  input: { programId: string; userId: string; source: "auto" | "admin" | "self" | "purchase"; enrolledById?: string | null },
): Promise<void> {
  await db
    .insert(enrollments)
    .values({ programId: input.programId, userId: input.userId, source: input.source, enrolledById: input.enrolledById ?? null })
    .onConflictDoUpdate({
      target: [enrollments.programId, enrollments.userId],
      set: { revokedAt: null, source: input.source, enrolledById: input.enrolledById ?? null },
    });
}

export async function revokeEnrollment(db: Db, programId: string, userId: string): Promise<void> {
  await db
    .update(enrollments)
    .set({ revokedAt: new Date() })
    .where(and(eq(enrollments.programId, programId), eq(enrollments.userId, userId)));
}

/** Self-enrolment from the catalogue; only allowed for published, open programs. */
export async function selfEnroll(db: Db, user: Pick<User, "id">, slug: string): Promise<ServiceResult<Program>> {
  const program = await getProgramBySlug(db, slug);
  if (!program || program.status !== "published") return { ok: false, error: "This course is not available." };
  if (program.enrollmentMode !== "open") return { ok: false, error: "Enrolment in this course is by invitation. Contact us to join." };
  await enroll(db, { programId: program.id, userId: user.id, source: "self" });
  return { ok: true, value: program };
}

export async function enrollByEmail(db: Db, programId: string, email: string, adminId: string): Promise<ServiceResult<User>> {
  const user = await findUserByEmail(db, email);
  if (!user) return { ok: false, error: `No account found for ${email}. Ask the learner to register first, or create the user in the Admin console.` };
  await enroll(db, { programId, userId: user.id, source: "admin", enrolledById: adminId });
  return { ok: true, value: user };
}

export interface ProgramCard {
  program: Program;
  enrolled: boolean;
  lessonsTotal: number;
  lessonsDone: number;
  subCourses: number;
}

/** Lesson totals and the user's completed lessons per program. */
async function programStats(db: Db, programIds: string[], userId: string) {
  if (programIds.length === 0) return new Map<string, { total: number; done: number; subCourses: number }>();
  const rows = await db
    .select({
      programId: courses.programId,
      total: sql<number>`count(distinct ${lessons.id})::int`,
      done: sql<number>`count(distinct ${lessonProgress.lessonId}) filter (where ${lessonProgress.status} = 'completed')::int`,
      subCourses: sql<number>`count(distinct ${courses.id})::int`,
    })
    .from(courses)
    .leftJoin(courseModules, eq(courseModules.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.moduleId, courseModules.id))
    .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
    .where(and(inArray(courses.programId, programIds), eq(courses.published, true)))
    .groupBy(courses.programId);
  return new Map(rows.map((r) => [r.programId as string, { total: r.total, done: r.done, subCourses: r.subCourses }]));
}

/** Published programs for the catalogue, with the user's enrolment and progress. */
export async function listCatalog(db: Db, user: Pick<User, "id" | "role">): Promise<ProgramCard[]> {
  const list = await db.select().from(programs).where(eq(programs.status, "published")).orderBy(asc(programs.position), asc(programs.title));
  return withCards(db, list, user);
}

/**
 * Published programs for signed-out visitors (public home page). Covers are only
 * shown when the image itself is public, so anonymous visitors never hit a 404.
 */
export async function listPublicCatalog(db: Db): Promise<ProgramCard[]> {
  const rows = await db
    .select({ program: programs, coverVisibility: mediaAssets.visibility })
    .from(programs)
    .leftJoin(mediaAssets, eq(mediaAssets.id, programs.coverAssetId))
    .where(eq(programs.status, "published"))
    .orderBy(asc(programs.position), asc(programs.title));
  const list = rows.map((r) => ({ ...r.program, coverAssetId: r.coverVisibility === "public" ? r.program.coverAssetId : null }));
  const stats = await programStats(db, list.map((p) => p.id), NIL_UUID);
  return list.map((program) => {
    const s = stats.get(program.id) ?? { total: 0, done: 0, subCourses: 0 };
    return { program, enrolled: false, lessonsTotal: s.total, lessonsDone: 0, subCourses: s.subCourses };
  });
}

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

/** Programs the user is enrolled in (staff see every published program). */
export async function listMyPrograms(db: Db, user: Pick<User, "id" | "role">): Promise<ProgramCard[]> {
  const list = isStaff(user)
    ? await db.select().from(programs).where(eq(programs.status, "published")).orderBy(asc(programs.position))
    : (
        await db
          .select({ program: programs })
          .from(enrollments)
          .innerJoin(programs, eq(programs.id, enrollments.programId))
          .where(and(eq(enrollments.userId, user.id), isNull(enrollments.revokedAt), inArray(programs.status, ["published", "archived"])))
          .orderBy(asc(programs.position))
      ).map((r) => r.program);
  return withCards(db, list, user);
}

async function withCards(db: Db, list: Program[], user: Pick<User, "id" | "role">): Promise<ProgramCard[]> {
  const stats = await programStats(db, list.map((p) => p.id), user.id);
  const enrolledIds = new Set(
    list.length
      ? (
          await db
            .select({ programId: enrollments.programId })
            .from(enrollments)
            .where(and(eq(enrollments.userId, user.id), isNull(enrollments.revokedAt), inArray(enrollments.programId, list.map((p) => p.id))))
        ).map((r) => r.programId)
      : [],
  );
  return list.map((program) => {
    const s = stats.get(program.id) ?? { total: 0, done: 0, subCourses: 0 };
    return { program, enrolled: enrolledIds.has(program.id), lessonsTotal: s.total, lessonsDone: s.done, subCourses: s.subCourses };
  });
}

/** Syllabus for the course page: the program's sub-courses with module/lesson counts. */
export async function getProgramSyllabus(db: Db, programId: string) {
  return db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      summary: courses.summary,
      level: courses.level,
      modules: sql<number>`count(distinct ${courseModules.id})::int`,
      lessons: sql<number>`count(distinct ${lessons.id})::int`,
    })
    .from(courses)
    .leftJoin(courseModules, eq(courseModules.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.moduleId, courseModules.id))
    .where(and(eq(courses.programId, programId), eq(courses.published, true)))
    .groupBy(courses.id)
    .orderBy(sectionRank(), asc(courses.position), asc(courses.title));
}

/** Module titles with lesson counts and minutes, grouped by sub-course, for the syllabus accordion. */
export async function getProgramModules(db: Db, programId: string) {
  const rows = await db
    .select({
      courseId: courses.id,
      moduleId: courseModules.id,
      title: courseModules.title,
      lessons: sql<number>`count(${lessons.id})::int`,
      minutes: sql<number>`coalesce(sum(${lessons.durationMin}), 0)::int`,
    })
    .from(courseModules)
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .leftJoin(lessons, eq(lessons.moduleId, courseModules.id))
    .where(and(eq(courses.programId, programId), eq(courses.published, true)))
    .groupBy(courses.id, courseModules.id)
    .orderBy(asc(courseModules.position));
  const byCourse = new Map<string, { title: string; lessons: number; minutes: number }[]>();
  for (const r of rows) byCourse.set(r.courseId, [...(byCourse.get(r.courseId) ?? []), { title: r.title, lessons: r.lessons, minutes: r.minutes }]);
  return byCourse;
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export const programInputSchema = z.object({
  title: z.string().trim().min(3, "Title is too short.").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes for the URL name."),
  subtitle: z.string().trim().max(200).default(""),
  description: z.string().max(20_000).default(""),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  durationHours: z.coerce.number().int().min(0).max(2000).nullable().default(null),
  highlights: z.array(z.string().trim().min(1).max(200)).max(12).default([]),
  coverAssetId: z.string().uuid().nullable().default(null),
  status: z.enum(["draft", "published", "archived"]),
  enrollmentMode: z.enum(["open", "invite", "paid"]),
  /** Price in paise before GST (18% is added at checkout); required for paid courses. */
  pricePaise: z.coerce.number().int().min(0).max(100_000_000).nullable().default(null),
  position: z.coerce.number().int().min(0).max(10_000).default(0),
});

export type ProgramInput = z.input<typeof programInputSchema>;

export async function saveProgram(db: Db, input: ProgramInput, id?: string): Promise<ServiceResult<Program>> {
  const parsed = programInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid course details." };
  if (parsed.data.enrollmentMode === "paid" && !parsed.data.pricePaise) return { ok: false, error: "Set a price for a paid course." };
  const clash = await getProgramBySlug(db, parsed.data.slug);
  if (clash && clash.id !== id) return { ok: false, error: "Another course already uses that URL name." };
  // Courses built in the course builder are learnt in the /programs player; the flagship keeps /learn.
  const homePath = parsed.data.slug === FLAGSHIP_PROGRAM.slug ? FLAGSHIP_PROGRAM.homePath : `/programs/${parsed.data.slug}`;
  if (id) {
    const [row] = await db.update(programs).set({ ...parsed.data, homePath }).where(eq(programs.id, id)).returning();
    return row ? { ok: true, value: row } : { ok: false, error: "Course not found." };
  }
  const [row] = await db.insert(programs).values({ ...parsed.data, homePath }).returning();
  return { ok: true, value: row };
}

export async function listProgramsForAdmin(db: Db) {
  return db
    .select({
      program: programs,
      enrolled: sql<number>`(select count(*)::int from enrollments e where e.program_id = "programs"."id" and e.revoked_at is null)`,
      subCourses: sql<number>`(select count(*)::int from courses c where c.program_id = "programs"."id")`,
      lessons: sql<number>`(select count(*)::int from lessons l join course_modules cm on cm.id = l.module_id join courses c on c.id = cm.course_id where c.program_id = "programs"."id")`,
    })
    .from(programs)
    .orderBy(asc(programs.position), asc(programs.title));
}

export async function listEnrollments(db: Db, programId: string) {
  return db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      source: enrollments.source,
      enrolledAt: enrollments.createdAt,
      revokedAt: enrollments.revokedAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(users.id, enrollments.userId))
    .where(eq(enrollments.programId, programId))
    .orderBy(asc(users.name));
}

/**
 * Creates the flagship program if missing and attaches all sub-courses that have no
 * program yet. When the program is created for the first time, every existing user
 * is enrolled, so learners keep access to content they already had.
 */
export async function ensureFlagshipProgram(db: Db): Promise<{ created: boolean; enrolled: number; linked: number }> {
  let program = await getProgramBySlug(db, FLAGSHIP_PROGRAM.slug);
  let created = false;
  if (!program) {
    [program] = await db
      .insert(programs)
      .values({ ...FLAGSHIP_PROGRAM, status: "published", enrollmentMode: "open", position: 0 })
      .onConflictDoNothing()
      .returning();
    program ??= (await getProgramBySlug(db, FLAGSHIP_PROGRAM.slug))!;
    created = true;
  }
  const linked = await db.update(courses).set({ programId: program.id }).where(isNull(courses.programId)).returning({ id: courses.id });
  let enrolled = 0;
  if (created) {
    const everyone = await db.select({ id: users.id }).from(users);
    for (const u of everyone) await enroll(db, { programId: program.id, userId: u.id, source: "auto" });
    enrolled = everyone.length;
  }
  return { created, enrolled, linked: linked.length };
}

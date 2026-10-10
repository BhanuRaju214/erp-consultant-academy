import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
  assessmentAttempts,
  assessments,
  certificates,
  courseModules,
  courses,
  learningPathCourses,
  learningPaths,
  lessonProgress,
  lessons,
  studentExerciseSteps,
  submissions,
  trainerFeedback,
  users,
} from "@/lib/db/schema";
import { listCoursesWithProgress } from "./learning";
import { listProjectsWithProgress } from "./practice";

/** Everything the student dashboard needs in one call. */
export async function getStudentDashboard(db: Db, userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const allCourses = await listCoursesWithProgress(db, userId);

  const path = user?.learningPathId ? await db.query.learningPaths.findFirst({ where: eq(learningPaths.id, user.learningPathId) }) : null;
  const pathCourseIds = path
    ? (await db.select().from(learningPathCourses).where(eq(learningPathCourses.pathId, path.id)).orderBy(asc(learningPathCourses.position))).map((r) => r.courseId)
    : [];
  const pathCourses = pathCourseIds.map((id) => allCourses.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const orderedForNext = pathCourses.length ? pathCourses : allCourses;

  // Recommended next lesson = first incomplete lesson in path order.
  let nextLesson: { courseSlug: string; courseTitle: string; lessonSlug: string; lessonTitle: string } | null = null;
  for (const c of orderedForNext) {
    if (c.completedLessons >= c.totalLessons) continue;
    const [l] = await db
      .select({ slug: lessons.slug, title: lessons.title })
      .from(lessons)
      .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
      .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
      .where(and(eq(courseModules.courseId, c.id), sql`(${lessonProgress.status} is null or ${lessonProgress.status} <> 'completed')`))
      .orderBy(asc(courseModules.position), asc(lessons.position))
      .limit(1);
    if (l) {
      nextLesson = { courseSlug: c.slug, courseTitle: c.title, lessonSlug: l.slug, lessonTitle: l.title };
      break;
    }
  }

  const scores = await db
    .select({
      assessmentId: assessments.id,
      title: assessments.title,
      passMark: assessments.passMark,
      best: sql<number>`max(${assessmentAttempts.score})::int`,
      attempts: sql<number>`count(*)::int`,
      lastAt: sql<Date>`max(${assessmentAttempts.submittedAt})`,
    })
    .from(assessmentAttempts)
    .innerJoin(assessments, eq(assessments.id, assessmentAttempts.assessmentId))
    .where(eq(assessmentAttempts.userId, userId))
    .groupBy(assessments.id)
    .orderBy(desc(sql`max(${assessmentAttempts.submittedAt})`));

  const [{ steps }] = await db
    .select({ steps: sql<number>`count(*)::int` })
    .from(studentExerciseSteps)
    .where(eq(studentExerciseSteps.userId, userId));

  const projectRows = await listProjectsWithProgress(db, userId);
  const certs = await db
    .select({ serial: certificates.serial, courseTitle: courses.title, issuedAt: certificates.issuedAt, score: certificates.score })
    .from(certificates)
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .where(eq(certificates.userId, userId));

  const feedback = await db
    .select({ body: trainerFeedback.body, createdAt: trainerFeedback.createdAt, trainer: users.name })
    .from(trainerFeedback)
    .innerJoin(users, eq(users.id, trainerFeedback.trainerId))
    .where(eq(trainerFeedback.studentId, userId))
    .orderBy(desc(trainerFeedback.createdAt))
    .limit(3);

  const totals = allCourses.reduce(
    (acc, c) => ({ lessons: acc.lessons + c.totalLessons, done: acc.done + c.completedLessons }),
    { lessons: 0, done: 0 },
  );
  // Skills are "gained" once a course is fully completed; "in progress" once started.
  const skillsGained = Array.from(new Set(allCourses.filter((c) => c.totalLessons > 0 && c.completedLessons === c.totalLessons).flatMap((c) => c.skills)));
  const skillsInProgress = Array.from(
    new Set(allCourses.filter((c) => c.completedLessons > 0 && c.completedLessons < c.totalLessons).flatMap((c) => c.skills)),
  ).filter((s) => !skillsGained.includes(s));

  return {
    user,
    path,
    pathCourses,
    allCourses,
    nextLesson,
    scores,
    exerciseStepsDone: steps,
    projects: projectRows,
    certificates: certs,
    feedback,
    totals,
    skillsGained,
    skillsInProgress,
  };
}

/** Trainer view: per-student progress summary. */
export async function getTrainerOverview(db: Db) {
  const students = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
      pathTitle: learningPaths.title,
      lessonsDone: sql<number>`(select count(*) from ${lessonProgress} lp where lp.user_id = ${users.id} and lp.status = 'completed')::int`,
      avgScore: sql<number | null>`(select round(avg(best))::int from (select max(a.score) as best from ${assessmentAttempts} a where a.user_id = ${users.id} group by a.assessment_id) s)`,
      stepsDone: sql<number>`(select count(*) from ${studentExerciseSteps} s where s.user_id = ${users.id})::int`,
      certCount: sql<number>`(select count(*) from ${certificates} c where c.user_id = ${users.id})::int`,
      pendingSubmissions: sql<number>`(select count(*) from ${submissions} s where s.user_id = ${users.id} and s.status = 'submitted')::int`,
    })
    .from(users)
    .leftJoin(learningPaths, eq(learningPaths.id, users.learningPathId))
    .where(eq(users.role, "student"))
    .orderBy(asc(users.name));

  const [{ totalLessons }] = await db.select({ totalLessons: sql<number>`count(*)::int` }).from(lessons);

  const scoreDistribution = await db
    .select({
      bucket: sql<string>`case when score < 50 then '0–49' when score < 70 then '50–69' when score < 85 then '70–84' else '85–100' end`,
      count: sql<number>`count(*)::int`,
    })
    .from(assessmentAttempts)
    .groupBy(sql`1`);

  const courseCompletion = await db
    .select({
      title: courses.title,
      started: sql<number>`count(distinct ${lessonProgress.userId})::int`,
    })
    .from(courses)
    .leftJoin(courseModules, eq(courseModules.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.moduleId, courseModules.id))
    .leftJoin(lessonProgress, eq(lessonProgress.lessonId, lessons.id))
    .groupBy(courses.id)
    .orderBy(asc(courses.section), asc(courses.position));

  return { students, totalLessons, scoreDistribution, courseCompletion };
}

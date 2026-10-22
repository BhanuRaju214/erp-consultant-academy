import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
  assessmentAttempts,
  assessments,
  certificates,
  courseModules,
  courses,
  lessonProgress,
  lessons,
  programCertificates,
  programs,
  questions,
  studentAnswers,
} from "@/lib/db/schema";
import { gradeQuiz } from "@/lib/quiz";
import { FLAGSHIP_PROGRAM } from "./programs";

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export interface CourseProgressRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  section: string;
  level: string;
  odooVersion: string | null;
  skills: string[];
  position: number;
  totalLessons: number;
  completedLessons: number;
  totalMinutes: number;
}

/** Courses with lesson counts and the user's completion counts. */
export async function listCoursesWithProgress(db: Db, userId: string, section?: string): Promise<CourseProgressRow[]> {
  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      summary: courses.summary,
      section: courses.section,
      level: courses.level,
      odooVersion: courses.odooVersion,
      skills: courses.skills,
      position: courses.position,
      totalLessons: sql<number>`count(${lessons.id})::int`,
      totalMinutes: sql<number>`coalesce(sum(${lessons.durationMin}), 0)::int`,
      completedLessons: sql<number>`count(${lessonProgress.lessonId}) filter (where ${lessonProgress.status} = 'completed')::int`,
    })
    .from(courses)
    .leftJoin(courseModules, eq(courseModules.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.moduleId, courseModules.id))
    .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
    .where(section ? and(eq(courses.published, true), eq(courses.section, section)) : eq(courses.published, true))
    .groupBy(courses.id)
    .orderBy(asc(courses.section), asc(courses.position));
  return rows;
}

export async function getCourseOutline(db: Db, slug: string, userId: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      modules: {
        orderBy: [asc(courseModules.position)],
        with: {
          lessons: {
            orderBy: [asc(lessons.position)],
            columns: { id: true, slug: true, title: true, durationMin: true, odooVersions: true, scope: true },
          },
        },
      },
    },
  });
  if (!course) return null;
  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progress = lessonIds.length
    ? await db
        .select({ lessonId: lessonProgress.lessonId, status: lessonProgress.status })
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIds)))
    : [];
  const statusByLesson = new Map(progress.map((p) => [p.lessonId, p.status]));
  const assessment = await db.query.assessments.findFirst({ where: eq(assessments.courseId, course.id) });
  const best = assessment ? await bestAttempt(db, userId, assessment.id) : null;
  const certificate = await db.query.certificates.findFirst({
    where: and(eq(certificates.userId, userId), eq(certificates.courseId, course.id)),
  });
  return { course, statusByLesson, assessment, best, certificate };
}

export async function getLesson(db: Db, courseSlug: string, lessonSlug: string) {
  const outline = await db.query.courses.findFirst({
    where: eq(courses.slug, courseSlug),
    with: {
      modules: {
        orderBy: [asc(courseModules.position)],
        with: { lessons: { orderBy: [asc(lessons.position)], columns: { id: true, slug: true, title: true } } },
      },
    },
  });
  if (!outline) return null;
  const flat: { id: string; slug: string; title: string; moduleTitle: string }[] =outline.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
  const idx = flat.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) return null;
  const lesson = await db.query.lessons.findFirst({ where: eq(lessons.id, flat[idx].id), with: { resources: true } });
  if (!lesson) return null;
  return {
    course: { id: outline.id, slug: outline.slug, title: outline.title, section: outline.section, published: outline.published },
    lesson,
    moduleTitle: flat[idx].moduleTitle,
    index: idx,
    total: flat.length,
    prev: flat[idx - 1] ?? null,
    next: flat[idx + 1] ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

export async function markLessonStarted(db: Db, userId: string, lessonId: string) {
  await db.insert(lessonProgress).values({ userId, lessonId, status: "in_progress" }).onConflictDoNothing();
}

export async function setLessonCompleted(db: Db, userId: string, lessonId: string, completed: boolean) {
  if (completed) {
    await db
      .insert(lessonProgress)
      .values({ userId, lessonId, status: "completed", completedAt: new Date() })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: { status: "completed", completedAt: new Date() },
      });
    const courseId = await courseIdForLesson(db, lessonId);
    if (courseId) await maybeIssueCertificate(db, userId, courseId);
  } else {
    await db
      .update(lessonProgress)
      .set({ status: "in_progress", completedAt: null })
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
  }
}

async function courseIdForLesson(db: Db, lessonId: string): Promise<string | null> {
  const r = await db
    .select({ courseId: courseModules.courseId })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .where(eq(lessons.id, lessonId))
    .limit(1);
  return r[0]?.courseId ?? null;
}

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */

export async function bestAttempt(db: Db, userId: string, assessmentId: string) {
  const r = await db
    .select()
    .from(assessmentAttempts)
    .where(and(eq(assessmentAttempts.userId, userId), eq(assessmentAttempts.assessmentId, assessmentId)))
    .orderBy(desc(assessmentAttempts.score), desc(assessmentAttempts.submittedAt))
    .limit(1);
  return r[0] ?? null;
}

export async function submitAssessment(db: Db, userId: string, assessmentId: string, answers: Record<string, number[]>) {
  const assessment = await db.query.assessments.findFirst({
    where: eq(assessments.id, assessmentId),
    with: { questions: { orderBy: [asc(questions.position)] } },
  });
  if (!assessment) throw new Error("Assessment not found");
  const result = gradeQuiz(assessment.questions, answers, assessment.passMark);
  const attempt = await db.transaction(async (tx) => {
    const [a] = await tx
      .insert(assessmentAttempts)
      .values({ userId, assessmentId, score: result.score, passed: result.passed })
      .returning();
    if (result.graded.length) {
      await tx.insert(studentAnswers).values(result.graded.map((g) => ({ attemptId: a.id, questionId: g.questionId, answer: g.answer, correct: g.correct })));
    }
    return a;
  });
  if (assessment.courseId) await maybeIssueCertificate(db, userId, assessment.courseId);
  return { attempt, ...result };
}

/* ------------------------------------------------------------------ */
/* Certificates                                                        */
/* ------------------------------------------------------------------ */

/**
 * Issues a course certificate when the configurable criteria are met:
 * every lesson completed and (if the course has an assessment) a best score
 * at or above the course's certMinScore.
 */
export async function maybeIssueCertificate(db: Db, userId: string, courseId: string) {
  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) });
  if (!course) return null;
  // Courses built in the course builder certify the whole course, not each module.
  if (course.programId) {
    const program = await db.query.programs.findFirst({ where: eq(programs.id, course.programId), columns: { slug: true } });
    if (program && program.slug !== FLAGSHIP_PROGRAM.slug) {
      await maybeIssueProgramCertificate(db, userId, course.programId);
      return null;
    }
  }
  const [counts] = await db
    .select({
      total: sql<number>`count(${lessons.id})::int`,
      done: sql<number>`count(${lessonProgress.lessonId}) filter (where ${lessonProgress.status} = 'completed')::int`,
    })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
    .where(eq(courseModules.courseId, courseId));
  if (!counts || counts.total === 0 || counts.done < counts.total) return null;

  let score = 100;
  const assessment = await db.query.assessments.findFirst({ where: eq(assessments.courseId, courseId) });
  if (assessment) {
    const best = await bestAttempt(db, userId, assessment.id);
    if (!best || best.score < course.certMinScore) return null;
    score = best.score;
  }
  const serial = `ECA-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
  const [cert] = await db.insert(certificates).values({ userId, courseId, score, serial }).onConflictDoNothing().returning();
  return cert ?? null;
}

/**
 * Where a learner stands on the certificate of a course built in the course builder.
 * Only visible modules count: every lesson completed and every module quiz (with at
 * least one question) passed at its pass mark.
 */
export async function getProgramCertificateStatus(db: Db, userId: string, programId: string) {
  const mods = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.programId, programId), eq(courses.published, true)));
  const moduleIds = mods.map((m) => m.id);
  let lessonsTotal = 0;
  let lessonsDone = 0;
  const quizzes: { assessmentId: string; passMark: number; best: number | null; passed: boolean }[] = [];
  if (moduleIds.length) {
    const [counts] = await db
      .select({
        total: sql<number>`count(${lessons.id})::int`,
        done: sql<number>`count(${lessonProgress.lessonId}) filter (where ${lessonProgress.status} = 'completed')::int`,
      })
      .from(lessons)
      .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
      .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
      .where(inArray(courseModules.courseId, moduleIds));
    lessonsTotal = counts?.total ?? 0;
    lessonsDone = counts?.done ?? 0;
    const rows = await db
      .select({
        id: assessments.id,
        passMark: assessments.passMark,
        questions: sql<number>`(select count(*) from "questions" q where q.assessment_id = "assessments"."id")::int`,
        best: sql<number | null>`(select max(a.score) from "assessment_attempts" a where a.assessment_id = "assessments"."id" and a.user_id = ${userId})::int`,
      })
      .from(assessments)
      .where(inArray(assessments.courseId, moduleIds));
    for (const r of rows) {
      if (r.questions > 0) quizzes.push({ assessmentId: r.id, passMark: r.passMark, best: r.best, passed: r.best !== null && r.best >= r.passMark });
    }
  }
  const certificate =
    (await db.query.programCertificates.findFirst({ where: and(eq(programCertificates.userId, userId), eq(programCertificates.programId, programId)) })) ?? null;
  const eligible = lessonsTotal > 0 && lessonsDone >= lessonsTotal && quizzes.every((q) => q.passed);
  const score = quizzes.length ? Math.round(quizzes.reduce((n, q) => n + (q.best ?? 0), 0) / quizzes.length) : 100;
  return { lessonsTotal, lessonsDone, quizzesTotal: quizzes.length, quizzesPassed: quizzes.filter((q) => q.passed).length, eligible, score, certificate };
}

/** Issues the course certificate once the learner meets every requirement (idempotent). */
export async function maybeIssueProgramCertificate(db: Db, userId: string, programId: string) {
  const status = await getProgramCertificateStatus(db, userId, programId);
  if (status.certificate) return status.certificate;
  if (!status.eligible) return null;
  const serial = `NXS-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
  await db.insert(programCertificates).values({ userId, programId, score: status.score, serial }).onConflictDoNothing();
  return (await db.query.programCertificates.findFirst({ where: and(eq(programCertificates.userId, userId), eq(programCertificates.programId, programId)) })) ?? null;
}

/** All of a learner's certificates (Odoo modules and whole courses), newest first. */
export async function listCertificates(db: Db, userId: string, limit?: number) {
  const [moduleCerts, courseCerts] = await Promise.all([
    db
      .select({ serial: certificates.serial, title: courses.title, issuedAt: certificates.issuedAt, score: certificates.score })
      .from(certificates)
      .innerJoin(courses, eq(courses.id, certificates.courseId))
      .where(eq(certificates.userId, userId)),
    db
      .select({ serial: programCertificates.serial, title: programs.title, issuedAt: programCertificates.issuedAt, score: programCertificates.score })
      .from(programCertificates)
      .innerJoin(programs, eq(programs.id, programCertificates.programId))
      .where(eq(programCertificates.userId, userId)),
  ]);
  const all = [...courseCerts, ...moduleCerts].sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
  return limit ? all.slice(0, limit) : all;
}

import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { assessmentAttempts, assessments, assignments, businessProcesses, courseModules, courses, lessonProgress, lessons, submissions } from "@/lib/db/schema";
import { ASSESSMENT_MINUTES, PROCESS_MINUTES, PROGRAM_DAY_MINUTES, program, type ProgramItem } from "@/content/program";

export interface ResolvedItem {
  kind: ProgramItem["kind"];
  title: string;
  href: string;
  /** Planned minutes; practice items have none and share the rest of the day. */
  minutes?: number;
  /** Completion for the current user; undefined when the item is not tracked. */
  done?: boolean;
}

export interface ResolvedDay {
  number: number;
  title: string;
  learn: ResolvedItem[];
  practice: ResolvedItem[];
  learnMinutes: number;
  practiceMinutes: number;
}

export interface ResolvedWeek {
  number: number;
  title: string;
  goal: string;
  days: ResolvedDay[];
}

/** Resolves the 4-week program against the database (current titles, durations and the user's completion). */
export async function getProgram(db: Db, userId: string): Promise<ResolvedWeek[]> {
  const [lessonRows, assessmentRows, assignmentRows, processRows] = await Promise.all([
    db
      .select({ id: lessons.id, course: courses.slug, slug: lessons.slug, title: lessons.title, durationMin: lessons.durationMin })
      .from(lessons)
      .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
      .innerJoin(courses, eq(courses.id, courseModules.courseId)),
    db.select({ id: assessments.id, slug: assessments.slug, title: assessments.title, course: courses.slug }).from(assessments).innerJoin(courses, eq(courses.id, assessments.courseId)),
    db.select({ id: assignments.id, slug: assignments.slug, title: assignments.title }).from(assignments),
    db.select({ slug: businessProcesses.slug, title: businessProcesses.title }).from(businessProcesses),
  ]);

  const [doneLessons, passed, submitted] = await Promise.all([
    lessonRows.length
      ? db
          .select({ id: lessonProgress.lessonId })
          .from(lessonProgress)
          .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed"), inArray(lessonProgress.lessonId, lessonRows.map((l) => l.id))))
      : [],
    db.select({ id: assessmentAttempts.assessmentId }).from(assessmentAttempts).where(and(eq(assessmentAttempts.userId, userId), eq(assessmentAttempts.passed, true))),
    db.select({ id: submissions.assignmentId }).from(submissions).where(eq(submissions.userId, userId)),
  ]);
  const doneLessonIds = new Set(doneLessons.map((r) => r.id));
  const passedIds = new Set(passed.map((r) => r.id));
  const submittedIds = new Set(submitted.map((r) => r.id));

  const lessonByKey = new Map(lessonRows.map((l) => [`${l.course}/${l.slug}`, l]));
  const assessmentByCourse = new Map(assessmentRows.map((a) => [a.course, a]));
  const assignmentBySlug = new Map(assignmentRows.map((a) => [a.slug, a]));
  const processBySlug = new Map(processRows.map((p) => [p.slug, p]));

  const resolve = (item: ProgramItem): ResolvedItem | null => {
    switch (item.kind) {
      case "lesson": {
        const l = lessonByKey.get(`${item.course}/${item.lesson}`);
        return l ? { kind: item.kind, title: l.title, href: `/courses/${item.course}/${item.lesson}`, minutes: l.durationMin, done: doneLessonIds.has(l.id) } : null;
      }
      case "assessment": {
        const a = assessmentByCourse.get(item.course);
        return a ? { kind: item.kind, title: a.title, href: `/assessments/${a.slug}`, minutes: ASSESSMENT_MINUTES, done: passedIds.has(a.id) } : null;
      }
      case "assignment": {
        const a = assignmentBySlug.get(item.slug);
        return a ? { kind: item.kind, title: a.title, href: `/assignments/${a.slug}`, done: submittedIds.has(a.id) } : null;
      }
      case "process": {
        const p = processBySlug.get(item.slug);
        return p ? { kind: item.kind, title: p.title, href: `/processes/${p.slug}`, minutes: PROCESS_MINUTES } : null;
      }
      case "lab":
        return { kind: item.kind, title: item.title, href: item.href };
    }
  };
  // Items whose content is unpublished or not seeded yet are left out rather than linking to a 404.
  const resolveAll = (items: ProgramItem[]) => items.map(resolve).filter((i): i is ResolvedItem => i !== null);

  let dayNumber = 0;
  return program.map((week, wi) => ({
    number: wi + 1,
    title: week.title,
    goal: week.goal,
    days: week.days.map((day) => {
      const learn = resolveAll(day.learn);
      const learnMinutes = learn.reduce((sum, i) => sum + (i.minutes ?? 0), 0);
      return {
        number: ++dayNumber,
        title: day.title,
        learn,
        practice: resolveAll(day.practice),
        learnMinutes,
        practiceMinutes: Math.max(0, PROGRAM_DAY_MINUTES - learnMinutes),
      };
    }),
  }));
}

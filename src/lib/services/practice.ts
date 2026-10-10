import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
  exerciseSteps,
  exercises,
  projectTasks,
  projects,
  studentExerciseSteps,
  studentProjectTasks,
  testCases,
} from "@/lib/db/schema";

/* ------------------------------------------------------------------ */
/* Configuration lab (guided checklists)                               */
/* ------------------------------------------------------------------ */

export async function listScenariosWithProgress(db: Db, userId: string) {
  return db
    .select({
      id: exercises.id,
      slug: exercises.slug,
      title: exercises.title,
      summary: exercises.summary,
      businessType: exercises.businessType,
      level: exercises.level,
      odooVersion: exercises.odooVersion,
      totalSteps: sql<number>`count(${exerciseSteps.id})::int`,
      doneSteps: sql<number>`count(${studentExerciseSteps.stepId})::int`,
    })
    .from(exercises)
    .leftJoin(exerciseSteps, eq(exerciseSteps.exerciseId, exercises.id))
    .leftJoin(studentExerciseSteps, and(eq(studentExerciseSteps.stepId, exerciseSteps.id), eq(studentExerciseSteps.userId, userId)))
    .where(eq(exercises.kind, "config_scenario"))
    .groupBy(exercises.id)
    .orderBy(asc(exercises.position));
}

export async function getScenario(db: Db, slug: string, userId: string) {
  const ex = await db.query.exercises.findFirst({
    where: eq(exercises.slug, slug),
    with: { steps: { orderBy: [asc(exerciseSteps.position)] } },
  });
  if (!ex) return null;
  const ids = ex.steps.map((s) => s.id);
  const done = ids.length
    ? await db
        .select({ stepId: studentExerciseSteps.stepId, note: studentExerciseSteps.note, completedAt: studentExerciseSteps.completedAt })
        .from(studentExerciseSteps)
        .where(and(eq(studentExerciseSteps.userId, userId), inArray(studentExerciseSteps.stepId, ids)))
    : [];
  return { exercise: ex, done: new Map(done.map((d) => [d.stepId, d])) };
}

export type StepToggleResult = { ok: true } | { ok: false; error: string };

/**
 * Marks a step complete. Steps with dependencies can only be completed after their
 * prerequisite steps — mirroring the real configuration sequence.
 */
export async function setStepCompleted(db: Db, userId: string, stepId: string, completed: boolean, note?: string): Promise<StepToggleResult> {
  const step = await db.query.exerciseSteps.findFirst({ where: eq(exerciseSteps.id, stepId) });
  if (!step) return { ok: false, error: "Step not found." };
  if (!completed) {
    await db.delete(studentExerciseSteps).where(and(eq(studentExerciseSteps.userId, userId), eq(studentExerciseSteps.stepId, stepId)));
    return { ok: true };
  }
  if (step.dependsOn.length) {
    const prereqs = await db
      .select({ id: exerciseSteps.id, position: exerciseSteps.position })
      .from(exerciseSteps)
      .where(and(eq(exerciseSteps.exerciseId, step.exerciseId), inArray(exerciseSteps.position, step.dependsOn)));
    const done = prereqs.length
      ? await db
          .select({ stepId: studentExerciseSteps.stepId })
          .from(studentExerciseSteps)
          .where(and(eq(studentExerciseSteps.userId, userId), inArray(studentExerciseSteps.stepId, prereqs.map((p) => p.id))))
      : [];
    const doneIds = new Set(done.map((d) => d.stepId));
    const missing = prereqs.filter((p) => !doneIds.has(p.id)).map((p) => p.position);
    if (missing.length) return { ok: false, error: `Complete step ${missing.join(", ")} first — this step depends on it.` };
  }
  await db
    .insert(studentExerciseSteps)
    .values({ userId, stepId, note: note ?? null })
    .onConflictDoUpdate({ target: [studentExerciseSteps.userId, studentExerciseSteps.stepId], set: { note: note ?? null } });
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Implementation projects                                             */
/* ------------------------------------------------------------------ */

export async function listProjectsWithProgress(db: Db, userId: string) {
  return db
    .select({
      id: projects.id,
      slug: projects.slug,
      code: projects.code,
      title: projects.title,
      industry: projects.industry,
      level: projects.level,
      summary: projects.summary,
      totalTasks: sql<number>`count(${projectTasks.id})::int`,
      doneTasks: sql<number>`count(${studentProjectTasks.taskId}) filter (where ${studentProjectTasks.status} = 'done')::int`,
    })
    .from(projects)
    .leftJoin(projectTasks, eq(projectTasks.projectId, projects.id))
    .leftJoin(studentProjectTasks, and(eq(studentProjectTasks.taskId, projectTasks.id), eq(studentProjectTasks.userId, userId)))
    .groupBy(projects.id)
    .orderBy(asc(projects.code));
}

export async function getProject(db: Db, slug: string, userId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
    with: { tasks: { orderBy: [asc(projectTasks.position)] } },
  });
  if (!project) return null;
  const ids = project.tasks.map((t) => t.id);
  const status = ids.length
    ? await db
        .select({ taskId: studentProjectTasks.taskId, status: studentProjectTasks.status })
        .from(studentProjectTasks)
        .where(and(eq(studentProjectTasks.userId, userId), inArray(studentProjectTasks.taskId, ids)))
    : [];
  return { project, status: new Map(status.map((s) => [s.taskId, s.status])) };
}

export async function setTaskStatus(db: Db, userId: string, taskId: string, status: "todo" | "in_progress" | "done") {
  await db
    .insert(studentProjectTasks)
    .values({ userId, taskId, status })
    .onConflictDoUpdate({ target: [studentProjectTasks.userId, studentProjectTasks.taskId], set: { status, updatedAt: new Date() } });
}

/* ------------------------------------------------------------------ */
/* Testing lab                                                         */
/* ------------------------------------------------------------------ */

export function summariseTests(rows: { status: string; module: string }[]) {
  const by = (s: string) => rows.filter((r) => r.status === s).length;
  const executed = rows.length - by("not_run");
  const modules = Array.from(new Set(rows.map((r) => r.module))).map((m) => {
    const mr = rows.filter((r) => r.module === m);
    return { module: m, total: mr.length, pass: mr.filter((r) => r.status === "pass").length, fail: mr.filter((r) => r.status === "fail").length };
  });
  return {
    total: rows.length,
    pass: by("pass"),
    fail: by("fail"),
    blocked: by("blocked"),
    notRun: by("not_run"),
    executionRate: rows.length ? Math.round((executed / rows.length) * 100) : 0,
    passRate: executed ? Math.round((by("pass") / executed) * 100) : 0,
    modules,
  };
}

/** Copies a project's predefined test cases into the user's test register (idempotent by code). */
export async function importProjectTestCases(db: Db, userId: string, projectId: string) {
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project) return 0;
  const data = project.data as { testCases?: { id: string; requirementId: string; module: string; scenario: string; preconditions: string; testData: string; steps: string; expected: string }[] };
  const tcs = data.testCases ?? [];
  if (!tcs.length) return 0;
  const inserted = await db
    .insert(testCases)
    .values(
      tcs.map((t) => ({
        userId,
        projectId,
        code: t.id,
        requirementId: t.requirementId,
        module: t.module,
        scenario: t.scenario,
        preconditions: t.preconditions,
        testData: t.testData,
        steps: t.steps,
        expected: t.expected,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: testCases.id });
  return inserted.length;
}

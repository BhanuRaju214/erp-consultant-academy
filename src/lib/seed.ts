import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
  assessments,
  assignments,
  businessProcesses as processesTable,
  courseModules,
  courses,
  docResources,
  erpPlatforms,
  exerciseSteps,
  exercises,
  learningPathCourses,
  learningPaths,
  lessonResources,
  lessons,
  projectTasks,
  projects,
  questions,
  users,
} from "@/lib/db/schema";
import {
  allCourses,
  businessProcesses,
  configScenarios,
  docLibrary,
  learningPathSeeds,
  platforms,
  allProjects,
} from "@/content";
import type { AssessmentContent, CourseContent } from "@/content/types";
import { hashPassword } from "@/lib/auth/password";
import { findUserByEmail } from "@/lib/services/users";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

async function insertAssessment(tx: Tx, a: AssessmentContent, link: { courseId?: string; processId?: string }) {
  const [row] = await tx
    .insert(assessments)
    .values({ slug: a.slug, title: a.title, passMark: a.passMark, courseId: link.courseId ?? null, processId: link.processId ?? null })
    .returning();
  if (a.questions.length) {
    await tx.insert(questions).values(
      a.questions.map((q, i) => ({
        assessmentId: row.id,
        prompt: q.prompt,
        kind: q.kind,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        position: i,
      })),
    );
  }
}

async function insertCourse(tx: Tx, c: CourseContent, platformIds: Map<string, string>) {
  const [course] = await tx
    .insert(courses)
    .values({
      slug: c.slug,
      section: c.section,
      title: c.title,
      summary: c.summary,
      level: c.level,
      odooVersion: c.odooVersion,
      skills: c.skills,
      position: c.position,
      platformId: c.platform === "generic" ? null : platformIds.get(c.platform) ?? null,
      certMinScore: c.assessment?.passMark ?? 70,
    })
    .returning();
  for (const [mi, m] of c.modules.entries()) {
    const [mod] = await tx.insert(courseModules).values({ courseId: course.id, title: m.title, position: mi }).returning();
    for (const [li, l] of m.lessons.entries()) {
      const [lesson] = await tx
        .insert(lessons)
        .values({
          moduleId: mod.id,
          slug: l.slug,
          title: l.title,
          body: l.body,
          durationMin: l.durationMin,
          odooVersions: l.odooVersions,
          scope: l.scope,
          flashcards: l.flashcards ?? [],
          position: li,
        })
        .returning();
      if (l.resources?.length) {
        await tx.insert(lessonResources).values(l.resources.map((r) => ({ lessonId: lesson.id, kind: r.kind, title: r.title, url: r.url })));
      }
    }
  }
  if (c.assessment) await insertAssessment(tx, c.assessment, { courseId: course.id });
  for (const a of c.assignments ?? []) {
    await tx.insert(assignments).values({ slug: a.slug, title: a.title, instructions: a.instructions, courseId: course.id });
  }
  return course;
}

/**
 * Updates an existing course in place from its content file, matching modules by
 * position and lessons by slug. Learner progress, notes, bookmarks and attempts are
 * preserved; lessons removed from the content file are kept (and reported).
 */
async function syncCourse(tx: Tx, courseId: string, c: CourseContent, platformIds: Map<string, string>): Promise<string> {
  await tx
    .update(courses)
    .set({
      section: c.section,
      title: c.title,
      summary: c.summary,
      level: c.level,
      odooVersion: c.odooVersion,
      skills: c.skills,
      position: c.position,
      platformId: c.platform === "generic" ? null : platformIds.get(c.platform) ?? null,
    })
    .where(eq(courses.id, courseId));

  const existingModules = await tx.select().from(courseModules).where(eq(courseModules.courseId, courseId));
  const existingLessons = await tx
    .select({ id: lessons.id, slug: lessons.slug })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .where(eq(courseModules.courseId, courseId));
  const lessonBySlug = new Map(existingLessons.map((l) => [l.slug, l.id]));
  const seen = new Set<string>();
  let added = 0;
  let updated = 0;

  for (const [mi, m] of c.modules.entries()) {
    let mod = existingModules.find((x) => x.position === mi);
    if (mod) await tx.update(courseModules).set({ title: m.title }).where(eq(courseModules.id, mod.id));
    else [mod] = await tx.insert(courseModules).values({ courseId, title: m.title, position: mi }).returning();

    for (const [li, l] of m.lessons.entries()) {
      seen.add(l.slug);
      const values = {
        moduleId: mod.id,
        slug: l.slug,
        title: l.title,
        body: l.body,
        durationMin: l.durationMin,
        odooVersions: l.odooVersions,
        scope: l.scope,
        flashcards: l.flashcards ?? [],
        position: li,
      };
      let lessonId = lessonBySlug.get(l.slug);
      if (lessonId) {
        await tx.update(lessons).set(values).where(eq(lessons.id, lessonId));
        await tx.delete(lessonResources).where(eq(lessonResources.lessonId, lessonId));
        updated++;
      } else {
        [{ id: lessonId }] = await tx.insert(lessons).values(values).returning({ id: lessons.id });
        added++;
      }
      if (l.resources?.length) {
        await tx.insert(lessonResources).values(l.resources.map((r) => ({ lessonId: lessonId!, kind: r.kind, title: r.title, url: r.url })));
      }
    }
  }

  if (c.assessment) {
    const a = c.assessment;
    const current = await tx.query.assessments.findFirst({ where: eq(assessments.slug, a.slug) });
    if (current) {
      await tx.update(assessments).set({ title: a.title, passMark: a.passMark, courseId }).where(eq(assessments.id, current.id));
      // Replace the question bank; past attempt scores are kept.
      await tx.delete(questions).where(eq(questions.assessmentId, current.id));
      await tx.insert(questions).values(
        a.questions.map((q, i) => ({ assessmentId: current.id, prompt: q.prompt, kind: q.kind, options: q.options, correct: q.correct, explanation: q.explanation, position: i })),
      );
    } else {
      await insertAssessment(tx, a, { courseId });
    }
  }
  for (const a of c.assignments ?? []) {
    await tx
      .insert(assignments)
      .values({ slug: a.slug, title: a.title, instructions: a.instructions, courseId })
      .onConflictDoUpdate({ target: assignments.slug, set: { title: a.title, instructions: a.instructions, courseId } });
  }
  const orphaned = existingLessons.filter((l) => !seen.has(l.slug)).length;
  return `${updated} lessons updated, ${added} added${orphaned ? `, ${orphaned} no longer in content (kept)` : ""}`;
}

function demoPassword(envName: string, fallback: string): string {
  const v = process.env[envName];
  if (v) return v;
  if (process.env.NODE_ENV === "production") throw new Error(`${envName} must be set to seed accounts in production.`);
  return fallback;
}

export async function seedAll(
  db: Db,
  opts: { force?: boolean; skipUsers?: boolean; refresh?: string[]; refreshProjectData?: boolean } = {},
): Promise<string[]> {
  const log: string[] = [];
  const force = opts.force ?? false;
  const refresh = new Set(opts.refresh ?? []);

  // ---- Platforms ----------------------------------------------------------
  for (const p of platforms) {
    await db.insert(erpPlatforms).values(p).onConflictDoNothing();
  }
  const platformIds = new Map((await db.select().from(erpPlatforms)).map((p) => [p.slug, p.id]));

  // ---- Courses --------------------------------------------------------------
  for (const c of allCourses) {
    const existing = await db.query.courses.findFirst({ where: eq(courses.slug, c.slug) });
    if (existing && !force && refresh.has(c.slug)) {
      const summary = await db.transaction((tx) => syncCourse(tx, existing.id, c, platformIds));
      log.push(`↻ course ${c.slug} refreshed in place (${summary})`);
      continue;
    }
    if (existing && !force) {
      log.push(`· course ${c.slug} exists — skipped`);
      continue;
    }
    await db.transaction(async (tx) => {
      if (existing) await tx.delete(courses).where(eq(courses.id, existing.id));
      // Assignment/assessment slugs are unique; remove orphans before re-insert.
      for (const a of c.assignments ?? []) await tx.delete(assignments).where(eq(assignments.slug, a.slug));
      if (c.assessment) await tx.delete(assessments).where(eq(assessments.slug, c.assessment.slug));
      await insertCourse(tx, c, platformIds);
    });
    log.push(`✓ course ${c.slug} (${c.modules.reduce((n, m) => n + m.lessons.length, 0)} lessons)`);
  }

  // ---- Learning paths -------------------------------------------------------
  const courseIds = new Map((await db.select({ id: courses.id, slug: courses.slug }).from(courses)).map((c) => [c.slug, c.id]));
  for (const [pi, p] of learningPathSeeds.entries()) {
    let path = await db.query.learningPaths.findFirst({ where: eq(learningPaths.slug, p.slug) });
    if (!path) {
      [path] = await db.insert(learningPaths).values({ slug: p.slug, title: p.title, level: p.level, description: p.description, position: pi }).returning();
    }
    for (const [ci, slug] of p.courses.entries()) {
      const courseId = courseIds.get(slug);
      if (courseId) {
        await db
          .insert(learningPathCourses)
          .values({ pathId: path.id, courseId, position: ci })
          .onConflictDoUpdate({ target: [learningPathCourses.pathId, learningPathCourses.courseId], set: { position: ci } });
      }
    }
  }
  log.push(`✓ ${learningPathSeeds.length} learning paths`);

  // ---- Business processes ---------------------------------------------------
  for (const [i, p] of businessProcesses.entries()) {
    const existing = await db.query.businessProcesses.findFirst({ where: eq(processesTable.slug, p.slug) });
    if (existing && !force) {
      // Refresh the page content only; the quiz and its attempts stay untouched.
      if (opts.refreshProjectData) {
        const { quiz: _quiz, ...data } = p;
        await db
          .update(processesTable)
          .set({ title: p.title, shortName: p.shortName, category: p.category, summary: p.summary, data })
          .where(eq(processesTable.id, existing.id));
      }
      continue;
    }
    await db.transaction(async (tx) => {
      if (existing) await tx.delete(processesTable).where(eq(processesTable.id, existing.id));
      if (p.quiz) await tx.delete(assessments).where(eq(assessments.slug, p.quiz.slug));
      const { quiz, ...data } = p;
      const [row] = await tx
        .insert(processesTable)
        .values({ slug: p.slug, title: p.title, shortName: p.shortName, category: p.category, summary: p.summary, position: i, data })
        .returning();
      if (quiz) await insertAssessment(tx, quiz, { processId: row.id });
    });
  }
  log.push(`✓ ${businessProcesses.length} business processes`);

  // ---- Configuration scenarios ---------------------------------------------
  for (const [i, s] of configScenarios.entries()) {
    const existing = await db.query.exercises.findFirst({ where: eq(exercises.slug, s.slug) });
    if (existing && !force) continue;
    await db.transaction(async (tx) => {
      if (existing) await tx.delete(exercises).where(eq(exercises.id, existing.id));
      const { steps, ...data } = s;
      const [ex] = await tx
        .insert(exercises)
        .values({
          slug: s.slug,
          kind: "config_scenario",
          title: s.title,
          businessType: s.businessType,
          level: s.level,
          summary: s.summary,
          odooVersion: s.odooVersion,
          data,
          position: i,
        })
        .returning();
      await tx.insert(exerciseSteps).values(
        steps.map((st, si) => ({
          exerciseId: ex.id,
          position: si + 1,
          title: st.title,
          why: st.why,
          instructions: st.instructions,
          odooPath: st.odooPath ?? null,
          dependsOn: st.dependsOn ?? [],
          validation: st.validation,
          commonMistakes: st.commonMistakes,
        })),
      );
    });
  }
  log.push(`✓ ${configScenarios.length} configuration scenarios`);

  // ---- Projects --------------------------------------------------------------
  for (const p of allProjects) {
    const existing = await db.query.projects.findFirst({ where: eq(projects.slug, p.slug) });
    if (existing && !force) {
      // Non-destructive refresh: update the project document (requirements, data files, test cases…)
      // but keep the task rows so learners' task progress is preserved.
      if (opts.refreshProjectData) {
        await db
          .update(projects)
          .set({ code: p.code, title: p.title, industry: p.industry, level: p.level, summary: p.summary, odooVersion: p.odooVersion, data: p })
          .where(eq(projects.id, existing.id));
      }
      continue;
    }
    await db.transaction(async (tx) => {
      if (existing) await tx.delete(projects).where(eq(projects.id, existing.id));
      const [proj] = await tx
        .insert(projects)
        .values({ slug: p.slug, code: p.code, title: p.title, industry: p.industry, level: p.level, summary: p.summary, odooVersion: p.odooVersion, data: p })
        .returning();
      let pos = 0;
      const rows = p.phases.flatMap((ph) =>
        ph.tasks.map((t) => ({ projectId: proj.id, phase: ph.key, phaseTitle: ph.title, title: t.title, description: t.description, deliverable: t.deliverable, position: pos++ })),
      );
      if (rows.length) await tx.insert(projectTasks).values(rows);
      const slug = `${p.slug}-final-submission`;
      await tx.delete(assignments).where(eq(assignments.slug, slug));
      await tx.insert(assignments).values({
        slug,
        projectId: proj.id,
        title: `${p.title} — implementation dossier`,
        instructions:
          "Submit your final implementation documentation as a single PDF or ZIP: requirement traceability matrix, fit-gap, TO-BE process document, configuration workbook, data migration mapping + reconciliation, executed test cases with summary, and go-live readiness checklist. Your trainer evaluates it using the project rubric.",
      });
    });
  }
  log.push(`✓ ${allProjects.length} projects`);

  // ---- Documentation -----------------------------------------------------------
  for (const d of docLibrary) {
    if (force) {
      await db
        .insert(docResources)
        .values(d)
        .onConflictDoUpdate({ target: docResources.slug, set: { title: d.title, category: d.category, summary: d.summary, body: d.body } });
    } else {
      await db.insert(docResources).values(d).onConflictDoNothing();
    }
  }
  log.push(`✓ ${docLibrary.length} documentation resources`);

  // ---- Demo accounts -----------------------------------------------------------
  if (!opts.skipUsers) {
    const foundations = await db.query.learningPaths.findFirst({ where: eq(learningPaths.slug, "consultant-foundations") });
    const accounts = [
      { email: process.env.SEED_ADMIN_EMAIL ?? "admin@academy.test", name: "Academy Admin", role: "admin" as const, pw: demoPassword("SEED_ADMIN_PASSWORD", "AdminDemo2026") },
      { email: process.env.SEED_TRAINER_EMAIL ?? "trainer@academy.test", name: "Priya Trainer", role: "trainer" as const, pw: demoPassword("SEED_TRAINER_PASSWORD", "TrainerDemo2026") },
      { email: process.env.SEED_STUDENT_EMAIL ?? "student@academy.test", name: "Sam Student", role: "student" as const, pw: demoPassword("SEED_STUDENT_PASSWORD", "StudentDemo2026") },
    ];
    for (const a of accounts) {
      if (await findUserByEmail(db, a.email)) continue;
      await db.insert(users).values({
        email: a.email,
        name: a.name,
        role: a.role,
        passwordHash: await hashPassword(a.pw),
        learningPathId: a.role === "student" ? foundations?.id ?? null : null,
      });
      log.push(`✓ user ${a.email} (${a.role})`);
    }
  }
  return log;
}

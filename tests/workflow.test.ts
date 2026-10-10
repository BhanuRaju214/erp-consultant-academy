/**
 * End-to-end service workflow against a real (in-memory) PostgreSQL via PGlite:
 * migrate → seed → register → login → learn a lesson → complete an exercise →
 * take a quiz → track progress → earn a certificate → trainer overview → search.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, asc, eq } from "drizzle-orm";
import { createDb, type DbHandle } from "@/lib/db/client";
import { seedAll } from "@/lib/seed";
import { assessments, certificates, courseModules, courses, exerciseSteps, exercises, lessonProgress, lessons, questions, testCases } from "@/lib/db/schema";
import { authenticate, registerUser } from "@/lib/services/users";
import { createSession, getUserByToken } from "@/lib/auth/session";
import { getCourseOutline, getLesson, markLessonStarted, setLessonCompleted, submitAssessment } from "@/lib/services/learning";
import { getProject, importProjectTestCases, setStepCompleted, setTaskStatus } from "@/lib/services/practice";
import { getStudentDashboard, getTrainerOverview } from "@/lib/services/dashboard";
import { retrievePassages, searchContent } from "@/lib/services/search";
import { buildNavTree } from "@/lib/services/nav-tree";

let h: DbHandle;

beforeAll(async () => {
  h = await createDb({ dataDir: "memory://", url: "" });
  await h.migrate();
  await seedAll(h.db, { skipUsers: true });
});

afterAll(async () => {
  await h?.close();
});

describe("student workflow", () => {
  let userId = "";

  it("registers and logs in a new student with a learning path", async () => {
    const weak = await registerUser(h.db, { name: "Ana Trainee", email: "ana@example.test", password: "short" });
    expect(weak.ok).toBe(false);

    const res = await registerUser(h.db, { name: "Ana Trainee", email: "Ana@Example.test", password: "Consultant2026", pathSlug: "consultant-foundations" });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    userId = res.value.id;
    expect(res.value.role).toBe("student");

    const dup = await registerUser(h.db, { name: "Ana", email: "ana@example.test", password: "Consultant2026" });
    expect(dup.ok).toBe(false);

    expect((await authenticate(h.db, "ana@example.test", "wrong-password1")).ok).toBe(false);
    const login = await authenticate(h.db, "ANA@example.test", "Consultant2026");
    expect(login.ok).toBe(true);
    const { token } = await createSession(h.db, userId);
    expect((await getUserByToken(h.db, token))?.id).toBe(userId);
    expect(await getUserByToken(h.db, "forged-token")).toBeNull();
  });

  it("recommends the first lesson of the learning path", async () => {
    const d = await getStudentDashboard(h.db, userId);
    expect(d.path?.slug).toBe("consultant-foundations");
    expect(d.nextLesson?.courseSlug).toBe("erp-fundamentals");
    expect(d.totals.lessons).toBeGreaterThan(50);
    expect(d.totals.done).toBe(0);
  });

  it("opens and completes a lesson", async () => {
    const outline = await getCourseOutline(h.db, "erp-fundamentals", userId);
    const first = outline!.course.modules[0].lessons[0];
    const lesson = await getLesson(h.db, "erp-fundamentals", first.slug);
    expect(lesson?.lesson.body.length).toBeGreaterThan(1000);
    expect(lesson?.prev).toBeNull();
    await markLessonStarted(h.db, userId, first.id);
    await setLessonCompleted(h.db, userId, first.id, true);

    const d = await getStudentDashboard(h.db, userId);
    expect(d.totals.done).toBe(1);
    expect(d.nextLesson?.lessonSlug).not.toBe(first.slug);
  });

  it("enforces configuration-lab step dependencies", async () => {
    const ex = await h.db.query.exercises.findFirst({ where: eq(exercises.slug, "trading-company") });
    const steps = await h.db.select().from(exerciseSteps).where(eq(exerciseSteps.exerciseId, ex!.id)).orderBy(asc(exerciseSteps.position));
    expect(steps).toHaveLength(12);
    const dependent = steps.find((s) => s.dependsOn.length > 0)!;
    const blocked = await setStepCompleted(h.db, userId, dependent.id, true);
    expect(blocked.ok).toBe(false);

    for (const s of steps) {
      const r = await setStepCompleted(h.db, userId, s.id, true);
      expect(r.ok, `step ${s.position}`).toBe(true);
    }
    expect((await getStudentDashboard(h.db, userId)).exerciseStepsDone).toBe(12);
  });

  it("scores a quiz and records the best attempt", async () => {
    const a = await h.db.query.assessments.findFirst({ where: eq(assessments.slug, "erp-fundamentals-final") });
    const qs = await h.db.select().from(questions).where(eq(questions.assessmentId, a!.id));
    const wrong = Object.fromEntries(qs.map((q) => [q.id, [q.options.length - 1 === q.correct[0] ? 0 : q.options.length - 1]]));
    const fail = await submitAssessment(h.db, userId, a!.id, wrong);
    expect(fail.passed).toBe(false);

    const right = Object.fromEntries(qs.map((q) => [q.id, q.correct]));
    const pass = await submitAssessment(h.db, userId, a!.id, right);
    expect(pass.score).toBe(100);
    expect(pass.passed).toBe(true);

    const d = await getStudentDashboard(h.db, userId);
    expect(d.scores.find((s) => s.assessmentId === a!.id)?.best).toBe(100);
    expect(d.scores.find((s) => s.assessmentId === a!.id)?.attempts).toBe(2);
    // Not all lessons are complete yet → no certificate.
    expect(d.certificates).toHaveLength(0);
  });

  it("issues a certificate once all lessons are complete", async () => {
    const course = await h.db.query.courses.findFirst({ where: eq(courses.slug, "erp-fundamentals") });
    const all = await h.db
      .select({ id: lessons.id })
      .from(lessons)
      .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
      .where(eq(courseModules.courseId, course!.id));
    for (const l of all) await setLessonCompleted(h.db, userId, l.id, true);
    const d = await getStudentDashboard(h.db, userId);
    expect(d.certificates).toHaveLength(1);
    expect(d.certificates[0].serial).toMatch(/^ECA-\d{4}-[0-9A-F]{8}$/);
    expect(d.skillsGained.length).toBeGreaterThan(0);
  });

  it("tracks implementation project tasks and loads its test cases", async () => {
    const p = await getProject(h.db, "trading-company-implementation", userId);
    expect(p!.project.tasks.length).toBeGreaterThan(20);
    await setTaskStatus(h.db, userId, p!.project.tasks[0].id, "done");
    const d = await getStudentDashboard(h.db, userId);
    expect(d.projects[0].doneTasks).toBe(1);

    const n = await importProjectTestCases(h.db, userId, p!.project.id);
    expect(n).toBeGreaterThan(10);
    expect(await importProjectTestCases(h.db, userId, p!.project.id)).toBe(0);
    const rows = await h.db.select().from(testCases).where(and(eq(testCases.userId, userId)));
    expect(rows).toHaveLength(n);
  });

  it("shows the student on the trainer overview", async () => {
    const o = await getTrainerOverview(h.db);
    const me = o.students.find((s) => s.id === userId)!;
    expect(me.lessonsDone).toBeGreaterThan(5);
    expect(me.avgScore).toBe(100);
    expect(me.stepsDone).toBe(12);
    expect(me.certCount).toBe(1);
  });
});

describe("navigation tree", () => {
  it("builds section → course/module → lesson dropdowns with completion state", async () => {
    const student = await h.db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, "ana@example.test") });
    const tree = await buildNavTree(h.db, { id: student!.id, role: "student" });

    // Multi-course section: courses → lessons, with a progress badge.
    const apps = tree["/learn/odoo-apps"];
    const accounting = apps.find((n) => n.id === "course:odoo-accounting")!;
    expect(accounting.children!.some((l) => l.href === "/courses/odoo-accounting/india-e-invoicing-irn")).toBe(true);
    expect(apps.some((n) => n.id === "course:odoo-manufacturing")).toBe(true);

    // Single-course section: overview + modules → lessons, completed lessons ticked.
    const fundamentals = tree["/learn/erp-fundamentals"];
    expect(fundamentals[0].href).toBe("/courses/erp-fundamentals");
    const lessonsInModules = fundamentals.slice(1).flatMap((m) => m.children ?? []);
    expect(lessonsInModules.length).toBeGreaterThan(5);
    expect(lessonsInModules.every((l) => l.done === true)).toBe(true);
    expect(fundamentals[0].badge).toMatch(/^(\d+)\/\1$/);

    // Labs, projects and docs expose their contents.
    expect(tree["/config-lab"].find((n) => n.id === "scenario:trading-company")!.children).toHaveLength(13);
    expect(tree["/projects"][1].children!.map((c) => c.href)).toContain("/projects/trading-company-implementation#tests");
    expect(tree["/import-lab"].find((n) => n.id === "import:templates")!.children).toHaveLength(5);
    expect(tree["/docs"].length).toBeGreaterThan(3);

    // Trainer-only entries are not built for students.
    expect(tree["/trainer"]).toBeUndefined();
    expect((await buildNavTree(h.db, { id: student!.id, role: "admin" }))["/trainer"].some((n) => n.href === "/admin")).toBe(true);
  });
});

describe("search", () => {
  it("finds lessons, docs and processes with full-text search", async () => {
    const hits = await searchContent(h.db, "opening stock");
    expect(hits.length).toBeGreaterThan(0);
    expect(new Set(hits.map((x) => x.kind)).size).toBeGreaterThan(1);
    expect(await searchContent(h.db, "x")).toEqual([]);
  });
  it("retrieves passages for the assistant from natural questions", async () => {
    const p = await retrievePassages(h.db, "What does the invoicing policy on a product do?");
    expect(p.length).toBeGreaterThan(0);
  });
});

describe("seed idempotency", () => {
  it("refreshing a course in place keeps learner progress and certificates", async () => {
    const countDone = async () =>
      (await h.db.select().from(lessonProgress).where(eq(lessonProgress.status, "completed"))).length;
    const doneBefore = await countDone();
    const certsBefore = (await h.db.select().from(certificates)).length;
    const log = await seedAll(h.db, { skipUsers: true, refresh: ["erp-fundamentals", "odoo-accounting"] });
    expect(log.some((l) => l.startsWith("↻ course erp-fundamentals"))).toBe(true);
    expect(await countDone()).toBe(doneBefore);
    expect((await h.db.select().from(certificates)).length).toBe(certsBefore);
    const a = await h.db.query.assessments.findFirst({ where: eq(assessments.slug, "erp-fundamentals-final") });
    expect((await h.db.select().from(questions).where(eq(questions.assessmentId, a!.id))).length).toBeGreaterThan(0);
  });

  it("re-running the seed keeps content and progress", async () => {
    const before = await h.db.select({ id: lessons.id }).from(lessons);
    const log = await seedAll(h.db, { skipUsers: true });
    expect(log.some((l) => l.includes("skipped"))).toBe(true);
    const after = await h.db.select({ id: lessons.id }).from(lessons);
    expect(after.length).toBe(before.length);
  });
});

/**
 * Course builder and AI course generation against in-memory PostgreSQL, with a
 * fake LLM (no network calls).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { asc, eq } from "drizzle-orm";
import { createDb, type DbHandle } from "@/lib/db/client";
import { aiGenerations, certificates, courses, lessons, programs, questions } from "@/lib/db/schema";
import type { LlmClient } from "@/lib/ai/llm";
import { addChapter, addLesson, addModule, deleteLesson, getProgramContent, moveItem, programLessonIds, programSlugForLesson } from "@/lib/services/builder";
import { createCourseFromOutline, generateOutline, requeueFailedLessons, runGeneration, sanitizeLessonBody, type Outline } from "@/lib/services/ai-course";
import { canAccessProgram, enroll, saveProgram } from "@/lib/services/programs";
import { getProgramCertificateStatus, listCertificates, setLessonCompleted, submitAssessment } from "@/lib/services/learning";
import { addQuestion, getModuleQuiz, questionInputSchema, saveQuizSettings, shuffleOptions } from "@/lib/services/quizzes";
import { registerUser } from "@/lib/services/users";

let h: DbHandle;

beforeAll(async () => {
  h = await createDb({ dataDir: "memory://", url: "" });
  await h.migrate();
});

afterAll(async () => {
  await h?.close();
});

const CHECK_OK = '```visual-check\n{"question": "2+2?", "options": ["3", "4"], "correct": 1, "explanation": "Basic maths."}\n```';
const CHECK_BAD_INDEX = '```visual-check\n{"question": "Bad", "options": ["a", "b"], "correct": 5, "explanation": "x"}\n```';
const CHECK_BAD_JSON = "```visual-check\n{not json}\n```";
const OTHER_VISUAL = '```visual-hub\n{"center": {"label": "x"}}\n```';

function lessonBody(title: string) {
  return `# ${title}\n\nWhy it matters. ${"Practical words. ".repeat(40)}\n\n## Check your understanding\n\n${CHECK_OK}\n\n${CHECK_BAD_INDEX}\n\n${CHECK_BAD_JSON}\n\n${OTHER_VISUAL}\n\n## Key takeaways\n\n- One`;
}

function outline(modules = 2, lessonsEach = 2): Outline {
  return {
    title: "Practical Excel for Analysts",
    subtitle: "From formulas to dashboards",
    description: "A hands-on course.",
    level: "beginner",
    highlights: ["Formulas", "Pivot tables", "Dashboards"],
    modules: Array.from({ length: modules }, (_, m) => ({
      title: `Module ${m + 1} topic`,
      summary: `Summary ${m + 1}`,
      chapters: [{ title: `Chapter ${m + 1}`, lessons: Array.from({ length: lessonsEach }, (_, l) => ({ title: `Lesson ${m + 1}.${l + 1} basics`, objective: "Do a thing.", durationMin: 12 })) }],
    })),
  };
}

/** A quiz as the model might return it: valid questions plus one with an out-of-range answer. */
function quizData(count: number) {
  const valid = Array.from({ length: count }, (_, i) => ({ prompt: `Question ${i + 1} about cells?`, kind: "single", options: ["A", "B", "C", "D"], correct: [i % 4], explanation: "Because." }));
  return { questions: [...valid, { prompt: "Broken question?", kind: "single", options: ["A", "B"], correct: [7], explanation: "x" }] };
}

/** Fake LLM: returns an outline, a lesson or a quiz; can be told to fail for specific lesson titles. */
function fakeLlm(opts: { outline?: unknown; failFor?: string[] } = {}): LlmClient & { calls: number } {
  const llm = {
    model: "fake-model",
    calls: 0,
    async json<T>({ schemaName, user }: { schemaName: string; user: string }) {
      llm.calls++;
      if (schemaName === "course_outline") return { data: (opts.outline ?? outline()) as T, usage: { promptTokens: 100, completionTokens: 400 } };
      if (schemaName === "module_quiz") return { data: quizData(Number(/exactly (\d+) questions/.exec(user)?.[1] ?? 5)) as T, usage: { promptTokens: 30, completionTokens: 300 } };
      const title = /This lesson: "([^"]+)"/.exec(user)?.[1] ?? "Lesson";
      if (opts.failFor?.includes(title)) throw new Error("rate limited");
      return { data: { body: lessonBody(title), durationMin: 14, flashcards: [{ term: "Cell", definition: "A box in a sheet." }] } as T, usage: { promptTokens: 50, completionTokens: 900 } };
    },
  };
  return llm;
}

describe("course builder", () => {
  it("builds modules, chapters and lessons with unique slugs, ordering and deletion", async () => {
    const p = await saveProgram(h.db, { title: "Manual Course", slug: "manual-course", level: "beginner", status: "draft", enrollmentMode: "invite" });
    if (!p.ok) throw new Error(p.error);
    expect(p.value.homePath).toBe("/programs/manual-course");

    const m1 = await addModule(h.db, p.value.id, { title: "Getting started" });
    const m2 = await addModule(h.db, p.value.id, { title: "Getting started" });
    if (!m1.ok || !m2.ok) throw new Error("module");
    expect(m1.value.slug).toBe("manual-course-getting-started");
    expect(m2.value.slug).toBe("manual-course-getting-started-2");
    expect((await addModule(h.db, p.value.id, { title: "x" })).ok).toBe(false);

    const ch = await addChapter(h.db, m1.value.id, "Basics");
    const ch2 = await addChapter(h.db, m1.value.id, "More");
    if (!ch.ok || !ch2.ok) throw new Error("chapter");
    const a = await addLesson(h.db, ch.value.id, { title: "Welcome" });
    const b = await addLesson(h.db, ch2.value.id, { title: "Welcome" });
    const c = await addLesson(h.db, ch.value.id, { title: "Setup" });
    if (!a.ok || !b.ok || !c.ok) throw new Error("lesson");
    // Lesson slugs are unique across the whole module (URLs are /<module>/<lesson>).
    expect(a.value.slug).toBe("welcome");
    expect(b.value.slug).toBe("welcome-2");
    expect(await programSlugForLesson(h.db, a.value.id)).toBe("manual-course");

    await moveItem(h.db, "lesson", c.value.id, "up");
    let tree = await getProgramContent(h.db, p.value.id);
    expect(tree[0].chapters[0].lessons.map((l) => l.title)).toEqual(["Setup", "Welcome"]);
    await moveItem(h.db, "module", m2.value.id, "up");
    tree = await getProgramContent(h.db, p.value.id);
    expect(tree.map((m) => m.id)).toEqual([m2.value.id, m1.value.id]);

    await deleteLesson(h.db, c.value.id);
    const rows = await h.db.select({ position: lessons.position }).from(lessons).where(eq(lessons.moduleId, ch.value.id)).orderBy(asc(lessons.position));
    expect(rows.map((r) => r.position)).toEqual([0]);
  });

  it("gives learners access only to published courses they're enrolled in", async () => {
    const reg = await registerUser(h.db, { name: "Builder Learner", email: "builder@example.test", password: "BuilderLearn2026" });
    if (!reg.ok) throw new Error(reg.error);
    const learner = { id: reg.value.id, role: "student" as const };
    const [program] = await h.db.select().from(programs).where(eq(programs.slug, "manual-course"));
    await enroll(h.db, { programId: program.id, userId: learner.id, source: "admin" });
    expect(await canAccessProgram(h.db, learner, "manual-course")).toBe(false); // still a draft
    await h.db.update(programs).set({ status: "published" }).where(eq(programs.id, program.id));
    expect(await canAccessProgram(h.db, learner, "manual-course")).toBe(true);
  });
});

describe("AI course builder", () => {
  it("keeps only valid knowledge checks in generated lessons", () => {
    const out = sanitizeLessonBody(lessonBody("Intro"));
    expect(out.startsWith("# ")).toBe(false);
    expect(out).toContain('"question": "2+2?"');
    expect(out).not.toContain("Bad");
    expect(out).not.toContain("not json");
    expect(out).not.toContain("visual-hub");
  });

  it("validates outlines", async () => {
    expect((await generateOutline(fakeLlm(), { topic: "x" })).ok).toBe(false);
    const ok = await generateOutline(fakeLlm(), { topic: "Excel for analysts", modules: 2, lessonsPerModule: 2 });
    expect(ok.ok && ok.value.outline.modules.length).toBe(2);
    const broken = await generateOutline(fakeLlm({ outline: { title: "No modules" } }), { topic: "Excel for analysts" });
    expect(broken.ok).toBe(false);
    const huge = await generateOutline(fakeLlm({ outline: outline(10, 7) }), { topic: "Excel for analysts" });
    expect(huge.ok).toBe(false);
  });

  it("creates a draft course and writes every lesson and module quiz, isolating failures", async () => {
    const reg = await registerUser(h.db, { name: "AI Admin", email: "ai-admin@example.test", password: "AiAdmin2026x" });
    if (!reg.ok) throw new Error(reg.error);
    const created = await createCourseFromOutline(h.db, { brief: { topic: "Excel for analysts", quizQuestions: 4 }, outline: outline(2, 2), model: "fake-model", createdById: reg.value.id });
    if (!created.ok) throw new Error(created.error);
    const [program] = await h.db.select().from(programs).where(eq(programs.id, created.value.programId));
    expect(program).toMatchObject({ status: "draft", enrollmentMode: "invite", homePath: "/programs/practical-excel-for-analysts" });

    const ids = await programLessonIds(h.db, program.id);
    expect(ids).toHaveLength(4);
    // A lesson the admin already wrote by hand is left alone.
    await h.db.update(lessons).set({ aiStatus: null, body: "Hand written" }).where(eq(lessons.id, ids[3]));

    const llm = fakeLlm({ failFor: ["Lesson 2.1 basics"] });
    await runGeneration(h.db, llm, created.value.generationId);
    const [gen] = await h.db.select().from(aiGenerations).where(eq(aiGenerations.id, created.value.generationId));
    // Module 1 gets its quiz; module 2 has no written lesson text yet, so its quiz fails.
    expect(gen).toMatchObject({ status: "done", lessonsDone: 2, lessonsFailed: 1, quizzesTotal: 2, quizzesDone: 1, quizzesFailed: 1, promptTokens: 130, completionTokens: 2100 });
    const tree = await getProgramContent(h.db, program.id);
    const quiz1 = await getModuleQuiz(h.db, tree[0].id);
    expect(quiz1?.questions).toHaveLength(4); // the broken question was dropped
    expect(quiz1?.passMark).toBe(70);
    expect((await getModuleQuiz(h.db, tree[1].id))?.questions ?? []).toHaveLength(0);

    const rows = await h.db.select().from(lessons).where(eq(lessons.id, ids[0]));
    expect(rows[0]).toMatchObject({ aiStatus: "done", durationMin: 14 });
    expect(rows[0].body).toContain("visual-check");
    expect(rows[0].flashcards).toHaveLength(1);
    const [failed] = await h.db.select().from(lessons).where(eq(lessons.id, ids[2]));
    expect(failed).toMatchObject({ aiStatus: "error", aiError: "rate limited" });
    const [manual] = await h.db.select().from(lessons).where(eq(lessons.id, ids[3]));
    expect(manual.body).toBe("Hand written");

    // Retry: failed lessons go back in the queue and the next run writes them.
    expect(await requeueFailedLessons(h.db, program.id)).toBe(1);
    await runGeneration(h.db, fakeLlm(), created.value.generationId);
    const [retried] = await h.db.select().from(lessons).where(eq(lessons.id, ids[2]));
    expect(retried.aiStatus).toBe("done");
    expect((await getModuleQuiz(h.db, tree[1].id))?.questions).toHaveLength(4);
    expect((await getModuleQuiz(h.db, tree[0].id))?.questions).toHaveLength(4); // not rewritten
  });

  it("stops when cancelled", async () => {
    const reg = await registerUser(h.db, { name: "AI Admin 2", email: "ai-admin2@example.test", password: "AiAdmin2026x" });
    if (!reg.ok) throw new Error(reg.error);
    const created = await createCourseFromOutline(h.db, { brief: { topic: "Cancelled course" }, outline: { ...outline(1, 2), title: "Cancelled Course" }, model: "fake", createdById: reg.value.id });
    if (!created.ok) throw new Error(created.error);
    await h.db.update(aiGenerations).set({ status: "cancelled" }).where(eq(aiGenerations.id, created.value.generationId));
    const llm = fakeLlm();
    await runGeneration(h.db, llm, created.value.generationId);
    expect(llm.calls).toBe(0);
  });
});

describe("graded quizzes and course certificates", () => {
  it("validates quiz questions", () => {
    const tidy = questionInputSchema.safeParse({ prompt: "Which is right?", kind: "single", options: ["A", "", "C", ""], correct: [2], explanation: "" });
    expect(tidy.success && tidy.data).toMatchObject({ options: ["A", "C"], correct: [1] });
    const tf = questionInputSchema.safeParse({ prompt: "Cells hold data?", kind: "truefalse", options: [], correct: [0] });
    expect(tf.success && tf.data).toMatchObject({ options: ["True", "False"], correct: [0] });
    expect(questionInputSchema.safeParse({ prompt: "Which is right?", kind: "single", options: ["A", "B"], correct: [0, 1] }).success).toBe(false);
    expect(questionInputSchema.safeParse({ prompt: "Which is right?", kind: "single", options: ["A", "B"], correct: [] }).success).toBe(false);
    expect(questionInputSchema.safeParse({ prompt: "Which is right?", kind: "multiple", options: ["A", "a"], correct: [0] }).success).toBe(false);
    expect(questionInputSchema.safeParse({ prompt: "Which are right?", kind: "multiple", options: ["A", "B", "C"], correct: [0, 2] }).success).toBe(true);

    // Shuffling moves the options but keeps the same answers correct.
    const q = { prompt: "Which are right?", kind: "multiple" as const, options: ["A", "B", "C", "D"], correct: [0, 2], explanation: "" };
    for (const seed of [0.1, 0.5, 0.9]) {
      const shuffled = shuffleOptions(q, () => seed);
      expect([...shuffled.options].sort()).toEqual(["A", "B", "C", "D"]);
      expect(shuffled.correct.map((i) => shuffled.options[i]).sort()).toEqual(["A", "C"]);
    }
  });

  it("issues one course certificate after every lesson and every visible module quiz is passed", async () => {
    const p = await saveProgram(h.db, { title: "Certified Course", slug: "certified-course", level: "beginner", status: "published", enrollmentMode: "invite" });
    if (!p.ok) throw new Error(p.error);
    const m1 = await addModule(h.db, p.value.id, { title: "First module" });
    const m2 = await addModule(h.db, p.value.id, { title: "Hidden module" });
    if (!m1.ok || !m2.ok) throw new Error("module");
    const ch = await addChapter(h.db, m1.value.id, "Basics");
    const ch2 = await addChapter(h.db, m2.value.id, "Extra");
    if (!ch.ok || !ch2.ok) throw new Error("chapter");
    const l1 = await addLesson(h.db, ch.value.id, { title: "One" });
    const l2 = await addLesson(h.db, ch.value.id, { title: "Two" });
    const hiddenLesson = await addLesson(h.db, ch2.value.id, { title: "Hidden" });
    if (!l1.ok || !l2.ok || !hiddenLesson.ok) throw new Error("lesson");
    // Hidden modules (and their quizzes) don't count towards the certificate.
    await h.db.update(courses).set({ published: false }).where(eq(courses.id, m2.value.id));
    await addQuestion(h.db, m2.value.id, { prompt: "Hidden question?", kind: "truefalse", options: [], correct: [0] });

    expect((await saveQuizSettings(h.db, m1.value.id, { title: "First module quiz", passMark: 50 })).ok).toBe(true);
    expect((await saveQuizSettings(h.db, m1.value.id, { title: "First module quiz", passMark: 0 })).ok).toBe(false);
    const q1 = await addQuestion(h.db, m1.value.id, { prompt: "Pick B please", kind: "single", options: ["A", "B", "C"], correct: [1] });
    const q2 = await addQuestion(h.db, m1.value.id, { prompt: "Pick A and C", kind: "multiple", options: ["A", "B", "C"], correct: [0, 2] });
    if (!q1.ok || !q2.ok) throw new Error("question");
    const quiz = await getModuleQuiz(h.db, m1.value.id);
    if (!quiz) throw new Error("quiz");
    expect(quiz.questions.map((q) => q.position)).toEqual([0, 1]);

    const reg = await registerUser(h.db, { name: "Cert Learner", email: "cert@example.test", password: "CertLearner2026" });
    if (!reg.ok) throw new Error(reg.error);
    const userId = reg.value.id;
    await enroll(h.db, { programId: p.value.id, userId, source: "admin" });

    await setLessonCompleted(h.db, userId, l1.value.id, true);
    await setLessonCompleted(h.db, userId, l2.value.id, true);
    let status = await getProgramCertificateStatus(h.db, userId, p.value.id);
    expect(status).toMatchObject({ lessonsTotal: 2, lessonsDone: 2, quizzesTotal: 1, quizzesPassed: 0, eligible: false, certificate: null });

    const fail = await submitAssessment(h.db, userId, quiz.id, { [q1.value.id]: [0] });
    expect(fail).toMatchObject({ score: 0, passed: false });
    expect((await getProgramCertificateStatus(h.db, userId, p.value.id)).certificate).toBeNull();

    const pass = await submitAssessment(h.db, userId, quiz.id, { [q1.value.id]: [1] });
    expect(pass).toMatchObject({ score: 50, passed: true });
    status = await getProgramCertificateStatus(h.db, userId, p.value.id);
    expect(status.certificate).toMatchObject({ score: 50 });
    expect(status.certificate?.serial).toMatch(/^NXS-\d{4}-[0-9A-F]{8}$/);

    // A better attempt later doesn't issue a second certificate.
    await submitAssessment(h.db, userId, quiz.id, { [q1.value.id]: [1], [q2.value.id]: [2, 0] });
    const certs = await listCertificates(h.db, userId);
    expect(certs).toHaveLength(1);
    expect(certs[0]).toMatchObject({ title: "Certified Course", serial: status.certificate?.serial });
    // Builder courses never get the Odoo-style per-module certificates.
    expect(await h.db.select().from(certificates).where(eq(certificates.userId, userId))).toHaveLength(0);
    expect(await h.db.select().from(questions).where(eq(questions.assessmentId, quiz.id))).toHaveLength(2);
  });

  it("certifies a course without quizzes once every lesson is done", async () => {
    const p = await saveProgram(h.db, { title: "Reading Course", slug: "reading-course", level: "beginner", status: "published", enrollmentMode: "invite" });
    if (!p.ok) throw new Error(p.error);
    const m = await addModule(h.db, p.value.id, { title: "Only module" });
    if (!m.ok) throw new Error("module");
    const ch = await addChapter(h.db, m.value.id, "Only chapter");
    if (!ch.ok) throw new Error("chapter");
    const l = await addLesson(h.db, ch.value.id, { title: "Only lesson" });
    if (!l.ok) throw new Error("lesson");
    const reg = await registerUser(h.db, { name: "Reader", email: "reader@example.test", password: "ReaderLearn2026" });
    if (!reg.ok) throw new Error(reg.error);
    await setLessonCompleted(h.db, reg.value.id, l.value.id, true);
    expect((await getProgramCertificateStatus(h.db, reg.value.id, p.value.id)).certificate).toMatchObject({ score: 100 });
  });
});

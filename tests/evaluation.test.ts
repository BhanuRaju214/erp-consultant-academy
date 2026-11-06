/**
 * Final video evaluation: rubric parsing (pure) and the full workflow against an in-memory
 * PostgreSQL (PGlite) with a fake AI provider — eligibility → recording → questions →
 * spoken answers → AI score → trainer approval → final certificate.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createDb, type DbHandle } from "@/lib/db/client";
import { seedAll } from "@/lib/seed";
import { certificates, courses, projectTasks, studentProjectTasks } from "@/lib/db/schema";
import { registerUser } from "@/lib/services/users";
import { LEARNING_QUESTION, QUESTION_COUNT, parseQuestions, parseReport } from "@/lib/evaluation/rubric";
import {
  attachMedia,
  decideEvaluation,
  getEligibility,
  getLatestEvaluation,
  getProgramCertificate,
  processPresentation,
  saveAnswer,
  startEvaluation,
  submitEvaluation,
  type EvaluationAi,
} from "@/lib/services/evaluation";

describe("evaluation rubric", () => {
  it("always asks the learning question first and fills missing AI questions", () => {
    const qs = parseQuestions('{"questions":["Why did you choose FIFO valuation for Northwind?"]}', ["Project A: Trading"]);
    expect(qs).toHaveLength(QUESTION_COUNT);
    expect(qs[0]).toBe(LEARNING_QUESTION);
    expect(qs[1]).toContain("FIFO");
    expect(parseQuestions("not json", [])).toHaveLength(QUESTION_COUNT);
  });

  it("clamps scores, scores missing criteria as 0 and derives the recommendation", () => {
    const r = parseReport(
      JSON.stringify({ criteria: [{ key: "business", score: 35, comment: "x" }, { key: "solution", score: 18 }, { key: "delivery", score: -4 }], summary: "ok" }),
    )!;
    expect(r.criteria.map((c) => c.score)).toEqual([20, 18, 0, 0, 0]);
    expect(r.total).toBe(38);
    expect(r.recommendation).toBe("revise");
    expect(parseReport("```json\n{}\n```")).toBeNull();
  });
});

describe("final evaluation workflow", () => {
  let h: DbHandle;
  let userId = "";
  let trainerId = "";
  const fakeAi = (durationSec: number): EvaluationAi => ({
    transcribe: async (p) => ({ text: p.includes("answer") ? "I would check the valuation layers." : "In Project A we implemented Odoo for a trading company...", durationSec }),
    chatJson: async (system) =>
      system.includes("Write exactly")
        ? JSON.stringify({ questions: ["Q2?? why this design", "Q3?? how did you verify the import", "Q4?? which UAT defect mattered", "Q5?? how would you reconcile stock"] })
        : JSON.stringify({ criteria: ["business", "solution", "delivery", "communication", "reflection"].map((key) => ({ key, score: 16, comment: "good" })), strengths: ["clear"], improvements: ["depth"], summary: "Solid." }),
  });

  beforeAll(async () => {
    h = await createDb({ dataDir: "memory://", url: "" });
    await h.migrate();
    await seedAll(h.db, { skipUsers: true });
    const s = await registerUser(h.db, { name: "Eva Trainee", email: "eva@example.test", password: "Consultant2026" });
    const t = await registerUser(h.db, { name: "Tom Trainer", email: "tom@example.test", password: "Consultant2026" });
    if (!s.ok || !t.ok) throw new Error("setup failed");
    userId = s.value.id;
    trainerId = t.value.id;
  });

  afterAll(async () => {
    await h?.close();
  });

  it("is locked until every project and course certificate is complete", async () => {
    expect((await getEligibility(h.db, userId)).eligible).toBe(false);
    expect((await startEvaluation(h.db, userId)).ok).toBe(false);

    const allCourses = await h.db.select({ id: courses.id }).from(courses);
    await h.db.insert(certificates).values(allCourses.map((c, i) => ({ userId, courseId: c.id, score: 90, serial: `TEST-${i}` })));
    const tasks = await h.db.select({ id: projectTasks.id }).from(projectTasks);
    await h.db.insert(studentProjectTasks).values(tasks.map((t) => ({ userId, taskId: t.id, status: "done" as const })));
    const el = await getEligibility(h.db, userId);
    expect(el.eligible).toBe(true);
  });

  it("rejects a presentation shorter than 10 minutes, using the transcription length", async () => {
    const started = await startEvaluation(h.db, userId);
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    let ev = started.evaluation;
    expect((await processPresentation(h.db, ev, fakeAi(700), 700)).ok).toBe(false); // no slides yet
    await attachMedia(h.db, ev, "slides", "x/slides.pptx", "Northwind.pptx");
    await attachMedia(h.db, ev, "video", "x/video.webm");
    await attachMedia(h.db, ev, "audio", "x/audio.webm");
    ev = (await getLatestEvaluation(h.db, userId))!;
    // The client claims 11 minutes, but the transcription service measured 7.
    const short = await processPresentation(h.db, ev, fakeAi(420), 660);
    expect(short.ok).toBe(false);
    if (!short.ok) expect(short.error).toContain("7:00");
  });

  it("asks questions, records answers, scores with AI and waits for the trainer", async () => {
    const ev = (await getLatestEvaluation(h.db, userId))!;
    const res = await processPresentation(h.db, ev, fakeAi(645), 645);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.evaluation.status).toBe("questions");
    expect(res.evaluation.durationSec).toBe(645);
    expect(res.evaluation.questions[0]!.question).toBe(LEARNING_QUESTION);
    expect(res.evaluation.questions).toHaveLength(QUESTION_COUNT);

    expect((await submitEvaluation(h.db, res.evaluation, fakeAi(0))).ok).toBe(false); // unanswered
    for (let i = 0; i < QUESTION_COUNT; i++) {
      const current = (await getLatestEvaluation(h.db, userId))!;
      await saveAnswer(h.db, current, i, `x/answer-${i}.webm`, fakeAi(30));
    }
    const answered = (await getLatestEvaluation(h.db, userId))!;
    expect(answered.questions.every((q) => q.answerTranscript?.includes("valuation"))).toBe(true);

    const submitted = await submitEvaluation(h.db, answered, fakeAi(0));
    expect(submitted.ok).toBe(true);
    if (!submitted.ok) return;
    expect(submitted.evaluation.status).toBe("awaiting_trainer");
    expect(submitted.evaluation.aiScore).toBe(80);
    expect(await getProgramCertificate(h.db, userId)).toBeNull();
  });

  it("issues the final certificate only on trainer approval", async () => {
    const ev = (await getLatestEvaluation(h.db, userId))!;
    const back = await decideEvaluation(h.db, { evaluationId: ev.id, trainerId, decision: "needs_revision", score: 60, note: "Show the data migration in more depth." });
    expect(back.ok && back.certificate).toBeNull();
    expect(await getProgramCertificate(h.db, userId)).toBeNull();

    // A new attempt goes through the whole flow again.
    const again = await startEvaluation(h.db, userId);
    expect(again.ok && again.evaluation.id).not.toBe(ev.id);
    if (!again.ok) return;
    for (const kind of ["slides", "video", "audio"] as const) await attachMedia(h.db, again.evaluation, kind, `y/${kind}.webm`, "deck.pptx");
    let cur = (await processPresentation(h.db, (await getLatestEvaluation(h.db, userId))!, fakeAi(900), 900)) as { ok: true; evaluation: typeof ev };
    for (let i = 0; i < QUESTION_COUNT; i++) await saveAnswer(h.db, (await getLatestEvaluation(h.db, userId))!, i, `y/answer-${i}.webm`, fakeAi(30));
    cur = (await submitEvaluation(h.db, (await getLatestEvaluation(h.db, userId))!, fakeAi(0))) as typeof cur;
    const approved = await decideEvaluation(h.db, { evaluationId: cur.evaluation.id, trainerId, decision: "approved", score: 82, note: "Well presented." });
    expect(approved.ok).toBe(true);
    const cert = await getProgramCertificate(h.db, userId);
    expect(cert?.score).toBe(82);
    expect(cert?.serial).toMatch(/^ECA-FINAL-\d{4}-[0-9A-F]{8}$/);

    expect((await decideEvaluation(h.db, { evaluationId: cur.evaluation.id, trainerId, decision: "approved", score: 90, note: "again" })).ok).toBe(false);
    const latest = await getLatestEvaluation(h.db, userId);
    expect(latest?.status).toBe("approved");
    expect((await startEvaluation(h.db, userId)).ok && (await getLatestEvaluation(h.db, userId))?.id).toBe(latest?.id);
  });

  it("does not let recordings change after the presentation was processed", async () => {
    const ev = (await getLatestEvaluation(h.db, userId))!;
    await expect(attachMedia(h.db, ev, "video", "z/video.webm")).rejects.toThrow();
    expect(ev.videoPath).not.toBe("z/video.webm");
    const [row] = await h.db.select().from(studentProjectTasks).where(eq(studentProjectTasks.userId, userId)).limit(1);
    expect(row?.status).toBe("done");
  });
});

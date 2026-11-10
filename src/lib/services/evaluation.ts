import { randomBytes } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { getFlagshipCertificateStatus, maybeIssueFlagshipCertificate } from "./learning";
import {
  evaluationCertificates,
  projectEvaluations,
  users,
  type EvaluationQuestion,
  type EvaluationReport,
} from "@/lib/db/schema";
import {
  MIN_PRESENTATION_SECONDS,
  buildQuestionPrompt,
  buildScoringPrompt,
  fallbackQuestions,
  formatDuration,
  offlineReport,
  parseQuestions,
  parseReport,
} from "@/lib/evaluation/rubric";
import { listProjectsWithProgress } from "./practice";

/**
 * Final video evaluation → program certificate.
 *
 * recording ──(slides + ≥10 min recording, transcribed)──▶ questions
 * questions ──(every question answered by voice, AI scores)──▶ awaiting_trainer
 * awaiting_trainer ──trainer──▶ approved (certificate issued) | needs_revision (new attempt allowed)
 */

export type Evaluation = typeof projectEvaluations.$inferSelect;
export type MediaKind = "slides" | "video" | "camera" | "audio";

/** The AI calls, injected so the workflow can be tested without a provider. */
export interface EvaluationAi {
  transcribe(relPath: string): Promise<{ text: string; durationSec: number | null } | null>;
  chatJson(system: string, user: string): Promise<string | null>;
}

/**
 * The final evaluation is the step after the course certificate: it unlocks once the
 * learner holds the Odoo course certificate (every module certified) and has finished
 * every real-time project.
 */
export async function getEligibility(db: Db, userId: string) {
  let status = await getFlagshipCertificateStatus(db, userId);
  // Learners who finished every module before the course certificate existed get it now.
  if (status?.eligible && !status.certificate) {
    await maybeIssueFlagshipCertificate(db, userId);
    status = await getFlagshipCertificateStatus(db, userId);
  }
  const projects = (await listProjectsWithProgress(db, userId)).map((p) => ({
    code: p.code,
    slug: p.slug,
    title: p.title,
    done: p.doneTasks,
    total: p.totalTasks,
    complete: p.totalTasks > 0 && p.doneTasks >= p.totalTasks,
  }));
  const courseCertificate = status?.certificate ?? null;
  return {
    courseCertificate,
    modulesCertified: status?.modulesCertified ?? 0,
    modulesTotal: status?.modulesTotal ?? 0,
    projects,
    eligible: Boolean(courseCertificate) && projects.length > 0 && projects.every((p) => p.complete),
  };
}

export async function getLatestEvaluation(db: Db, userId: string): Promise<Evaluation | null> {
  return (await db.query.projectEvaluations.findFirst({ where: eq(projectEvaluations.userId, userId), orderBy: [desc(projectEvaluations.createdAt)] })) ?? null;
}

export async function getProgramCertificate(db: Db, userId: string) {
  return (await db.query.evaluationCertificates.findFirst({ where: eq(evaluationCertificates.userId, userId) })) ?? null;
}

/** Returns the open attempt, or starts a new one when the trainee is eligible and has no open attempt. */
export async function startEvaluation(db: Db, userId: string): Promise<{ ok: true; evaluation: Evaluation } | { ok: false; error: string }> {
  const latest = await getLatestEvaluation(db, userId);
  if (latest && latest.status !== "needs_revision") return { ok: true, evaluation: latest };
  if (!(await getEligibility(db, userId)).eligible) return { ok: false, error: "Complete every course certificate and every real-time project first." };
  const [evaluation] = await db.insert(projectEvaluations).values({ userId }).returning();
  return { ok: true, evaluation: evaluation! };
}

/** Stores an uploaded file on an attempt that is still being recorded. Returns the replaced file (to delete), if any. */
export async function attachMedia(db: Db, ev: Evaluation, kind: MediaKind, relPath: string, fileName?: string): Promise<string | null> {
  if (ev.status !== "recording") throw new Error("This attempt is no longer accepting recordings.");
  const column = { slides: "slidesPath", video: "videoPath", camera: "cameraPath", audio: "audioPath" } as const;
  const previous = ev[column[kind]];
  await db
    .update(projectEvaluations)
    .set({ [column[kind]]: relPath, ...(kind === "slides" ? { slidesName: fileName ?? null } : {}) })
    .where(eq(projectEvaluations.id, ev.id));
  return previous;
}

/**
 * Transcribes the presentation, verifies the minimum length and asks the follow-up questions.
 * `clientDurationSec` is only trusted when the transcription service cannot report the length;
 * the trainer then verifies it from the recording.
 */
export async function processPresentation(db: Db, ev: Evaluation, ai: EvaluationAi, clientDurationSec: number) {
  if (ev.status !== "recording") return { ok: false as const, error: "The presentation was already processed." };
  if (!ev.slidesPath) return { ok: false as const, error: "Upload your slides (PPTX or PDF) first." };
  if (!ev.videoPath || !ev.audioPath) return { ok: false as const, error: "Record your presentation first." };

  const t = await ai.transcribe(ev.audioPath);
  const durationSec = Math.round(t?.durationSec ?? clientDurationSec);
  if (durationSec < MIN_PRESENTATION_SECONDS) {
    return { ok: false as const, error: `Your recording is ${formatDuration(durationSec)}. The presentation must be at least ${formatDuration(MIN_PRESENTATION_SECONDS)} long; please record it again.` };
  }
  const titles = (await getEligibility(db, ev.userId)).projects.map((p) => `Project ${p.code}: ${p.title}`);
  let questions: string[];
  if (t?.text) {
    const prompt = buildQuestionPrompt(t.text, titles);
    questions = parseQuestions((await ai.chatJson(prompt.system, prompt.user)) ?? "", titles);
  } else {
    questions = fallbackQuestions(titles);
  }
  const [updated] = await db
    .update(projectEvaluations)
    .set({
      status: "questions",
      durationSec,
      transcript: t?.text ?? null,
      questions: questions.map((question) => ({ question })),
    })
    .where(and(eq(projectEvaluations.id, ev.id), eq(projectEvaluations.status, "recording")))
    .returning();
  return updated ? { ok: true as const, evaluation: updated } : { ok: false as const, error: "The presentation was already processed." };
}

/** Saves the spoken answer to one question and its transcript. Returns the replaced answer file, if any. */
export async function saveAnswer(db: Db, ev: Evaluation, index: number, relPath: string, ai: EvaluationAi): Promise<{ previous: string | null; transcript: string }> {
  if (ev.status !== "questions") throw new Error("Questions are not open for this attempt.");
  const qs = [...ev.questions];
  if (!qs[index]) throw new Error("Unknown question.");
  const transcript = (await ai.transcribe(relPath))?.text ?? "";
  const previous = qs[index].answerPath ?? null;
  qs[index] = { ...qs[index], answerPath: relPath, answerTranscript: transcript || "(transcription unavailable — the trainer will listen to the recording)" };
  await db.update(projectEvaluations).set({ questions: qs }).where(eq(projectEvaluations.id, ev.id));
  return { previous, transcript };
}

/** Scores the attempt with the AI examiner and hands it to the trainer. */
export async function submitEvaluation(db: Db, ev: Evaluation, ai: EvaluationAi) {
  if (ev.status !== "questions") return { ok: false as const, error: "This attempt cannot be submitted now." };
  if (ev.questions.some((q: EvaluationQuestion) => !q.answerPath)) return { ok: false as const, error: "Answer every question before submitting." };
  const titles = (await getEligibility(db, ev.userId)).projects.map((p) => `Project ${p.code}: ${p.title}`);
  let report: EvaluationReport | null = null;
  if (ev.transcript) {
    const prompt = buildScoringPrompt({
      transcript: ev.transcript,
      durationSec: ev.durationSec ?? 0,
      slidesName: ev.slidesName,
      projectTitles: titles,
      answers: ev.questions.map((q) => ({ question: q.question, answer: q.answerTranscript ?? "" })),
    });
    const raw = await ai.chatJson(prompt.system, prompt.user);
    report = raw ? parseReport(raw) : null;
    if (!report) report = offlineReport("the AI service did not return a valid score");
  } else {
    report = offlineReport("speech-to-text is not configured");
  }
  const [updated] = await db
    .update(projectEvaluations)
    .set({ status: "awaiting_trainer", report, aiScore: report.provider === "openai" ? report.total : null, submittedAt: new Date() })
    .where(and(eq(projectEvaluations.id, ev.id), eq(projectEvaluations.status, "questions")))
    .returning();
  return updated ? { ok: true as const, evaluation: updated } : { ok: false as const, error: "This attempt was already submitted." };
}

/** Trainer decision. Approval issues the program certificate with the trainer-confirmed score. */
export async function decideEvaluation(
  db: Db,
  input: { evaluationId: string; trainerId: string; decision: "approved" | "needs_revision"; score: number; note: string },
) {
  return db.transaction(async (tx) => {
    const [ev] = await tx
      .update(projectEvaluations)
      .set({ status: input.decision, trainerId: input.trainerId, trainerNote: input.note, decidedAt: new Date() })
      .where(and(eq(projectEvaluations.id, input.evaluationId), eq(projectEvaluations.status, "awaiting_trainer")))
      .returning();
    if (!ev) return { ok: false as const, error: "This evaluation is not awaiting a decision." };
    if (input.decision !== "approved") return { ok: true as const, certificate: null };
    // Same ID format as the other certificates, so it is verifiable at /verify/<serial>.
    const serial = `NXC-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
    const [certificate] = await tx
      .insert(evaluationCertificates)
      .values({ userId: ev.userId, evaluationId: ev.id, score: input.score, serial })
      .onConflictDoNothing()
      .returning();
    return { ok: true as const, certificate: certificate ?? null };
  });
}

export async function listEvaluations(db: Db, statuses: Evaluation["status"][]) {
  return db
    .select({
      id: projectEvaluations.id,
      status: projectEvaluations.status,
      aiScore: projectEvaluations.aiScore,
      durationSec: projectEvaluations.durationSec,
      submittedAt: projectEvaluations.submittedAt,
      decidedAt: projectEvaluations.decidedAt,
      student: users.name,
      studentId: users.id,
    })
    .from(projectEvaluations)
    .innerJoin(users, eq(users.id, projectEvaluations.userId))
    .where(inArray(projectEvaluations.status, statuses))
    .orderBy(desc(projectEvaluations.submittedAt))
    .limit(100);
}

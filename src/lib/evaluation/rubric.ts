import { z } from "zod";
import type { EvaluationReport } from "@/lib/db/schema";

/**
 * Final video evaluation: rules, rubric and the prompts/parsers for the AI examiner.
 * Pure module (no I/O) so it can be unit-tested; the API calls live in ./ai.ts.
 */

export const MIN_PRESENTATION_SECONDS = 600;
export const MAX_PRESENTATION_SECONDS = 30 * 60;
export const MAX_ANSWER_SECONDS = 180;
export const QUESTION_COUNT = 5;
export const EVALUATION_PASS_MARK = 70;

/** Always asked first, whatever the presentation covered. */
export const LEARNING_QUESTION = "Tell us what you have learnt in this course, and which skill you are most confident using on a real client project.";

export const RUBRIC = [
  { key: "business", label: "Business understanding", guide: "Explains the client's industry, problems, requirements and the business processes (O2C, P2P, inventory, accounting) correctly." },
  { key: "solution", label: "Solution design & Odoo configuration", guide: "Explains which Odoo apps and settings were used and why; separates standard, configuration and customization." },
  { key: "delivery", label: "Implementation & data", guide: "Covers phases, data migration, testing/UAT and go-live with concrete examples from the projects." },
  { key: "communication", label: "Presentation & communication", guide: "Clear structure, slides support the talk, client-friendly language, stays within time, uses the full 10 minutes well." },
  { key: "reflection", label: "Answers & learning reflection", guide: "Answers the follow-up questions accurately and specifically; reflects honestly on what was learnt." },
] as const;

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Questions used when the AI service is not configured or fails. */
export function fallbackQuestions(projectTitles: string[]): string[] {
  return [
    LEARNING_QUESTION,
    `In ${projectTitles[0] ?? "your first project"}, which requirement was standard Odoo, which needed configuration, and which would need custom development?`,
    "Walk us through how you migrated master data and opening balances, and how you checked that the import was correct.",
    "Which test or UAT scenario found the most important problem, and how did you resolve it?",
    "If the client's finance manager asked why the stock valuation does not match the general ledger, how would you investigate?",
  ].slice(0, QUESTION_COUNT);
}

export function buildQuestionPrompt(transcript: string, projectTitles: string[]): { system: string; user: string } {
  return {
    system: [
      "You are a senior Odoo implementation consultant examining a trainee consultant's final presentation of their training projects.",
      `Write exactly ${QUESTION_COUNT - 1} follow-up questions, one at a time as a panel would ask them, that test whether the trainee really did and understood the work.`,
      "Base every question on something the trainee said (or conspicuously did not say) in the transcript. Prefer 'why' and 'how did you verify' questions over definitions.",
      "Each question must be answerable aloud in under 3 minutes. Do not repeat a question about what they learnt in the course; that one is asked separately.",
      'Reply with JSON only: {"questions": ["...", "..."]}',
    ].join("\n"),
    user: `Projects completed: ${projectTitles.join("; ")}\n\nPresentation transcript:\n${transcript.slice(0, 40_000)}`,
  };
}

export function parseQuestions(raw: string, projectTitles: string[]): string[] {
  const parsed = z.object({ questions: z.array(z.string().trim().min(10).max(500)).min(1) }).safeParse(safeJson(raw));
  const ai = parsed.success ? parsed.data.questions.slice(0, QUESTION_COUNT - 1) : [];
  const fill = fallbackQuestions(projectTitles).slice(1);
  while (ai.length < QUESTION_COUNT - 1) ai.push(fill[ai.length]!);
  return [LEARNING_QUESTION, ...ai];
}

export function buildScoringPrompt(input: {
  transcript: string;
  durationSec: number;
  slidesName: string | null;
  projectTitles: string[];
  answers: { question: string; answer: string }[];
}): { system: string; user: string } {
  const rubric = RUBRIC.map((r) => `- ${r.key} (${r.label}, 0-20): ${r.guide}`).join("\n");
  return {
    system: [
      "You are the examiner for the final certification of an ERP (Odoo) consultant training program.",
      "Score the trainee's recorded project presentation and spoken answers against this rubric. Each criterion is scored 0-20 (total 100):",
      rubric,
      `Pass mark is ${EVALUATION_PASS_MARK}. Be fair but strict: vague, generic or memorised statements without project specifics score low. Penalise factual errors about Odoo.`,
      "Comments must quote or refer to what the trainee actually said. A trainer will review your report before any certificate is issued.",
      'Reply with JSON only: {"criteria":[{"key":"business","score":0,"comment":""}, ...all 5 keys], "strengths":["..."], "improvements":["..."], "summary":"2-3 sentences"}',
    ].join("\n"),
    user: [
      `Projects completed: ${input.projectTitles.join("; ")}`,
      `Presentation length: ${formatDuration(input.durationSec)} (minimum ${formatDuration(MIN_PRESENTATION_SECONDS)}). Slides file: ${input.slidesName ?? "none"}.`,
      "",
      "PRESENTATION TRANSCRIPT:",
      input.transcript.slice(0, 60_000),
      "",
      "FOLLOW-UP QUESTIONS AND SPOKEN ANSWERS:",
      ...input.answers.map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer || "(no answer)"}`),
    ].join("\n"),
  };
}

const reportSchema = z.object({
  criteria: z.array(z.object({ key: z.string(), score: z.coerce.number(), comment: z.string().default("") })),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  summary: z.string().default(""),
});

/** Validates the model's JSON; missing criteria score 0 so a malformed reply can never inflate the total. */
export function parseReport(raw: string): EvaluationReport | null {
  const parsed = reportSchema.safeParse(safeJson(raw));
  if (!parsed.success) return null;
  const criteria = RUBRIC.map((r) => {
    const c = parsed.data.criteria.find((x) => x.key === r.key);
    const score = c && Number.isFinite(c.score) ? Math.min(20, Math.max(0, Math.round(c.score))) : 0;
    return { key: r.key, label: r.label, score, comment: c?.comment ?? "Not scored." };
  });
  const total = criteria.reduce((s, c) => s + c.score, 0);
  return {
    criteria,
    total,
    strengths: parsed.data.strengths.slice(0, 6),
    improvements: parsed.data.improvements.slice(0, 6),
    recommendation: total >= EVALUATION_PASS_MARK ? "pass" : "revise",
    summary: parsed.data.summary,
    provider: "openai",
  };
}

/** Placeholder report when no AI service is available: the trainer scores manually. */
export function offlineReport(reason: string): EvaluationReport {
  return {
    criteria: RUBRIC.map((r) => ({ key: r.key, label: r.label, score: 0, comment: "Not scored by AI." })),
    total: 0,
    strengths: [],
    improvements: [],
    recommendation: "revise",
    summary: `AI scoring was not available (${reason}). The trainer evaluates the recording manually against the rubric.`,
    provider: "offline",
  };
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    return null;
  }
}

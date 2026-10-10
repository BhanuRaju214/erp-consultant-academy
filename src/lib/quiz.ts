/** Pure quiz scoring so it can be unit-tested and reused by server actions. */

export interface GradableQuestion {
  id: string;
  kind: "single" | "multiple" | "truefalse";
  correct: number[];
}

export interface GradedAnswer {
  questionId: string;
  answer: number[];
  correct: boolean;
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

/**
 * All-or-nothing per question: a multiple-choice question is correct only when the
 * selected options exactly match the correct set. Unanswered questions score zero.
 */
export function gradeQuiz(
  questions: GradableQuestion[],
  answers: Record<string, number[]>,
  passMark: number,
): { score: number; passed: boolean; graded: GradedAnswer[] } {
  const graded = questions.map((q) => {
    const raw = answers[q.id] ?? [];
    const answer = q.kind === "multiple" ? Array.from(new Set(raw)).sort((a, b) => a - b) : raw.slice(0, 1);
    return { questionId: q.id, answer, correct: answer.length > 0 && sameSet(answer, q.correct) };
  });
  const score = questions.length === 0 ? 0 : Math.round((graded.filter((g) => g.correct).length / questions.length) * 100);
  return { score, passed: score >= passMark, graded };
}

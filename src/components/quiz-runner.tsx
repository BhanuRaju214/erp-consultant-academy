"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { submitQuiz } from "@/app/actions/learning";
import { Badge, Callout, Card, buttonClass, cn } from "./ui";

export interface QuizQuestion {
  id: string;
  prompt: string;
  kind: "single" | "multiple" | "truefalse";
  options: string[];
}

type Review = { questionId: string; isCorrect: boolean; correct: number[]; explanation: string };

export function QuizRunner({ assessmentId, passMark, questions, backHref }: { assessmentId: string; passMark: number; questions: QuizQuestion[]; backHref: string }) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean; review: Review[]; certificateSerial: string | null } | null>(null);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const answered = questions.filter((q) => (answers[q.id] ?? []).length > 0).length;
  const reviewFor = (id: string) => result?.review.find((r) => r.questionId === id);

  const choose = (q: QuizQuestion, idx: number) => {
    if (result) return;
    setAnswers((prev) => {
      const cur = prev[q.id] ?? [];
      if (q.kind === "multiple") return { ...prev, [q.id]: cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx] };
      return { ...prev, [q.id]: [idx] };
    });
  };

  const submit = () => {
    setError(undefined);
    start(async () => {
      const res = await submitQuiz(assessmentId, answers);
      if (!res.ok) setError(res.error);
      else {
        setResult(res);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  return (
    <div className="space-y-5">
      {result && (
        <Callout tone={result.passed ? "success" : "warning"} title={result.passed ? `Passed — ${result.score}%` : `Not passed yet — ${result.score}% (pass mark ${passMark}%)`}>
          {result.passed
            ? "Review the explanations below to lock in the concepts."
            : "Read the explanations, revisit the related lessons, and retake the assessment when ready."}
          {result.certificateSerial && (
            <div className="mt-2">
              🎓 Course certificate issued:{" "}
              <Link href={`/certificates/${result.certificateSerial}`} className="font-medium underline">
                {result.certificateSerial}
              </Link>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className={buttonClass("secondary")}
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
            >
              Retake
            </button>
            <Link href={backHref} className={buttonClass("ghost")}>
              Back
            </Link>
          </div>
        </Callout>
      )}

      {questions.map((q, qi) => {
        const r = reviewFor(q.id);
        const sel = answers[q.id] ?? [];
        return (
          <Card key={q.id} as="section" className={cn(r && (r.isCorrect ? "border-success/50" : "border-danger/50"))}>
            <fieldset>
              <legend className="flex w-full items-start gap-2 text-sm font-medium text-fg">
                <span className="text-muted">{qi + 1}.</span>
                <span className="flex-1">{q.prompt}</span>
                {q.kind === "multiple" && <Badge tone="info">Select all that apply</Badge>}
              </legend>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const isSel = sel.includes(oi);
                  const isKey = r?.correct.includes(oi);
                  return (
                    <label
                      key={oi}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm",
                        r
                          ? isKey
                            ? "border-success/50 bg-success-soft"
                            : isSel
                              ? "border-danger/50 bg-danger-soft"
                              : "border-border"
                          : isSel
                            ? "border-primary bg-primary-soft"
                            : "border-border hover:bg-surface-2",
                      )}
                    >
                      <input
                        type={q.kind === "multiple" ? "checkbox" : "radio"}
                        name={q.id}
                        checked={isSel}
                        disabled={Boolean(r)}
                        onChange={() => choose(q, oi)}
                        className="mt-0.5 accent-[var(--primary)]"
                      />
                      <span className="text-fg">{opt}</span>
                    </label>
                  );
                })}
              </div>
              {r && (
                <div className="mt-3 flex gap-2 text-sm">
                  {r.isCorrect ? <CircleCheck className="h-4 w-4 shrink-0 text-success" /> : <TriangleAlert className="h-4 w-4 shrink-0 text-danger" />}
                  <p className="text-muted">
                    <span className="font-medium text-fg">{r.isCorrect ? "Correct. " : "Incorrect. "}</span>
                    {r.explanation}
                  </p>
                </div>
              )}
            </fieldset>
          </Card>
        );
      })}

      {!result && (
        <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 shadow-lg">
          <span className="text-sm text-muted">
            {answered} of {questions.length} answered
          </span>
          {error && <span className="text-sm text-danger">{error}</span>}
          <button type="button" onClick={submit} disabled={pending || answered === 0} className={buttonClass("primary")}>
            {pending ? "Scoring…" : answered < questions.length ? "Submit (unanswered count as wrong)" : "Submit answers"}
          </button>
        </div>
      )}
    </div>
  );
}

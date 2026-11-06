import type { EvaluationReport } from "@/lib/db/schema";
import { EVALUATION_PASS_MARK } from "@/lib/evaluation/rubric";
import { Badge, ProgressBar } from "./ui";

/** The AI examiner's rubric report. Shown to the trainee and, with the recording, to the trainer. */
export function EvaluationReportView({ report }: { report: EvaluationReport }) {
  if (report.provider === "offline") {
    return <p className="text-sm text-muted">{report.summary}</p>;
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl font-semibold text-fg">{report.total}/100</span>
        <Badge tone={report.total >= EVALUATION_PASS_MARK ? "success" : "warning"}>
          AI recommendation: {report.recommendation === "pass" ? "pass" : "revise"} (pass mark {EVALUATION_PASS_MARK})
        </Badge>
      </div>
      {report.summary && <p className="text-sm text-muted">{report.summary}</p>}
      <ul className="space-y-3">
        {report.criteria.map((c) => (
          <li key={c.key}>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-fg">{c.label}</span>
              <span className="text-muted">{c.score}/20</span>
            </div>
            <ProgressBar value={(c.score / 20) * 100} label={`${c.label} score`} className="mt-1" />
            <p className="mt-1 text-xs text-muted">{c.comment}</p>
          </li>
        ))}
      </ul>
      <div className="grid gap-4 sm:grid-cols-2">
        {report.strengths.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-success">Strengths</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted">{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
        {report.improvements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-warning">To improve</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted">{report.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

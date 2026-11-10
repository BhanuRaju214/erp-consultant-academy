import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { evaluationCertificates, projectEvaluations, users } from "@/lib/db/schema";
import { MIN_PRESENTATION_SECONDS, formatDuration } from "@/lib/evaluation/rubric";
import { EvaluationReportView } from "@/components/evaluation-report";
import { EvaluationDecisionForm } from "@/components/evaluation-decision-form";
import { Badge, Callout, Card, CardTitle, PageHeader } from "@/components/ui";

export const metadata = { title: "Review Evaluation" };

export default async function ReviewEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("trainer:review");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await getDb();
  const ev = await db.query.projectEvaluations.findFirst({ where: eq(projectEvaluations.id, id) });
  if (!ev) notFound();
  const student = await db.query.users.findFirst({ where: eq(users.id, ev.userId) });
  const cert = await db.query.evaluationCertificates.findFirst({ where: eq(evaluationCertificates.evaluationId, ev.id) });
  const media = (kind: string, q?: number) => `/api/evaluation/${ev.id}/media?kind=${kind}${q === undefined ? "" : `&q=${q}`}`;
  const short = (ev.durationSec ?? 0) < MIN_PRESENTATION_SECONDS;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Final evaluations"
        title={`${student?.name ?? "Trainee"} — project presentation`}
        description={`Length ${formatDuration(ev.durationSec ?? 0)} · submitted ${ev.submittedAt?.toLocaleString() ?? "not yet"}`}
        actions={<Link href="/trainer/evaluations" className="text-sm font-medium text-primary hover:underline">All evaluations</Link>}
      />
      {short && ev.durationSec !== null && <Callout tone="warning">The recording is shorter than the {formatDuration(MIN_PRESENTATION_SECONDS)} minimum.</Callout>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card>
            <CardTitle>Recording</CardTitle>
            {ev.videoPath ? (
              <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem]">
                <video controls preload="metadata" src={media("video")} className="aspect-video w-full rounded-lg bg-black" />
                {ev.cameraPath && <video controls preload="metadata" src={media("camera")} className="aspect-[4/3] w-full rounded-lg bg-black" />}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">Not recorded yet.</p>
            )}
            {ev.slidesPath && (
              <p className="mt-3 text-sm">
                Slides: <a href={media("slides")} className="font-medium text-primary hover:underline">{ev.slidesName ?? "download"}</a>
              </p>
            )}
          </Card>

          {ev.transcript && (
            <Card>
              <CardTitle>Transcript</CardTitle>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-primary">Show the full transcript ({ev.transcript.split(/\s+/).length} words)</summary>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{ev.transcript}</p>
              </details>
            </Card>
          )}

          <Card>
            <CardTitle>Examiner questions and answers</CardTitle>
            <ol className="mt-3 space-y-4">
              {ev.questions.map((q, i) => (
                <li key={i}>
                  <p className="font-medium text-fg">Q{i + 1}. {q.question}</p>
                  {q.answerPath ? (
                    <>
                      <audio controls preload="none" src={media("answer", i)} className="mt-2 w-full" />
                      <p className="mt-1 text-sm text-muted">“{q.answerTranscript}”</p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Not answered yet.</p>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle>AI examiner report</CardTitle>
            <div className="mt-3">{ev.report ? <EvaluationReportView report={ev.report} /> : <p className="text-sm text-muted">Not scored yet.</p>}</div>
          </Card>
          <Card>
            <CardTitle>Your decision</CardTitle>
            <div className="mt-3">
              {ev.status === "awaiting_trainer" ? (
                <EvaluationDecisionForm evaluationId={ev.id} aiScore={ev.aiScore} />
              ) : ev.status === "approved" ? (
                <div className="space-y-2 text-sm">
                  <Badge tone="success">Approved</Badge>
                  <p className="text-muted">{ev.trainerNote}</p>
                  {cert && <Link href={`/certificates/${cert.serial}`} className="font-medium text-primary hover:underline">Certificate {cert.serial} ({cert.score}%)</Link>}
                </div>
              ) : ev.status === "needs_revision" ? (
                <div className="space-y-2 text-sm">
                  <Badge tone="danger">Sent back</Badge>
                  <p className="text-muted">{ev.trainerNote}</p>
                </div>
              ) : (
                <p className="text-sm text-muted">The trainee has not submitted this attempt yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

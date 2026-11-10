import Link from "next/link";
import { Award, CheckCircle2, Circle } from "lucide-react";
import { requireCourseUser } from "@/lib/auth/course-access";
import { getDb } from "@/lib/db";
import { MAX_PRESENTATION_SECONDS, MIN_PRESENTATION_SECONDS, QUESTION_COUNT, formatDuration } from "@/lib/evaluation/rubric";
import { getEligibility, getLatestEvaluation, getProgramCertificate } from "@/lib/services/evaluation";
import { EvaluationStudio, StartEvaluationButton, type StudioEvaluation } from "@/components/evaluation-studio";
import { EvaluationReportView } from "@/components/evaluation-report";
import { CONSULTANT_TITLE } from "@/lib/services/certificates";
import { ButtonLink, Callout, Card, CardTitle, PageHeader } from "@/components/ui";

export const metadata = { title: "Final Evaluation" };

export default async function EvaluationPage() {
  // Part of the paid Odoo course (free beginner modules don't include it).
  const user = await requireCourseUser();
  const db = await getDb();
  const [eligibility, ev, certificate] = await Promise.all([getEligibility(db, user.id), getLatestEvaluation(db, user.id), getProgramCertificate(db, user.id)]);

  const studio: StudioEvaluation | null = ev && {
    id: ev.id,
    status: ev.status,
    slidesName: ev.slidesName,
    hasRecording: Boolean(ev.videoPath),
    questions: ev.questions.map((q) => ({ question: q.question, answered: Boolean(q.answerPath), transcript: q.answerTranscript ?? null })),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assessments & Certifications"
        title="Final evaluation"
        description={`Present your real-time projects in a recorded talk of ${MIN_PRESENTATION_SECONDS / 60} to ${MAX_PRESENTATION_SECONDS / 60} minutes with your slides, answer ${QUESTION_COUNT} questions from the AI examiner, and a trainer confirms the result. Approval awards the ${CONSULTANT_TITLE} certificate.`}
      />

      {certificate && (
        <Callout tone="success" title="Congratulations — you are certified">
          You are a {CONSULTANT_TITLE}.{" "}
          <Link href={`/certificates/${certificate.serial}`} className="font-medium underline">
            View, download or share your certificate
          </Link>
        </Callout>
      )}

      <Card>
        <CardTitle>How it works</CardTitle>
        <ol className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Prepare", "Build a PowerPoint about your projects: client, requirements, Odoo solution, data migration, testing, go-live and lessons learnt."],
            ["Present", `Share your slides and talk for at least ${formatDuration(MIN_PRESENTATION_SECONDS)} (maximum ${formatDuration(MAX_PRESENTATION_SECONDS)}). The portal records your screen, voice and webcam.`],
            ["Answer", "The AI examiner listens and asks follow-up questions, starting with what you have learnt in the course. Answer each one aloud."],
            ["Certify", `The AI scores you against the rubric; a trainer reviews the recording and confirms. Approval makes you a ${CONSULTANT_TITLE}.`],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-lg bg-surface-2 p-3">
              <div className="font-semibold text-fg">{i + 1}. {t}</div>
              <p className="mt-1 text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </Card>

      {(!ev || ev.status === "needs_revision") && !certificate && (
        <Card>
          <CardTitle>Before you start</CardTitle>
          <div className="mt-3 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-fg">Real-time projects</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {eligibility.projects.map((p) => (
                  <li key={p.slug} className="flex items-center gap-2">
                    {p.complete ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <Circle className="h-4 w-4 shrink-0 text-muted" />}
                    <Link href={`/projects/${p.slug}`} className="hover:underline">Project {p.code}: {p.title}</Link>
                    <span className="text-xs text-muted">{p.done}/{p.total} tasks</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">Course certificate</h3>
              <p className="mt-2 flex items-center gap-2 text-sm">
                {eligibility.courseCertificate ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <Circle className="h-4 w-4 shrink-0 text-muted" />}
                {eligibility.courseCertificate ? (
                  <Link href={`/certificates/${eligibility.courseCertificate.serial}`} className="hover:underline">
                    Course certificate earned ({eligibility.courseCertificate.serial})
                  </Link>
                ) : (
                  <Link href="/assessments" className="hover:underline">
                    {eligibility.modulesCertified} of {eligibility.modulesTotal} module certificates earned
                  </Link>
                )}
              </p>
            </div>
          </div>
          {ev?.status === "needs_revision" && (
            <div className="mt-4">
              <Callout tone="warning" title="Your trainer asked you to present again">
                {ev.trainerNote}
              </Callout>
            </div>
          )}
          <div className="mt-4">
            {eligibility.eligible ? (
              <StartEvaluationButton label={ev ? "Start a new attempt" : "Start the final evaluation"} />
            ) : (
              <p className="text-sm text-muted">Earn the course certificate and complete every project task to unlock the final evaluation.</p>
            )}
          </div>
        </Card>
      )}

      {studio && (studio.status === "recording" || studio.status === "questions") && (
        <Card>
          <CardTitle>Your evaluation</CardTitle>
          <div className="mt-4">
            <EvaluationStudio evaluation={studio} />
          </div>
        </Card>
      )}

      {ev && (ev.status === "awaiting_trainer" || ev.status === "approved") && (
        <Card>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <CardTitle>{ev.status === "approved" ? "Evaluation approved" : "Submitted — awaiting trainer confirmation"}</CardTitle>
          </div>
          <p className="mt-1 text-sm text-muted">
            Presentation length {formatDuration(ev.durationSec ?? 0)} · submitted {ev.submittedAt?.toLocaleDateString()}
            {ev.trainerNote && ev.status === "approved" ? ` · Trainer: ${ev.trainerNote}` : ""}
          </p>
          {ev.report && (
            <div className="mt-4">
              <EvaluationReportView report={ev.report} />
            </div>
          )}
          {certificate && (
            <div className="mt-4">
              <ButtonLink href={`/certificates/${certificate.serial}`}>View certificate</ButtonLink>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

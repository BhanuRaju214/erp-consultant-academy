import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award, CircleCheck, ClipboardCheck, Clock, FileText, Layers, Lock, PlayCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatMinutes } from "@/lib/services/library";
import { maybeIssueProgramCertificate } from "@/lib/services/learning";
import { getProgramPlayer, lessonHref, quizHref } from "@/lib/services/player";
import { FLAGSHIP_PROGRAM, canAccessProgram, getProgramBySlug, hasFreeModules } from "@/lib/services/programs";
import { Callout, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const program = await getProgramBySlug(await getDb(), (await params).slug);
  return { title: program?.title ?? "Course" };
}

/** Course home for courses built in the course builder (the Odoo course uses /learn). */
export default async function ProgramHomePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ purchased?: string }> }) {
  const { slug } = await params;
  if (slug === FLAGSHIP_PROGRAM.slug) redirect(FLAGSHIP_PROGRAM.homePath);
  const user = await requireUser();
  const db = await getDb();
  const program = await getProgramBySlug(db, slug);
  if (!program) notFound();
  // Without the course, learners can still take its free beginner modules.
  const full = await canAccessProgram(db, user, slug);
  if (!full && !(program.status === "published" && (await hasFreeModules(db, program.id)))) redirect(`/catalog/${slug}?locked=1`);
  let p = await getProgramPlayer(db, program, user.id);
  // Requirements can change after the fact (e.g. a quiz removed): issue the certificate when due.
  if (p.certificate.eligible && !p.certificate.certificate && (await maybeIssueProgramCertificate(db, user.id, program.id))) {
    p = await getProgramPlayer(db, program, user.id);
  }
  const cert = p.certificate;
  const open = (moduleSlug: string) => full || p.modules.some((m) => m.slug === moduleSlug && m.free);
  const next = p.next && open(p.next.moduleSlug) ? p.next : full ? null : (p.order.find((l) => open(l.moduleSlug) && p.statusByLesson.get(l.id) !== "completed") ?? null);
  const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
  const { purchased } = await searchParams;

  return (
    <div className="space-y-8">
      {purchased && <Callout tone="success" title="You're enrolled">Thank you! Your invoice is in My orders. Start with the first lesson below.</Callout>}
      {program.status === "draft" && <Callout tone="warning">Draft preview: learners can&apos;t see this course until it is published.</Callout>}
      {!full && (
        <Callout tone="success" title="Free beginner modules">
          The beginner modules below are free. Complete them at your own pace, then{" "}
          <Link href={`/catalog/${slug}`} className="font-semibold underline">
            get the full course
          </Link>{" "}
          to unlock the remaining modules and the course certificate.
        </Callout>
      )}

      <section className="overflow-hidden rounded-lg bg-[#0b1b3f] p-7 text-white sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7fb0ff]">Course</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">{program.title}</h1>
        {program.subtitle && <p className="mt-2 max-w-2xl text-white/75">{program.subtitle}</p>}
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          <li className="flex items-center gap-1.5">
            <Layers className="h-4 w-4" aria-hidden /> {p.modules.length} modules
          </li>
          <li className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" aria-hidden /> {p.total} lessons
          </li>
          {p.minutes > 0 && (
            <li className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden /> {formatMinutes(p.minutes)}
            </li>
          )}
        </ul>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="max-w-sm flex-1">
            <div className="mb-1.5 flex justify-between text-xs text-white/70">
              <span>
                {p.done} of {p.total} lessons
              </span>
              <span className="font-semibold text-white">{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-[#7fb0ff]" style={{ width: `${pct}%` }} />
            </div>
          </div>
          {next && (
            <Link href={lessonHref(slug, next.moduleSlug, next.slug)} className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-bold text-[#0b1b3f] hover:bg-white/90">
              <PlayCircle className="h-4 w-4" aria-hidden /> {p.done ? "Continue" : "Start course"}: {next.title} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </section>

      {p.total > 0 && (
        <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 sm:flex-row sm:items-center">
          <Award className={`h-10 w-10 shrink-0 ${cert.certificate ? "text-gold" : "text-muted/60"}`} aria-hidden />
          {cert.certificate ? (
            <>
              <div className="flex-1">
                <h2 className="font-bold text-fg">You&apos;ve earned your certificate</h2>
                <p className="text-sm text-muted">
                  Final score {cert.certificate.score}% · Certificate ID {cert.certificate.serial}
                </p>
              </div>
              <Link href={`/certificates/${cert.certificate.serial}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90">
                View certificate <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </>
          ) : (
            <div className="flex-1">
              <h2 className="font-bold text-fg">Earn your course certificate</h2>
              <p className="text-sm text-muted">
                Complete every lesson{cert.quizzesTotal > 0 ? " and pass every module quiz" : ""}. Your certificate is issued automatically.
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <li className={cert.lessonsDone >= cert.lessonsTotal ? "text-success" : "text-fg"}>
                  Lessons: {cert.lessonsDone}/{cert.lessonsTotal}
                </li>
                {cert.quizzesTotal > 0 && (
                  <li className={cert.quizzesPassed >= cert.quizzesTotal ? "text-success" : "text-fg"}>
                    Quizzes passed: {cert.quizzesPassed}/{cert.quizzesTotal}
                  </li>
                )}
              </ul>
            </div>
          )}
        </section>
      )}

      {p.modules.length === 0 ? (
        <EmptyState title="No lessons yet">This course doesn&apos;t have any visible modules yet.</EmptyState>
      ) : (
        <ol className="space-y-5">
          {p.modules.map((m, mi) => {
            const lessons = m.chapters.flatMap((c) => c.lessons);
            const mDone = lessons.filter((l) => p.statusByLesson.get(l.id) === "completed").length;
            return (
              <li key={m.id} className="overflow-hidden rounded-lg border border-border bg-surface">
                <div className="flex flex-col gap-1 border-b border-border bg-surface-2/60 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Module {mi + 1}</span>
                    <h2 className="text-lg font-bold text-fg">{m.title}</h2>
                    {m.summary && <p className="mt-0.5 text-sm text-muted">{m.summary}</p>}
                  </div>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                    {m.free && !full && <span className="rounded bg-success-soft px-1.5 py-0.5 font-bold text-success">Free</span>}
                    {!open(m.slug) && <Lock className="h-3.5 w-3.5" aria-label="Locked" />}
                    {mDone}/{lessons.length} lessons
                  </span>
                </div>
                {!open(m.slug) ? (
                  <div className="flex flex-col gap-2 px-5 py-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      {lessons.length} lessons{m.quiz ? " and a module quiz" : ""}. Included in the full course.
                    </span>
                    <Link href={`/catalog/${slug}`} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
                      <Lock className="h-3.5 w-3.5" aria-hidden /> Unlock with the full course
                    </Link>
                  </div>
                ) : (
                  <>
                    {m.chapters.map((c) => (
                      <div key={c.id} className="px-5 py-3">
                        {m.chapters.length > 1 && <h3 className="pb-1 pt-1 text-xs font-semibold uppercase tracking-wider text-muted">{c.title}</h3>}
                        <ul>
                          {c.lessons.map((l) => {
                            const completed = p.statusByLesson.get(l.id) === "completed";
                            return (
                              <li key={l.id}>
                                <Link href={lessonHref(slug, m.slug, l.slug)} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-surface-2">
                                  {completed ? (
                                    <CircleCheck className="h-4 w-4 shrink-0 text-success" aria-label="Completed" />
                                  ) : (
                                    <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-border" aria-hidden />
                                  )}
                                  <span className="flex-1 text-fg">{l.title}</span>
                                  <span className="text-xs text-muted">{formatMinutes(l.durationMin)}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                    {m.quiz && (
                      <div className="border-t border-border px-5 py-3">
                        <Link href={quizHref(slug, m.slug)} className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-surface-2">
                          {m.quiz.passed ? (
                            <CircleCheck className="h-4 w-4 shrink-0 text-success" aria-label="Passed" />
                          ) : (
                            <ClipboardCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                          )}
                          <span className="flex-1 font-semibold text-fg">{m.quiz.title}</span>
                          <span className="text-xs text-muted">
                            {m.quiz.best !== null ? `Best ${m.quiz.best}% · ` : ""}
                            {m.quiz.questions} questions · pass {m.quiz.passMark}%
                          </span>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

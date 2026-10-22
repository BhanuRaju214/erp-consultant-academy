import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq, inArray, lt, sql } from "drizzle-orm";
import { ClipboardCheck, FileText, RefreshCw, Sparkles } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { aiConversations, assessments, courses, erpPlatforms, programs } from "@/lib/db/schema";
import { getProgramContent } from "@/lib/services/builder";
import { sectionRank } from "@/lib/services/library";
import { FLAGSHIP_PROGRAM } from "@/lib/services/programs";
import { purgeExpiredAiConversations, refreshCourseFromSource, syncNewContent, updateCourseAction } from "@/app/actions/admin";
import { AddChapterForm, AddLessonForm, AddModuleForm, ChapterTitleForm, ItemControls, ModuleForm } from "@/components/builder-forms";
import { Badge, Callout, Card, CardTitle, EmptyState, buttonClass, inputSmClass } from "@/components/ui";

export const metadata = { title: "Course content" };
export const dynamic = "force-dynamic";

const AI_BADGE = {
  pending: { tone: "neutral", label: "Waiting for AI" },
  generating: { tone: "info", label: "AI writing…" },
  done: { tone: "primary", label: "AI draft" },
  error: { tone: "danger", label: "AI failed" },
} as const;

/** Content tab: modules → chapters → lessons, plus each module's quiz. */
export default async function CourseContentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requirePermission("admin:content");
  const { id } = await params;
  const { created } = await searchParams;
  const db = await getDb();
  const program = await db.query.programs.findFirst({ where: eq(programs.id, id) });
  if (!program) notFound();
  if (program.slug === FLAGSHIP_PROGRAM.slug) return <FlagshipContent programId={id} />;

  const tree = await getProgramContent(db, id);
  const lessonCount = tree.reduce((n, m) => n + m.chapters.reduce((k, c) => k + c.lessons.length, 0), 0);
  const quizRows = tree.length
    ? await db
        .select({ moduleId: assessments.courseId, passMark: assessments.passMark, questions: sql<number>`(select count(*) from "questions" q where q.assessment_id = "assessments"."id")::int` })
        .from(assessments)
        .where(inArray(assessments.courseId, tree.map((m) => m.id)))
    : [];
  const quizByModule = new Map(quizRows.map((q) => [q.moduleId, q]));
  const aiPending = tree.flatMap((m) => m.chapters.flatMap((c) => c.lessons)).filter((l) => l.aiStatus === "pending" || l.aiStatus === "generating").length;

  return (
    <div className="space-y-6">
      {created && <Callout tone="success">Course created as a draft. Add modules and lessons below, then publish it in Details &amp; pricing.</Callout>}
      <p className="text-sm text-muted">
        {tree.length} modules · {lessonCount} lessons. Learners see visible modules once the course is published.
      </p>
      {aiPending > 0 && (
        <Callout tone="info" title="AI is writing lessons">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" aria-hidden /> {aiPending} lesson(s) are still being written.{" "}
            <Link href={`/admin/programs/${id}/ai`} className="font-semibold text-primary hover:underline">
              See progress
            </Link>
          </span>
        </Callout>
      )}
      {program.status === "draft" && lessonCount > 0 && !created && (
        <Callout tone="warning" title="Draft">
          Review every lesson, then publish the course in{" "}
          <Link href={`/admin/programs/${id}/details`} className="font-semibold text-primary hover:underline">
            Details &amp; pricing
          </Link>
          .
        </Callout>
      )}

      {tree.length === 0 ? (
        <EmptyState title="No modules yet">Add your first module below.</EmptyState>
      ) : (
        <ol className="space-y-5">
          {tree.map((m, mi) => (
            <li key={m.id}>
              <Card className="p-0!">
                <div className="flex flex-col gap-3 border-b border-border bg-surface-2/60 p-4 sm:flex-row sm:items-start">
                  <span className="pt-1.5 text-xs font-bold uppercase tracking-wider text-primary">Module {mi + 1}</span>
                  <ModuleForm module={m} />
                  <ItemControls kind="module" id={m.id} label={m.title} first={mi === 0} last={mi === tree.length - 1} />
                </div>
                <div className="space-y-4 p-4">
                  {m.chapters.map((c, ci) => (
                    <section key={c.id} className="rounded-lg border border-border">
                      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                        <span className="text-xs font-semibold text-muted">Chapter {ci + 1}</span>
                        <ChapterTitleForm chapterId={c.id} title={c.title} />
                        <ItemControls kind="chapter" id={c.id} label={c.title} first={ci === 0} last={ci === m.chapters.length - 1} />
                      </div>
                      <ul className="divide-y divide-border">
                        {c.lessons.map((l, li) => (
                          <li key={l.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                            <FileText className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                            <Link href={`/admin/lessons/${l.id}`} className="min-w-0 flex-1 truncate font-medium text-fg hover:text-primary hover:underline">
                              {l.title}
                            </Link>
                            {l.aiStatus && <Badge tone={AI_BADGE[l.aiStatus as keyof typeof AI_BADGE]?.tone ?? "neutral"}>{AI_BADGE[l.aiStatus as keyof typeof AI_BADGE]?.label ?? l.aiStatus}</Badge>}
                            <span className="hidden whitespace-nowrap text-xs text-muted sm:inline">
                              {l.words ? `${l.words} words` : "Empty"} · {l.durationMin} min
                            </span>
                            <ItemControls kind="lesson" id={l.id} label={l.title} first={li === 0} last={li === c.lessons.length - 1} />
                          </li>
                        ))}
                      </ul>
                      <div className="p-3">
                        <AddLessonForm chapterId={c.id} />
                      </div>
                    </section>
                  ))}
                  <AddChapterForm moduleId={m.id} />
                  {(() => {
                    const quiz = quizByModule.get(m.id);
                    return (
                      <Link
                        href={`/admin/programs/${id}/quiz/${m.id}`}
                        className="flex items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm hover:border-primary"
                      >
                        <ClipboardCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        <span className="flex-1 font-medium text-fg">Module quiz</span>
                        <span className="text-xs text-muted">{quiz?.questions ? `${quiz.questions} questions · pass ${quiz.passMark}%` : "No quiz yet"}</span>
                        <span className="text-xs font-semibold text-primary">{quiz?.questions ? "Edit" : "Add quiz"}</span>
                      </Link>
                    );
                  })()}
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}

      <Card>
        <AddModuleForm programId={id} />
      </Card>
    </div>
  );
}

/** The Odoo course's content comes from source files: list its modules with visibility and pass marks. */
async function FlagshipContent({ programId }: { programId: string }) {
  const db = await getDb();
  const [modules, platforms, [{ expired }]] = await Promise.all([
    db.select().from(courses).where(eq(courses.programId, programId)).orderBy(sectionRank(), asc(courses.position)),
    db.select().from(erpPlatforms).orderBy(asc(erpPlatforms.name)),
    db.select({ expired: sql<number>`count(*)::int` }).from(aiConversations).where(lt(aiConversations.expiresAt, new Date())),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">{modules.length} modules. Publish or hide modules, set certificate pass marks and edit lesson content.</p>
        <form action={syncNewContent}>
          <button
            className={buttonClass("secondary")}
            title="Adds new modules, projects, processes and documents from the source files and refreshes project and business-process pages. Existing lessons, edits and learner progress are not touched."
          >
            <RefreshCw className="h-4 w-4" aria-hidden /> Sync new content
          </button>
        </form>
      </div>

      <Card className="overflow-hidden p-0!">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="w-12 px-6 py-3">#</th>
                <th className="px-3 py-3">Module</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Visibility &amp; certificate pass mark</th>
                <th className="px-6 py-3 text-right">Content</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modules.map((m, i) => (
                <tr key={m.id} className="hover:bg-surface-2/50">
                  <td className="px-6 py-3 text-xs font-semibold text-muted">{i + 1}</td>
                  <td className="px-3 py-3">
                    <Link href={`/admin/programs/${programId}/modules/${m.slug}`} className="font-semibold text-fg hover:text-primary hover:underline">
                      {m.title}
                    </Link>
                    <div className="text-xs text-muted">{m.section}</div>
                  </td>
                  <td className="px-3 py-3">{m.published ? <Badge tone="success">Published</Badge> : <Badge>Hidden</Badge>}</td>
                  <td className="px-3 py-3">
                    <form action={updateCourseAction} className="flex items-center gap-2">
                      <input type="hidden" name="courseId" value={m.id} />
                      <label className="sr-only" htmlFor={`pub-${m.id}`}>
                        Visibility
                      </label>
                      <select id={`pub-${m.id}`} name="published" defaultValue={String(m.published)} className={inputSmClass}>
                        <option value="true">Published</option>
                        <option value="false">Hidden</option>
                      </select>
                      <label htmlFor={`cert-${m.id}`} className="whitespace-nowrap text-xs text-muted">
                        Pass ≥
                      </label>
                      <input id={`cert-${m.id}`} name="certMinScore" type="number" min={0} max={100} defaultValue={m.certMinScore} className={`${inputSmClass} w-16`} />
                      <span className="text-xs text-muted">%</span>
                      <button className={buttonClass("secondary", "px-3 py-1.5 text-xs")}>Save</button>
                    </form>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-4 whitespace-nowrap">
                      <Link href={`/admin/programs/${programId}/modules/${m.slug}`} className="text-sm font-semibold text-primary hover:underline">
                        Edit lessons
                      </Link>
                      <form action={refreshCourseFromSource}>
                        <input type="hidden" name="slug" value={m.slug} />
                        <button
                          className="text-xs text-muted underline-offset-2 hover:text-fg hover:underline"
                          title="Update this module from the content files. Keeps learner progress; overwrites lesson-editor changes to this module."
                        >
                          Refresh from source
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Platforms</CardTitle>
          <p className="mt-1 text-sm text-muted">Modules are linked to a platform, so new tracks can be added as content without changing the portal.</p>
          <ul className="mt-4 divide-y divide-border text-sm">
            {platforms.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5">
                <span className="text-fg">
                  {p.name} <span className="text-xs text-muted">({p.vendor})</span>
                </span>
                {p.active ? <Badge tone="success">Active · {p.defaultVersion}</Badge> : <Badge>Planned</Badge>}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>AI assistant data retention</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Conversations expire after AI_RETENTION_DAYS (default 30) and are purged automatically on new activity. {expired} expired conversation(s) are pending
            purge.
          </p>
          <form action={purgeExpiredAiConversations} className="mt-4">
            <button className={buttonClass("secondary")}>Purge expired conversations now</button>
          </form>
        </Card>
      </div>
    </div>
  );
}

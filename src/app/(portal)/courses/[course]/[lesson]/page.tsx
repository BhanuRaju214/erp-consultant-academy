import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, isNull } from "drizzle-orm";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Info } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bookmarks, discussions, lessonProgress, notes, users } from "@/lib/db/schema";
import { getLesson, markLessonStarted } from "@/lib/services/learning";
import { SCOPE_LABELS } from "@/lib/nav";
import { Markdown } from "@/components/markdown";
import { AskQuestionForm, Flashcards, LessonActions, LessonNotes } from "@/components/lesson-client";
import { Badge, Card, CardTitle, ProgressBar } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ course: string; lesson: string }> }) {
  const { course, lesson } = await params;
  const data = await getLesson(await getDb(), course, lesson);
  return { title: data?.lesson.title ?? "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ course: string; lesson: string }> }) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const user = await requireUser();
  const db = await getDb();
  const data = await getLesson(db, courseSlug, lessonSlug);
  if (!data || (!data.course.published && user.role === "student")) notFound();
  const { course, lesson, moduleTitle, index, total, prev, next } = data;
  const path = `/courses/${course.slug}/${lesson.slug}`;

  await markLessonStarted(db, user.id, lesson.id);
  const [progress, bookmark, note, threads] = await Promise.all([
    db.query.lessonProgress.findFirst({ where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lesson.id)) }),
    db.query.bookmarks.findFirst({ where: and(eq(bookmarks.userId, user.id), eq(bookmarks.lessonId, lesson.id)) }),
    db.query.notes.findFirst({ where: and(eq(notes.userId, user.id), eq(notes.lessonId, lesson.id)) }),
    db
      .select({ id: discussions.id, title: discussions.title, resolved: discussions.resolved, createdAt: discussions.createdAt, author: users.name })
      .from(discussions)
      .innerJoin(users, eq(users.id, discussions.userId))
      .where(and(eq(discussions.lessonId, lesson.id), isNull(discussions.parentId)))
      .orderBy(desc(discussions.createdAt))
      .limit(5),
  ]);
  const completed = progress?.status === "completed";
  const versionSensitive = lesson.odooVersions && !/independent/i.test(lesson.odooVersions);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <article className="min-w-0">
        <nav className="mb-3 text-sm text-muted" aria-label="Breadcrumb">
          <Link href={`/courses/${course.slug}`} className="hover:text-primary">
            {course.title}
          </Link>{" "}
          / <span>{moduleTitle}</span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{lesson.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge>{lesson.durationMin} min</Badge>
          {lesson.odooVersions && <Badge tone="info">{lesson.odooVersions}</Badge>}
          {lesson.scope.map((s) => (
            <Badge key={s} tone={SCOPE_LABELS[s]?.tone ?? "neutral"}>
              {SCOPE_LABELS[s]?.label ?? s}
            </Badge>
          ))}
          <span className="ml-auto text-xs text-muted">
            Lesson {index + 1} of {total}
          </span>
        </div>
        <ProgressBar value={((index + 1) / total) * 100} className="mt-3" label="Position in course" />

        {versionSensitive && (
          <p className="mt-4 flex gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted">
            <Info className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            Version-sensitive lesson ({lesson.odooVersions}). Menu paths and field names can differ between Odoo versions and editions — confirm in your
            training instance before applying them on a project.
          </p>
        )}

        <div className="mt-6">
          <Markdown>{lesson.body}</Markdown>
        </div>

        {lesson.flashcards.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-fg">Terminology flashcards</h2>
            <Flashcards cards={lesson.flashcards} />
          </section>
        )}

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between no-print">
          <LessonActions lessonId={lesson.id} completed={completed} bookmarked={Boolean(bookmark)} path={path} />
          <div className="flex gap-2">
            {prev && (
              <Link href={`/courses/${course.slug}/${prev.slug}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            )}
            {next ? (
              <Link href={`/courses/${course.slug}/${next.slug}`} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-fg hover:text-primary">
                Next: {next.title.length > 32 ? next.title.slice(0, 30) + "…" : next.title} <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-fg hover:text-primary">
                Back to course & assessment <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </article>

      <aside className="space-y-4 no-print">
        {lesson.resources.length > 0 && (
          <Card>
            <CardTitle>Resources</CardTitle>
            <ul className="mt-3 space-y-2 text-sm">
              {lesson.resources.map((r) => (
                <li key={r.id}>
                  <a
                    href={r.url}
                    {...(r.url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-start gap-2 text-primary hover:underline"
                  >
                    {r.url.startsWith("http") ? <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" /> : <Download className="mt-0.5 h-4 w-4 shrink-0" />}
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <Card>
          <CardTitle>My notes</CardTitle>
          <div className="mt-3">
            <LessonNotes lessonId={lesson.id} initial={note?.body ?? ""} />
          </div>
        </Card>
        <Card>
          <CardTitle>Questions on this lesson</CardTitle>
          {threads.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link href={`/discussions#${t.id}`} className="text-fg hover:text-primary">
                    {t.title}
                  </Link>{" "}
                  {t.resolved && <Badge tone="success">Resolved</Badge>}
                  <div className="text-xs text-muted">{t.author}</div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <AskQuestionForm lessonId={lesson.id} />
          </div>
        </Card>
      </aside>
    </div>
  );
}

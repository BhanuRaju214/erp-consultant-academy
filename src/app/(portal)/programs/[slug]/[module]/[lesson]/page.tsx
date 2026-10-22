import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ChevronLeft, ChevronRight, ClipboardCheck, Clock, Sparkles } from "lucide-react";
import { requireProgramUser } from "@/lib/auth/course-access";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { bookmarks, lessonProgress, notes } from "@/lib/db/schema";
import { getLesson, markLessonStarted } from "@/lib/services/learning";
import { getProgramPlayer, lessonHref, quizHref } from "@/lib/services/player";
import { getProgramBySlug } from "@/lib/services/programs";
import { extractToc } from "@/lib/visuals/enhance";
import { Markdown } from "@/components/markdown";
import { CoursePlaylist } from "@/components/course-playlist";
import { LessonToc } from "@/components/lesson-toc";
import { Flashcards, LessonActions, LessonNotes } from "@/components/lesson-client";
import { Callout, Card, CardTitle } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ module: string; lesson: string }> }) {
  const { module, lesson } = await params;
  const data = await getLesson(await getDb(), module, lesson);
  return { title: data?.lesson.title ?? "Lesson" };
}

/** Lesson player for courses built in the course builder. */
export default async function ProgramLessonPage({ params }: { params: Promise<{ slug: string; module: string; lesson: string }> }) {
  const { slug, module, lesson: lessonSlug } = await params;
  const user = await requireProgramUser(slug);
  const db = await getDb();
  const program = await getProgramBySlug(db, slug);
  const data = await getLesson(db, module, lessonSlug);
  if (!program || !data) notFound();
  // The lesson must belong to this course, and hidden modules are for staff only.
  const player = await getProgramPlayer(db, program, user.id);
  const mod = player.modules.find((m) => m.slug === module);
  if (!mod && !can(user.role, "trainer:dashboard")) notFound();
  const { lesson } = data;

  await markLessonStarted(db, user.id, lesson.id);
  const [progress, bookmark, note] = await Promise.all([
    db.query.lessonProgress.findFirst({ where: and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lesson.id)) }),
    db.query.bookmarks.findFirst({ where: and(eq(bookmarks.userId, user.id), eq(bookmarks.lessonId, lesson.id)) }),
    db.query.notes.findFirst({ where: and(eq(notes.userId, user.id), eq(notes.lessonId, lesson.id)) }),
  ]);
  const path = lessonHref(slug, module, lesson.slug);
  const i = player.order.findIndex((l) => l.id === lesson.id);
  const prev = i > 0 ? player.order[i - 1] : null;
  const next = i >= 0 && i < player.order.length - 1 ? player.order[i + 1] : null;
  const toc = extractToc(lesson.body);
  const unwritten = !lesson.body.trim();
  // After the module's last lesson, the module quiz comes next.
  const quizNext = mod?.quiz && (!next || next.moduleSlug !== module) ? mod.quiz : null;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <article className="min-w-0">
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link href={`/programs/${slug}`} className="hover:text-primary hover:underline">
            {program.title}
          </Link>{" "}
          / {data.course.title} / {data.moduleTitle}
        </nav>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-fg">{lesson.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {lesson.durationMin} min
          </span>
          {i >= 0 && (
            <span>
              Lesson {i + 1} of {player.total}
            </span>
          )}
          {lesson.aiStatus && (
            <span className="flex items-center gap-1 text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> AI-assisted content
            </span>
          )}
        </div>

        <div className="mt-6">
          {unwritten ? (
            <Callout tone="info">This lesson hasn&apos;t been written yet.</Callout>
          ) : (
            <>
              <LessonToc items={toc} variant="inline" />
              <Markdown enhance>{lesson.body}</Markdown>
            </>
          )}
        </div>

        {lesson.flashcards.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-semibold text-fg">Key terms</h2>
            <Flashcards cards={lesson.flashcards} />
          </section>
        )}

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between no-print">
          <LessonActions lessonId={lesson.id} completed={progress?.status === "completed"} bookmarked={Boolean(bookmark)} path={path} />
          <div className="flex gap-2">
            {prev && (
              <Link href={lessonHref(slug, prev.moduleSlug, prev.slug)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            )}
            {quizNext ? (
              <Link href={quizHref(slug, module)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                <ClipboardCheck className="h-4 w-4" aria-hidden /> Take the module quiz <ChevronRight className="h-4 w-4" />
              </Link>
            ) : next ? (
              <Link href={lessonHref(slug, next.moduleSlug, next.slug)} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-fg hover:text-primary">
                Next: {next.title.length > 32 ? next.title.slice(0, 30) + "…" : next.title} <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href={`/programs/${slug}`} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-fg hover:text-primary">
                Back to course home <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </article>

      <aside className="space-y-4 no-print">
        {mod && (
          <CoursePlaylist
            courseSlug={module}
            courseTitle={mod.title}
            modules={mod.chapters}
            currentLessonId={lesson.id}
            statusByLesson={player.statusByLesson}
            hrefBase={`/programs/${slug}/${module}`}
          />
        )}
        {mod?.quiz && (
          <Link href={quizHref(slug, module)} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-sm shadow-sm hover:border-primary">
            <ClipboardCheck className={`h-5 w-5 shrink-0 ${mod.quiz.passed ? "text-success" : "text-primary"}`} aria-hidden />
            <span className="flex-1">
              <span className="block font-semibold text-fg">Module quiz</span>
              <span className="text-xs text-muted">
                {mod.quiz.passed ? `Passed · best ${mod.quiz.best}%` : mod.quiz.best !== null ? `Best ${mod.quiz.best}% · pass mark ${mod.quiz.passMark}%` : `${mod.quiz.questions} questions · pass mark ${mod.quiz.passMark}%`}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
          </Link>
        )}
        <Card>
          <CardTitle>My notes</CardTitle>
          <div className="mt-3">
            <LessonNotes lessonId={lesson.id} initial={note?.body ?? ""} />
          </div>
        </Card>
        {toc.length > 1 && (
          <div className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-border bg-surface p-4 shadow-sm xl:block">
            <LessonToc items={toc} />
          </div>
        )}
      </aside>
    </div>
  );
}

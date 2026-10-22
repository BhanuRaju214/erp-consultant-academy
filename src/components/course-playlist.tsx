import Link from "next/link";
import { ChevronDown, CircleCheck, ListVideo, PlayCircle } from "lucide-react";
import { formatMinutes } from "@/lib/services/library";
import { cn } from "./ui";

interface PlaylistModule {
  id: string;
  title: string;
  lessons: { id: string; slug: string; title: string; durationMin: number }[];
}

/**
 * Oracle MyLearn-style playlist: every lesson in the course grouped by module, with
 * duration and completion, the current lesson highlighted, and overall progress.
 */
export function CoursePlaylist({
  courseSlug,
  courseTitle,
  modules,
  currentLessonId,
  statusByLesson,
  hrefBase,
}: {
  courseSlug: string;
  /** Where lesson links point; defaults to the Odoo course URLs (/courses/<module>). */
  hrefBase?: string;
  courseTitle: string;
  modules: PlaylistModule[];
  currentLessonId: string;
  statusByLesson: Map<string, string>;
}) {
  const all = modules.flatMap((m) => m.lessons);
  const done = all.filter((l) => statusByLesson.get(l.id) === "completed").length;
  const totalMin = all.reduce((n, l) => n + l.durationMin, 0);
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  const base = hrefBase ?? `/courses/${courseSlug}`;

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface" aria-label="Course playlist">
      <header className="border-b border-border bg-surface-2 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-fg">
          <ListVideo className="h-4 w-4 text-primary" aria-hidden /> Playlist
        </div>
        <Link href={base} className="mt-0.5 block truncate text-xs text-muted hover:text-primary hover:underline">
          {courseTitle}
        </Link>
      </header>
      <div className="max-h-[26rem] overflow-y-auto [scrollbar-width:thin]">
        {modules.map((m, mi) => {
          const containsCurrent = m.lessons.some((l) => l.id === currentLessonId);
          const modDone = m.lessons.filter((l) => statusByLesson.get(l.id) === "completed").length;
          return (
            <details key={m.id} open={containsCurrent} className="group border-b border-border last:border-0">
              <summary className="flex cursor-pointer list-none items-start gap-2 px-4 py-3 hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                <span className="mt-0.5 text-xs font-bold text-muted">{mi + 1}.</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.8125rem] font-bold leading-snug text-fg">{m.title.replace(/^Module \d+\s*[—-]\s*/, "")}</span>
                  <span className="text-[0.6875rem] text-muted">
                    {modDone}/{m.lessons.length} lessons
                  </span>
                </span>
                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
              </summary>
              <ol className="pb-2">
                {m.lessons.map((l) => {
                  const current = l.id === currentLessonId;
                  const completed = statusByLesson.get(l.id) === "completed";
                  return (
                    <li key={l.id}>
                      <Link
                        href={`${base}/${l.slug}`}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "relative flex items-start gap-2.5 py-2 pl-5 pr-4 text-[0.8125rem] transition",
                          current ? "bg-primary-soft font-semibold text-fg" : "text-fg/85 hover:bg-surface-2",
                        )}
                      >
                        {current && <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" aria-hidden />}
                        {completed ? (
                          <CircleCheck className="mt-px h-4 w-4 shrink-0 text-success" aria-label="Completed" />
                        ) : current ? (
                          <PlayCircle className="mt-px h-4 w-4 shrink-0 text-primary" aria-hidden />
                        ) : (
                          <span className="mt-[3px] h-3.5 w-3.5 shrink-0 rounded-full border-2 border-border" aria-hidden />
                        )}
                        <span className="min-w-0 flex-1 leading-snug">{l.title}</span>
                        <span className="shrink-0 text-[0.6875rem] text-muted">{formatMinutes(l.durationMin)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })}
      </div>
      <footer className="border-t border-border px-4 py-3">
        <div className="flex justify-between text-xs">
          <span className="font-bold text-fg">Module progress</span>
          <span className="text-muted">
            {done}/{all.length} · {formatMinutes(totalMin)}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </footer>
    </section>
  );
}

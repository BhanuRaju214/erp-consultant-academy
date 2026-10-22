import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, Clock, Layers, PlayCircle } from "lucide-react";
import type { ProgramCard as ProgramCardData } from "@/lib/services/programs";
import { CourseCover } from "./course-cover";
import { formatRupees } from "@/lib/gst";
import { Badge, LevelBadge, ProgressBar, cn } from "./ui";

/** Cover image for a program: the uploaded media asset, or the branded fallback. */
export function ProgramCover({ slug, coverAssetId, className, size = "card" }: { slug: string; coverAssetId: string | null; className?: string; size?: "card" | "banner" }) {
  if (coverAssetId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/media/${coverAssetId}`} alt="" className={cn("h-full w-full object-cover", className)} />
    );
  }
  return <CourseCover slug={slug} section="odoo-apps" size="banner" className={cn("h-full! min-h-0! rounded-none!", className)} />;
}

/** Price shown on cards: the GST-inclusive price for paid courses, otherwise Free / By invitation. */
export function priceLabel(program: { enrollmentMode: string; pricePaise: number | null }): string {
  if (program.enrollmentMode === "paid" && program.pricePaise) return formatRupees(program.pricePaise);
  return program.enrollmentMode === "open" ? "Free" : "By invitation";
}

/**
 * Catalogue / dashboard card. `mode` decides the call to action: learners who are
 * enrolled see their progress and continue; others see the course page link.
 */
export function ProgramCard({ data, mode }: { data: ProgramCardData; mode: "catalog" | "mine" }) {
  const { program, enrolled, lessonsDone, lessonsTotal, subCourses } = data;
  const pct = lessonsTotal ? Math.round((lessonsDone / lessonsTotal) * 100) : 0;
  const href = mode === "mine" && enrolled ? program.homePath : `/catalog/${program.slug}`;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift motion-reduce:transform-none">
      <div className="relative aspect-[16/9] overflow-hidden bg-ink">
        <div className="h-full w-full transition duration-500 group-hover:scale-[1.03] motion-reduce:transform-none">
          <ProgramCover slug={program.slug} coverAssetId={program.coverAssetId} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {enrolled && (
            <Badge tone="success" className="shadow-sm">
              <CircleCheck className="h-3 w-3" aria-hidden /> Enrolled
            </Badge>
          )}
          {program.status === "archived" && <Badge tone="warning">Archived</Badge>}
        </div>
        {mode === "mine" && enrolled && (
          <span className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-primary opacity-0 shadow-lg transition group-hover:opacity-100" aria-hidden>
            <PlayCircle className="h-6 w-6" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold leading-snug text-fg">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none group-hover:text-primary">
            {program.title}
          </Link>
        </h3>
        {program.subtitle && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{program.subtitle}</p>}
        <p className="mt-2 text-xs font-medium text-muted">By Nexsademy</p>

        <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          <li>
            <LevelBadge level={program.level} />
          </li>
          {subCourses > 0 && (
            <li className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" aria-hidden /> {subCourses} modules
            </li>
          )}
          {lessonsTotal > 0 && (
            <li className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" aria-hidden /> {lessonsTotal} lessons
            </li>
          )}
          {program.durationHours ? (
            <li className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {program.durationHours}h
            </li>
          ) : null}
        </ul>

        <div className="mt-auto pt-5">
          {enrolled && mode === "mine" ? (
            <>
              <div className="mb-2 flex items-center justify-between text-xs text-muted">
                <span>
                  {lessonsDone} of {lessonsTotal} lessons
                </span>
                <span className="font-semibold text-fg">{pct}%</span>
              </div>
              <ProgressBar value={pct} label={`${program.title} progress`} />
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {lessonsDone ? "Continue learning" : "Start course"} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </>
          ) : (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="font-display text-xl font-semibold text-fg">{enrolled ? "Enrolled" : priceLabel(program)}</span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                View course <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

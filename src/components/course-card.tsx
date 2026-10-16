import Link from "next/link";
import { CircleCheck, Clock } from "lucide-react";
import type { CourseProgressRow } from "@/lib/services/learning";
import { CourseCover } from "./course-cover";
import { Badge, LevelBadge, ProgressBar } from "./ui";

export function CourseCard({ course }: { course: CourseProgressRow }) {
  const pct = course.totalLessons ? (course.completedLessons / course.totalLessons) * 100 : 0;
  const done = course.totalLessons > 0 && course.completedLessons === course.totalLessons;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:transform-none">
      <CourseCover slug={course.slug} section={course.section} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={course.level} />
          {course.odooVersion && <Badge>{course.odooVersion}</Badge>}
          {done && (
            <Badge tone="success">
              <CircleCheck className="h-3 w-3" aria-hidden /> Completed
            </Badge>
          )}
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug text-fg">
          {/* The stretched link makes the whole card clickable while keeping one accessible link. */}
          <Link href={`/courses/${course.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none group-hover:text-primary">
            {course.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{course.summary}</p>
        <div className="mt-auto pt-4">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{course.totalLessons} lessons</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {Math.round((course.totalMinutes / 60) * 10) / 10} h
            </span>
            <span className="ml-auto font-medium">{Math.round(pct)}%</span>
          </div>
          <ProgressBar value={pct} className="mt-2" label={`${course.title} progress`} />
        </div>
      </div>
    </article>
  );
}

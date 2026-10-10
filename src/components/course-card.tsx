import Link from "next/link";
import { Clock } from "lucide-react";
import type { CourseProgressRow } from "@/lib/services/learning";
import { Badge, Card, LevelBadge, ProgressBar } from "./ui";

export function CourseCard({ course }: { course: CourseProgressRow }) {
  const pct = course.totalLessons ? (course.completedLessons / course.totalLessons) * 100 : 0;
  return (
    <Card as="article" className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <LevelBadge level={course.level} />
        {course.odooVersion && <Badge>{course.odooVersion}</Badge>}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-fg">
        <Link href={`/courses/${course.slug}`} className="hover:text-primary">
          {course.title}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted">{course.summary}</p>
      <div className="mt-4 flex items-center gap-3 text-xs text-muted">
        <span>{course.totalLessons} lessons</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden /> {Math.round(course.totalMinutes / 60 * 10) / 10} h
        </span>
        <span className="ml-auto">{Math.round(pct)}%</span>
      </div>
      <ProgressBar value={pct} className="mt-2" label={`${course.title} progress`} />
    </Card>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { courseModules, courses, lessons } from "@/lib/db/schema";
import { LessonEditor } from "@/components/admin-forms";
import { Card, PageHeader } from "@/components/ui";

export default async function AdminLessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("admin:content");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [row] = await (await getDb())
    .select({ lesson: lessons, courseSlug: courses.slug, courseTitle: courses.title })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .where(eq(lessons.id, id))
    .limit(1);
  if (!row) notFound();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow={<Link href={`/admin/courses/${row.courseSlug}`}>{row.courseTitle}</Link>}
        title={`Edit lesson`}
        description={
          <Link href={`/courses/${row.courseSlug}/${row.lesson.slug}`} className="text-primary hover:underline">
            Preview published lesson →
          </Link>
        }
      />
      <Card>
        <LessonEditor lesson={row.lesson} />
      </Card>
    </div>
  );
}

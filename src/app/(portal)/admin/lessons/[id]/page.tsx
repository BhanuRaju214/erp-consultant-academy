import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { courseModules, courses, lessons, programs } from "@/lib/db/schema";
import { FLAGSHIP_PROGRAM } from "@/lib/services/programs";
import { LessonEditor } from "@/components/admin-forms";
import { Card, PageHeader } from "@/components/ui";

export default async function AdminLessonPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("admin:content");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [row] = await (await getDb())
    .select({ lesson: lessons, courseSlug: courses.slug, courseTitle: courses.title, programId: programs.id, programSlug: programs.slug, programTitle: programs.title })
    .from(lessons)
    .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .innerJoin(courses, eq(courses.id, courseModules.courseId))
    .leftJoin(programs, eq(programs.id, courses.programId))
    .where(eq(lessons.id, id))
    .limit(1);
  if (!row) notFound();
  // The Odoo course keeps its own admin and URLs; other courses use the course builder and /programs player.
  const flagship = !row.programSlug || row.programSlug === FLAGSHIP_PROGRAM.slug;
  const back = flagship ? `/admin/programs/${row.programId}/modules/${row.courseSlug}` : `/admin/programs/${row.programId}`;
  const preview = flagship ? `/courses/${row.courseSlug}/${row.lesson.slug}` : `/programs/${row.programSlug}/${row.courseSlug}/${row.lesson.slug}`;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader compact
        eyebrow={<Link href={back}>{flagship ? row.courseTitle : `${row.programTitle} · ${row.courseTitle}`}</Link>}
        title={`Edit lesson`}
        description={
          <Link href={preview} className="text-primary hover:underline">
            Preview lesson →
          </Link>
        }
      />
      <Card>
        <LessonEditor lesson={row.lesson} odooFields={flagship} />
      </Card>
    </div>
  );
}

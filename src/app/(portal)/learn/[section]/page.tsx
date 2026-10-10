import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listCoursesWithProgress } from "@/lib/services/learning";
import { SECTION_META } from "@/lib/nav";
import type { SectionKey } from "@/content/types";
import { CourseCard } from "@/components/course-card";
import { EmptyState, PageHeader } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return { title: SECTION_META[section as SectionKey]?.title ?? "Courses" };
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const meta = SECTION_META[section as SectionKey];
  if (!meta) notFound();
  const user = await requireUser();
  const courses = await listCoursesWithProgress(await getDb(), user.id, section);
  return (
    <div>
      <PageHeader title={meta.title} description={meta.intro} />
      {courses.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <EmptyState title="No courses published in this section yet">An administrator can publish courses from Admin ▸ Content.</EmptyState>
      )}
    </div>
  );
}

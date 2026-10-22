import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCourseOutline } from "@/lib/services/learning";
import { Card } from "@/components/ui";

export const metadata = { title: "Module lessons" };

/** Lessons of one Odoo-course module (that course's content comes from source files). */
export default async function CourseModuleLessonsPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const user = await requirePermission("admin:content");
  const { id, slug } = await params;
  const data = await getCourseOutline(await getDb(), slug, user.id);
  if (!data || data.course.programId !== id) notFound();
  return (
    <div className="space-y-5">
      <div>
        <Link href={`/admin/programs/${id}`} className="text-sm font-semibold text-primary hover:underline">
          ← All modules
        </Link>
        <h3 className="mt-2 text-xl font-bold text-fg">{data.course.title}</h3>
        <p className="text-sm text-muted">Select a lesson to edit its content.</p>
      </div>
      {data.course.modules.map((m) => (
        <Card key={m.id} className="p-0!">
          <div className="border-b border-border px-5 py-3 font-semibold text-fg">{m.title}</div>
          <ul className="divide-y divide-border">
            {m.lessons.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                <span className="text-fg">{l.title}</span>
                <span className="flex gap-3">
                  <Link href={`/courses/${data.course.slug}/${l.slug}`} className="text-muted hover:text-primary">
                    View
                  </Link>
                  <Link href={`/admin/lessons/${l.id}`} className="text-primary hover:underline">
                    Edit
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

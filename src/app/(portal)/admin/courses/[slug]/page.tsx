import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCourseOutline } from "@/lib/services/learning";
import { Card, PageHeader } from "@/components/ui";

export default async function AdminCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requirePermission("admin:content");
  const { slug } = await params;
  const data = await getCourseOutline(await getDb(), slug, user.id);
  if (!data) notFound();
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={<Link href="/admin">Admin console</Link>} title={`Edit: ${data.course.title}`} description="Select a lesson to edit its content." />
      {data.course.modules.map((m) => (
        <Card key={m.id} className="p-0">
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

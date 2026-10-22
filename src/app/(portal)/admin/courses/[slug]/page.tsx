import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { courses } from "@/lib/db/schema";

/** Old address of a module's lesson list: now inside its course. */
export default async function OldModuleLessonsPage({ params }: { params: Promise<{ slug: string }> }) {
  await requirePermission("admin:content");
  const { slug } = await params;
  const mod = await (await getDb()).query.courses.findFirst({ where: eq(courses.slug, slug), columns: { programId: true } });
  if (!mod?.programId) notFound();
  redirect(`/admin/programs/${mod.programId}/modules/${slug}`);
}

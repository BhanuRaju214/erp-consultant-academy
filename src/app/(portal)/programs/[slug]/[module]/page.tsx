import { notFound, redirect } from "next/navigation";
import { requireProgramUser } from "@/lib/auth/course-access";
import { getDb } from "@/lib/db";
import { getCourseOutline } from "@/lib/services/learning";
import { lessonHref } from "@/lib/services/player";

/** A module link opens its first lesson. */
export default async function ProgramModulePage({ params }: { params: Promise<{ slug: string; module: string }> }) {
  const { slug, module } = await params;
  const user = await requireProgramUser(slug);
  const outline = await getCourseOutline(await getDb(), module, user.id);
  const first = outline?.course.modules.flatMap((c) => c.lessons)[0];
  if (!first) notFound();
  redirect(lessonHref(slug, module, first.slug));
}

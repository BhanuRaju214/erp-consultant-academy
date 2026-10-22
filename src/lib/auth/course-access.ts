import "server-only";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { User } from "@/lib/db/schema";
import { FLAGSHIP_PROGRAM, canAccessProgram } from "@/lib/services/programs";
import { z } from "zod";
import { programSlugForLesson } from "@/lib/services/builder";
import { getCurrentUser, requireUser } from ".";

/**
 * For API routes that serve flagship-program content (assistant, labs, templates,
 * project files): the caller must be signed in and enrolled (or staff).
 */
export async function courseApiUser(): Promise<{ ok: true; user: User } | { ok: false; response: NextResponse }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!(await canAccessProgram(await getDb(), user, FLAGSHIP_PROGRAM.slug))) {
    return { ok: false, response: NextResponse.json({ error: "Enrol in the course to use this feature." }, { status: 403 }) };
  }
  return { ok: true, user };
}

/**
 * For pages and server actions in the flagship program: signed in AND enrolled (or
 * staff), otherwise redirect to the course page. Every page calls this itself:
 * the (academy) layout's check alone doesn't stop a page from rendering its content.
 */
export async function requireCourseUser(): Promise<User> {
  const user = await requireUser();
  if (!(await canAccessProgram(await getDb(), user, FLAGSHIP_PROGRAM.slug))) {
    redirect(`/catalog/${FLAGSHIP_PROGRAM.slug}?locked=1`);
  }
  return user;
}

/** For pages of any course (program): signed in AND enrolled (or staff), otherwise to the course page. */
export async function requireProgramUser(programSlug: string): Promise<User> {
  const user = await requireUser();
  if (!(await canAccessProgram(await getDb(), user, programSlug))) redirect(`/catalog/${programSlug}?locked=1`);
  return user;
}

/** For lesson actions (complete, bookmark, notes): access to the course the lesson belongs to. */
export async function requireLessonUser(lessonId: string): Promise<User> {
  const user = await requireUser();
  const db = await getDb();
  const slug = z.string().uuid().safeParse(lessonId).success ? await programSlugForLesson(db, lessonId) : null;
  if (!slug) redirect("/dashboard");
  if (!(await canAccessProgram(db, user, slug))) redirect(`/catalog/${slug}?locked=1`);
  return user;
}

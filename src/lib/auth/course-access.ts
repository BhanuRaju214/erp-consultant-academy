import "server-only";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { User } from "@/lib/db/schema";
import { FLAGSHIP_PROGRAM, canAccessModule, canAccessProgram, programForModule } from "@/lib/services/programs";
import { z } from "zod";
import { courseIdForLesson } from "@/lib/services/builder";
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

/**
 * For pages of one module (a `courses` row): free beginner modules are open to every
 * signed-in learner; other modules need the course. Locked → that course's page.
 */
export async function requireModuleUser(courseSlug: string): Promise<User> {
  const user = await requireUser();
  const db = await getDb();
  if (!(await canAccessModule(db, user, { slug: courseSlug }))) {
    const program = await programForModule(db, { slug: courseSlug });
    redirect(`/catalog/${program?.slug ?? FLAGSHIP_PROGRAM.slug}?locked=1`);
  }
  return user;
}

/** For lesson actions (complete, bookmark, notes): access to the module the lesson belongs to. */
export async function requireLessonUser(lessonId: string): Promise<User> {
  const user = await requireUser();
  const db = await getDb();
  const courseId = z.string().uuid().safeParse(lessonId).success ? await courseIdForLesson(db, lessonId) : null;
  if (!courseId) redirect("/dashboard");
  if (!(await canAccessModule(db, user, { id: courseId }))) {
    const program = await programForModule(db, { id: courseId });
    redirect(`/catalog/${program?.slug ?? FLAGSHIP_PROGRAM.slug}?locked=1`);
  }
  return user;
}

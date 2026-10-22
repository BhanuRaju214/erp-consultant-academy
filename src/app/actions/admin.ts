"use server";

import { and, eq, lt, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { aiConversations, courses, lessons, users } from "@/lib/db/schema";
import { registerUser } from "@/lib/services/users";

export type AdminState = { error?: string; ok?: string };

export async function createUserAction(_: AdminState, formData: FormData): Promise<AdminState> {
  await requirePermission("admin:users");
  const role = z.enum(["student", "trainer", "admin"]).safeParse(formData.get("role"));
  if (!role.success) return { error: "Choose a role." };
  const res = await registerUser(
    await getDb(),
    { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") },
    role.data,
  );
  if (!res.ok) return { error: res.error };
  revalidatePath("/admin");
  return { ok: `Created ${res.value.email} as ${role.data}. Share the initial password securely and ask them to keep it private.` };
}

export async function updateUserAction(formData: FormData) {
  const admin = await requirePermission("admin:users");
  const parsed = z
    .object({ userId: z.string().uuid(), role: z.enum(["student", "trainer", "admin"]), active: z.enum(["true", "false"]) })
    .parse({ userId: formData.get("userId"), role: formData.get("role"), active: formData.get("active") });
  // Admins cannot demote or deactivate themselves (avoids locking everyone out).
  if (parsed.userId === admin.id) return;
  await (await getDb())
    .update(users)
    .set({ role: parsed.role, active: parsed.active === "true" })
    .where(and(eq(users.id, parsed.userId), ne(users.id, admin.id)));
  revalidatePath("/admin");
}

export async function updateCourseAction(formData: FormData) {
  await requirePermission("admin:content");
  const parsed = z
    .object({ courseId: z.string().uuid(), published: z.enum(["true", "false"]), certMinScore: z.coerce.number().int().min(0).max(100) })
    .parse({ courseId: formData.get("courseId"), published: formData.get("published"), certMinScore: formData.get("certMinScore") });
  await (await getDb())
    .update(courses)
    .set({ published: parsed.published === "true", certMinScore: parsed.certMinScore })
    .where(eq(courses.id, parsed.courseId));
  revalidatePath("/admin/programs", "layout");
  revalidatePath("/admin");
}

const lessonSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().trim().min(3).max(200),
  durationMin: z.coerce.number().int().min(1).max(600),
  odooVersions: z.string().trim().max(100),
  scope: z.array(z.enum(["standard", "enterprise", "configuration", "customization", "third-party"])),
  body: z.string().min(20, "Lesson body is too short.").max(200_000),
});

export async function updateLessonAction(_: AdminState, formData: FormData): Promise<AdminState> {
  await requirePermission("admin:content");
  const parsed = lessonSchema.safeParse({
    lessonId: formData.get("lessonId"),
    title: formData.get("title"),
    durationMin: formData.get("durationMin"),
    odooVersions: formData.get("odooVersions"),
    scope: formData.getAll("scope"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { lessonId, ...rest } = parsed.data;
  // A hand-edited lesson is no longer waiting for the AI writer, so it won't be overwritten.
  await (await getDb())
    .update(lessons)
    .set({ ...rest, aiStatus: sql`case when ${lessons.aiStatus} in ('pending', 'error') then null else ${lessons.aiStatus} end`, aiError: null })
    .where(eq(lessons.id, lessonId));
  revalidatePath("/", "layout");
  return { ok: "Lesson saved. Changes are live for all trainees." };
}

/**
 * Re-syncs one course from its content files (src/content/**) in place: lessons are
 * matched by slug, so learner progress, notes and bookmarks are kept. Overwrites admin
 * edits made to that course in the lesson editor.
 */
export async function refreshCourseFromSource(formData: FormData) {
  await requirePermission("admin:content");
  const slug = z.string().regex(/^[a-z0-9-]+$/).parse(formData.get("slug"));
  const { seedAll } = await import("@/lib/seed");
  await seedAll(await getDb(), { refresh: [slug], skipUsers: true });
  revalidatePath("/", "layout");
}

/** Inserts any new content from the source files (new courses, projects, processes, docs) and refreshes project documents. Non-destructive. */
export async function syncNewContent() {
  await requirePermission("admin:content");
  const { seedAll } = await import("@/lib/seed");
  await seedAll(await getDb(), { skipUsers: true, refreshProjectData: true });
  revalidatePath("/", "layout");
}

export async function purgeExpiredAiConversations() {
  await requirePermission("admin:content");
  await (await getDb()).delete(aiConversations).where(lt(aiConversations.expiresAt, new Date()));
  revalidatePath("/admin/programs", "layout");
  revalidatePath("/admin");
}

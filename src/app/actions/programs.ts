"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requirePermission, requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { enrollByEmail, revokeEnrollment, saveProgram, selfEnroll } from "@/lib/services/programs";

export interface ProgramFormState {
  error?: string;
  success?: string;
}

/** "Enroll" button on a course page. */
export async function enrollSelfAction(_: ProgramFormState, formData: FormData): Promise<ProgramFormState> {
  const user = await requireUser();
  const res = await selfEnroll(await getDb(), user, String(formData.get("slug") ?? ""));
  if (!res.ok) return { error: res.error };
  revalidatePath("/dashboard");
  revalidatePath("/catalog");
  redirect(res.value.homePath);
}

function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Create (no id) or update a program from the admin form. */
export async function saveProgramAction(_: ProgramFormState, formData: FormData): Promise<ProgramFormState> {
  await requirePermission("admin:content");
  const id = String(formData.get("id") ?? "") || undefined;
  const duration = String(formData.get("durationHours") ?? "").trim();
  const cover = String(formData.get("coverAssetId") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim();
  const res = await saveProgram(
    await getDb(),
    {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      subtitle: String(formData.get("subtitle") ?? ""),
      description: String(formData.get("description") ?? ""),
      level: String(formData.get("level") ?? "beginner") as "beginner",
      durationHours: duration === "" ? null : Number(duration),
      highlights: lines(formData.get("highlights")),
      coverAssetId: cover === "" ? null : cover,
      status: String(formData.get("status") ?? "draft") as "draft",
      enrollmentMode: String(formData.get("enrollmentMode") ?? "invite") as "invite",
      pricePaise: price === "" ? null : Math.round(Number(price) * 100),
      position: Number(formData.get("position") ?? 0),
    },
    id,
  );
  if (!res.ok) return { error: res.error };
  revalidatePath("/admin/programs");
  revalidatePath("/catalog");
  revalidatePath("/dashboard");
  if (!id) redirect(`/admin/programs/${res.value.id}?created=1`);
  revalidatePath(`/admin/programs/${res.value.id}`, "layout");
  return { success: "Saved." };
}

export async function enrollByEmailAction(_: ProgramFormState, formData: FormData): Promise<ProgramFormState> {
  const admin = await requirePermission("admin:content");
  const programId = z.string().uuid().safeParse(formData.get("programId"));
  const email = String(formData.get("email") ?? "").trim();
  if (!programId.success || !email) return { error: "Enter the learner's email address." };
  const res = await enrollByEmail(await getDb(), programId.data, email, admin.id);
  if (!res.ok) return { error: res.error };
  revalidatePath(`/admin/programs/${programId.data}`, "layout");
  return { success: `${res.value.name} (${res.value.email}) is enrolled.` };
}

export async function revokeEnrollmentAction(formData: FormData) {
  await requirePermission("admin:content");
  const programId = z.string().uuid().parse(formData.get("programId"));
  const userId = z.string().uuid().parse(formData.get("userId"));
  await revokeEnrollment(await getDb(), programId, userId);
  revalidatePath(`/admin/programs/${programId}`, "layout");
}

export async function reEnrollAction(formData: FormData) {
  const admin = await requirePermission("admin:content");
  const programId = z.string().uuid().parse(formData.get("programId"));
  const email = String(formData.get("email") ?? "");
  await enrollByEmail(await getDb(), programId, email, admin.id);
  revalidatePath(`/admin/programs/${programId}`, "layout");
}

"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { setCourseReminders } from "@/lib/services/reminders";

/** Button on /unsubscribe: turns course reminder emails off (or back on). */
export async function setCourseRemindersAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const on = formData.get("on") === "true";
  await setCourseReminders(await getDb(), token, on);
  redirect(`/unsubscribe?token=${encodeURIComponent(token)}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  addChapter,
  addLesson,
  addModule,
  deleteChapter,
  deleteLesson,
  deleteModule,
  moveItem,
  programIdFor,
  renameChapter,
  updateModule,
} from "@/lib/services/builder";

export interface BuilderState {
  error?: string;
}

const id = z.string().uuid();
const kind = z.enum(["module", "chapter", "lesson"]);

async function refresh(programId: string | null) {
  if (!programId) return;
  revalidatePath(`/admin/programs/${programId}`, "layout");
  revalidatePath("/catalog", "layout");
  revalidatePath("/programs", "layout");
}

export async function addModuleAction(_: BuilderState, formData: FormData): Promise<BuilderState> {
  await requirePermission("admin:content");
  const programId = id.parse(formData.get("programId"));
  const res = await addModule(await getDb(), programId, { title: String(formData.get("title") ?? ""), summary: String(formData.get("summary") ?? "") });
  if (!res.ok) return { error: res.error };
  await refresh(programId);
  return {};
}

export async function updateModuleAction(_: BuilderState, formData: FormData): Promise<BuilderState> {
  await requirePermission("admin:content");
  const db = await getDb();
  const moduleId = id.parse(formData.get("moduleId"));
  const res = await updateModule(db, moduleId, {
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    published: formData.get("published") === "true",
  });
  if (!res.ok) return { error: res.error };
  await refresh(await programIdFor(db, "module", moduleId));
  return {};
}

export async function addChapterAction(_: BuilderState, formData: FormData): Promise<BuilderState> {
  await requirePermission("admin:content");
  const db = await getDb();
  const moduleId = id.parse(formData.get("moduleId"));
  const res = await addChapter(db, moduleId, String(formData.get("title") ?? ""));
  if (!res.ok) return { error: res.error };
  await refresh(await programIdFor(db, "module", moduleId));
  return {};
}

export async function renameChapterAction(_: BuilderState, formData: FormData): Promise<BuilderState> {
  await requirePermission("admin:content");
  const db = await getDb();
  const chapterId = id.parse(formData.get("chapterId"));
  const res = await renameChapter(db, chapterId, String(formData.get("title") ?? ""));
  if (!res.ok) return { error: res.error };
  await refresh(await programIdFor(db, "chapter", chapterId));
  return {};
}

export async function addLessonAction(_: BuilderState, formData: FormData): Promise<BuilderState> {
  await requirePermission("admin:content");
  const db = await getDb();
  const chapterId = id.parse(formData.get("chapterId"));
  const res = await addLesson(db, chapterId, { title: String(formData.get("title") ?? "") });
  if (!res.ok) return { error: res.error };
  await refresh(await programIdFor(db, "chapter", chapterId));
  return {};
}

export async function moveItemAction(formData: FormData) {
  await requirePermission("admin:content");
  const db = await getDb();
  const k = kind.parse(formData.get("kind"));
  const itemId = id.parse(formData.get("id"));
  const programId = await programIdFor(db, k, itemId);
  await moveItem(db, k, itemId, formData.get("direction") === "up" ? "up" : "down");
  await refresh(programId);
}

export async function deleteItemAction(formData: FormData) {
  await requirePermission("admin:content");
  const db = await getDb();
  const k = kind.parse(formData.get("kind"));
  const itemId = id.parse(formData.get("id"));
  const programId = await programIdFor(db, k, itemId);
  if (k === "module") await deleteModule(db, itemId);
  else if (k === "chapter") await deleteChapter(db, itemId);
  else await deleteLesson(db, itemId);
  await refresh(programId);
}

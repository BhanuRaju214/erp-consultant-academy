import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { aiGenerations } from "@/lib/db/schema";

/** Old AI progress address: now the course's "AI writing" tab. */
export default async function OldAiProgressPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("admin:content");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const gen = await (await getDb()).query.aiGenerations.findFirst({ where: eq(aiGenerations.id, id), columns: { programId: true } });
  if (!gen) notFound();
  redirect(`/admin/programs/${gen.programId}/ai`);
}

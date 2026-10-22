import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { openAiClient } from "@/lib/ai/llm";
import { createCourseFromOutline, runGeneration } from "@/lib/services/ai-course";

export const dynamic = "force-dynamic";

/**
 * Creates the draft course from an approved outline and starts writing its lessons
 * in the background (the request returns immediately; progress is polled).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "admin:content")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const llm = openAiClient();
  if (!llm) return NextResponse.json({ error: "The AI builder isn't set up yet: add OPENAI_API_KEY to the server settings." }, { status: 503 });
  const body = (await req.json().catch(() => null)) as { brief?: unknown; outline?: unknown } | null;
  const db = await getDb();
  const res = await createCourseFromOutline(db, { brief: (body?.brief ?? {}) as never, outline: body?.outline, model: llm.model, createdById: user.id });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  // Fire and forget: the job records its own progress and errors in ai_generations.
  void runGeneration(db, llm, res.value.generationId);
  return NextResponse.json(res.value);
}

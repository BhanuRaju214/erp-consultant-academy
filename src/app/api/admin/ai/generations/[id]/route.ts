import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { aiGenerations } from "@/lib/db/schema";
import { openAiClient } from "@/lib/ai/llm";
import { STALE_AFTER_MS, isRunningHere, requeueFailedLessons, runGeneration } from "@/lib/services/ai-course";

export const dynamic = "force-dynamic";

async function load(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return (await (await getDb()).query.aiGenerations.findFirst({ where: eq(aiGenerations.id, id) })) ?? null;
}

function view(gen: NonNullable<Awaited<ReturnType<typeof load>>>) {
  const stale = gen.status === "generating" && !isRunningHere(gen.id) && (!gen.heartbeatAt || Date.now() - gen.heartbeatAt.getTime() > STALE_AFTER_MS);
  return {
    id: gen.id,
    programId: gen.programId,
    status: gen.status,
    stalled: stale,
    lessonsTotal: gen.lessonsTotal,
    lessonsDone: gen.lessonsDone,
    lessonsFailed: gen.lessonsFailed,
    quizzesTotal: gen.quizzesTotal,
    quizzesDone: gen.quizzesDone,
    quizzesFailed: gen.quizzesFailed,
    promptTokens: gen.promptTokens,
    completionTokens: gen.completionTokens,
    model: gen.model,
    error: gen.error,
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "admin:content")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const gen = await load((await params).id);
  if (!gen) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(view(gen), { headers: { "Cache-Control": "no-store" } });
}

/** { action: "resume" | "retry-failed" | "cancel" } */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "admin:content")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const gen = await load((await params).id);
  if (!gen) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { action } = ((await req.json().catch(() => ({}))) ?? {}) as { action?: string };
  const db = await getDb();

  if (action === "cancel") {
    await db.update(aiGenerations).set({ status: "cancelled" }).where(eq(aiGenerations.id, gen.id));
    return NextResponse.json({ ok: true });
  }
  if (action === "resume" || action === "retry-failed") {
    const llm = openAiClient();
    if (!llm) return NextResponse.json({ error: "Add OPENAI_API_KEY to the server settings first." }, { status: 503 });
    if (action === "retry-failed") await requeueFailedLessons(db, gen.programId);
    await db.update(aiGenerations).set({ status: "generating", error: null }).where(eq(aiGenerations.id, gen.id));
    void runGeneration(db, llm, gen.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

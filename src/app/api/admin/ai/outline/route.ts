import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { openAiClient } from "@/lib/ai/llm";
import { rateLimit } from "@/lib/rate-limit";
import { generateOutline } from "@/lib/services/ai-course";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Drafts a course outline from the admin's brief (nothing is saved yet). */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "admin:content")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const llm = openAiClient();
  if (!llm) return NextResponse.json({ error: "The AI builder isn't set up yet: add OPENAI_API_KEY to the server settings." }, { status: 503 });
  if (!rateLimit(`ai-outline:${user.id}`, 20, 60 * 60_000)) return NextResponse.json({ error: "Too many outline requests this hour. Try again later." }, { status: 429 });
  const body = (await req.json().catch(() => null)) as { brief?: unknown } | null;
  const res = await generateOutline(llm, (body?.brief ?? {}) as never);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ outline: res.value.outline, usage: res.value.usage, model: llm.model });
}

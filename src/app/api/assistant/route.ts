import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { aiConversations, aiMessages } from "@/lib/db/schema";
import { askAssistant } from "@/lib/ai/assistant";
import { retrievePassages } from "@/lib/services/search";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(2, "Ask a question.").max(4000, "Keep questions under 4,000 characters."),
  context: z.object({
    odooVersion: z.enum(["16.0", "17.0", "18.0", "19.0"]).default("17.0"),
    edition: z.enum(["Community", "Enterprise", "Odoo Online"]).default("Community"),
    apps: z.array(z.string().max(40)).max(30).default([]),
    mode: z.enum(["explain", "troubleshoot", "test-scenarios", "spec-review", "interview", "hint", "code"]).default("explain"),
  }),
});

const RETENTION_DAYS = Number(process.env.AI_RETENTION_DAYS ?? 30);

/** POST /api/assistant — one assistant turn. All provider calls happen server-side. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(`ai:${user.id}`, 20, 60_000)) return NextResponse.json({ error: "Too many questions in a minute — slow down a little." }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  const { message, context } = parsed.data;
  const db = await getDb();

  // Retention: purge expired conversations opportunistically.
  await db.delete(aiConversations).where(lt(aiConversations.expiresAt, new Date()));

  let conversationId = parsed.data.conversationId;
  if (conversationId) {
    const conv = await db.query.aiConversations.findFirst({ where: and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, user.id)) });
    if (!conv) conversationId = undefined;
  }
  if (!conversationId) {
    const [conv] = await db
      .insert(aiConversations)
      .values({ userId: user.id, title: message.slice(0, 80), context, expiresAt: new Date(Date.now() + RETENTION_DAYS * 86_400_000) })
      .returning();
    conversationId = conv.id;
  }

  await db.insert(aiMessages).values({ conversationId, role: "user", content: message });
  const history = await db
    .select({ role: aiMessages.role, content: aiMessages.content })
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(asc(aiMessages.createdAt));

  const passages = await retrievePassages(db, message);
  const reply = await askAssistant(
    history.map((h) => ({ role: h.role === "assistant" ? "assistant" : "user", content: h.content })),
    context,
    passages,
  );
  await db.insert(aiMessages).values({ conversationId, role: "assistant", content: reply.content });

  return NextResponse.json({ conversationId, ...reply });
}

/** GET /api/assistant?conversationId=… — load a conversation's messages (owner only). */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = z.string().uuid().safeParse(req.nextUrl.searchParams.get("conversationId"));
  if (!id.success) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const db = await getDb();
  const conv = await db.query.aiConversations.findFirst({ where: and(eq(aiConversations.id, id.data), eq(aiConversations.userId, user.id)) });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const messages = await db
    .select({ role: aiMessages.role, content: aiMessages.content })
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conv.id))
    .orderBy(asc(aiMessages.createdAt));
  return NextResponse.json({ conversation: conv, messages });
}

/** DELETE /api/assistant?conversationId=… — user deletes their own conversation. */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = z.string().uuid().safeParse(req.nextUrl.searchParams.get("conversationId"));
  if (!id.success) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await (await getDb()).delete(aiConversations).where(and(eq(aiConversations.id, id.data), eq(aiConversations.userId, user.id)));
  return NextResponse.json({ ok: true });
}

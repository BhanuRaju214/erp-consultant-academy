import Link from "next/link";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { aiConversations, aiMessages } from "@/lib/db/schema";
import { AssistantChat } from "@/components/assistant-chat";
import { Card, CardTitle, PageHeader, cn } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

export const metadata = { title: "AI Learning Assistant" };

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  await requireCourseUser();
  const user = await requireUser();
  const db = await getDb();
  const { c } = await searchParams;
  const conversations = await db
    .select({ id: aiConversations.id, title: aiConversations.title, createdAt: aiConversations.createdAt })
    .from(aiConversations)
    .where(and(eq(aiConversations.userId, user.id), gt(aiConversations.expiresAt, new Date())))
    .orderBy(desc(aiConversations.createdAt))
    .limit(30);
  const active = c && conversations.find((x) => x.id === c) ? c : undefined;
  const messages = active
    ? await db
        .select({ role: aiMessages.role, content: aiMessages.content })
        .from(aiMessages)
        .where(eq(aiMessages.conversationId, active))
        .orderBy(asc(aiMessages.createdAt))
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Learning Assistant"
        description="Grounded in the academy's lessons and documentation. It cites portal sources, flags version/edition-sensitive answers, and tells you when something must be validated in your training environment. It must not invent Odoo menus, features or APIs — if an answer looks off, check the official documentation."
      />
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Card className="h-fit p-4">
          <CardTitle className="text-sm">Conversations</CardTitle>
          <Link href="/assistant" className="mt-3 block rounded-lg bg-primary-soft px-3 py-2 text-sm font-medium text-primary">
            + New conversation
          </Link>
          <ul className="mt-2 space-y-1">
            {conversations.map((x) => (
              <li key={x.id}>
                <Link
                  href={`/assistant?c=${x.id}`}
                  className={cn("block truncate rounded-lg px-3 py-1.5 text-sm", x.id === active ? "bg-surface-2 font-medium text-fg" : "text-muted hover:bg-surface-2")}
                >
                  {x.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Conversations are kept for {process.env.AI_RETENTION_DAYS ?? 30} days, then deleted.</p>
        </Card>
        <AssistantChat
          key={active ?? "new"}
          conversationId={active}
          initialMessages={messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }))}
          aiConfigured={Boolean(process.env.OPENAI_API_KEY)}
        />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { aiGenerations } from "@/lib/db/schema";
import { STALE_AFTER_MS, isRunningHere } from "@/lib/services/ai-course";
import { GenerationProgress } from "@/components/ai-course-builder";
import { Card } from "@/components/ui";

export const metadata = { title: "AI writing" };
export const dynamic = "force-dynamic";

/** AI writing tab: progress of the latest AI job for this course (lessons, then module quizzes). */
export default async function CourseAiPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("admin:content");
  const { id } = await params;
  const gen = await (await getDb()).query.aiGenerations.findFirst({ where: eq(aiGenerations.programId, id), orderBy: [desc(aiGenerations.createdAt)] });
  if (!gen) notFound();
  const stalled = gen.status === "generating" && !isRunningHere(gen.id) && (!gen.heartbeatAt || Date.now() - gen.heartbeatAt.getTime() > STALE_AFTER_MS);

  return (
    <Card>
      <p className="mb-5 text-sm text-muted">Lessons are written one at a time, then one graded quiz per module. You can leave this page; writing continues on the server.</p>
      <GenerationProgress
        id={gen.id}
        initial={{
          id: gen.id,
          programId: gen.programId,
          status: gen.status,
          stalled,
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
        }}
      />
    </Card>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { courses, programs } from "@/lib/db/schema";
import { courseAiEnabled } from "@/lib/ai/llm";
import { quizHref } from "@/lib/services/player";
import { getModuleQuiz } from "@/lib/services/quizzes";
import { DeleteQuizForm, GenerateQuizForm, QuestionForm, QuestionItem, QuizSettingsForm } from "@/components/quiz-editor";
import { ButtonLink, Callout, Card, CardTitle, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Module quiz" };
export const dynamic = "force-dynamic";

/** Graded quiz editor for one module of a course built in the course builder. */
export default async function ModuleQuizPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  await requirePermission("admin:content");
  const { id, moduleId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(moduleId)) notFound();
  const db = await getDb();
  const program = await db.query.programs.findFirst({ where: eq(programs.id, id) });
  const mod = await db.query.courses.findFirst({ where: and(eq(courses.id, moduleId), eq(courses.programId, id)) });
  if (!program || !mod) notFound();
  const quiz = await getModuleQuiz(db, moduleId);
  const list = quiz?.questions ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        compact
        eyebrow={<Link href={`/admin/programs/${id}`}>← Content · {mod.title}</Link>}
        title="Module quiz"
        description="A graded quiz at the end of the module. Learners need to pass every module quiz (and finish every lesson) to earn the course certificate."
        actions={
          list.length > 0 && mod.published ? (
            <ButtonLink href={quizHref(program.slug, mod.slug)} variant="secondary">
              <ExternalLink className="h-4 w-4" /> Preview as learner
            </ButtonLink>
          ) : undefined
        }
      />
      {!mod.published && <Callout tone="info">This module is hidden, so its quiz doesn&apos;t count towards the certificate until you make the module visible.</Callout>}

      <Card>
        <CardTitle>Write with AI</CardTitle>
        <p className="mb-4 mt-1 text-sm text-muted">The AI reads this module&apos;s lessons and writes questions with answers and explanations. Always review them before publishing.</p>
        <GenerateQuizForm moduleId={moduleId} enabled={courseAiEnabled()} hasQuestions={list.length > 0} />
      </Card>

      <Card>
        <CardTitle>Settings</CardTitle>
        <div className="mt-4">
          <QuizSettingsForm moduleId={moduleId} title={quiz?.title ?? `${mod.title}: quiz`} passMark={quiz?.passMark ?? 70} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Questions ({list.length})</CardTitle>
          {quiz && <DeleteQuizForm moduleId={moduleId} />}
        </div>
        <div className="mt-4">
          {list.length === 0 ? (
            <EmptyState title="No questions yet">Write the quiz with the AI above, or add questions by hand below.</EmptyState>
          ) : (
            <ol className="space-y-3">
              {list.map((q, i) => (
                <QuestionItem
                  key={q.id}
                  moduleId={moduleId}
                  index={i}
                  first={i === 0}
                  last={i === list.length - 1}
                  question={{ id: q.id, prompt: q.prompt, kind: q.kind, options: q.options, correct: q.correct, explanation: q.explanation }}
                />
              ))}
            </ol>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Add a question</CardTitle>
        <div className="mt-4">
          <QuestionForm moduleId={moduleId} />
        </div>
      </Card>
    </div>
  );
}

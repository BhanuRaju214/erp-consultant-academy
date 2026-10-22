import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { requireProgramUser } from "@/lib/auth/course-access";
import { getDb } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { getProgramPlayer } from "@/lib/services/player";
import { getProgramBySlug } from "@/lib/services/programs";
import { QuizRunner } from "@/components/quiz-runner";
import { Badge, Callout, PageHeader } from "@/components/ui";

export const metadata = { title: "Module quiz" };

/** Graded end-of-module quiz for courses built in the course builder. */
export default async function ProgramQuizPage({ params }: { params: Promise<{ slug: string; module: string }> }) {
  const { slug, module } = await params;
  const user = await requireProgramUser(slug);
  const db = await getDb();
  const program = await getProgramBySlug(db, slug);
  if (!program) notFound();
  const player = await getProgramPlayer(db, program, user.id);
  const mod = player.modules.find((m) => m.slug === module);
  if (!mod?.quiz) notFound();
  // Never send the answer key to the browser.
  const qs = await db
    .select({ id: questions.id, prompt: questions.prompt, kind: questions.kind, options: questions.options })
    .from(questions)
    .where(eq(questions.assessmentId, mod.quiz.id))
    .orderBy(asc(questions.position));
  const lessons = mod.chapters.flatMap((c) => c.lessons);
  const remaining = lessons.filter((l) => player.statusByLesson.get(l.id) !== "completed").length;
  const backHref = `/programs/${slug}`;

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href={backHref} className="hover:text-primary hover:underline">
          {program.title}
        </Link>{" "}
        / {mod.title}
      </nav>
      <PageHeader
        compact
        title={mod.quiz.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {qs.length} questions · pass mark {mod.quiz.passMark}% · multiple-select questions score only when every correct option is chosen. Retake as often as you like; your best score counts.
            {mod.quiz.best !== null && <Badge tone={mod.quiz.passed ? "success" : "warning"}>Best so far: {mod.quiz.best}%</Badge>}
          </span>
        }
      />
      {remaining > 0 && (
        <div className="mb-5">
          <Callout tone="info">
            You still have {remaining} lesson{remaining === 1 ? "" : "s"} to finish in this module. You can take the quiz now, but reading them first helps.
          </Callout>
        </div>
      )}
      <QuizRunner assessmentId={mod.quiz.id} passMark={mod.quiz.passMark} questions={qs} backHref={backHref} />
    </div>
  );
}

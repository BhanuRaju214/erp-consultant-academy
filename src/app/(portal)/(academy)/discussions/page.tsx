import Link from "next/link";
import { asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { courseModules, courses, discussions, lessons, users } from "@/lib/db/schema";
import { resolveDiscussion } from "@/app/actions/learning";
import { AskQuestionForm, ReplyForm } from "@/components/lesson-client";
import { Badge, Card, CardTitle, EmptyState, PageHeader, buttonClass } from "@/components/ui";
import { requireCourseUser } from "@/lib/auth/course-access";

export const metadata = { title: "Discussions" };

export default async function DiscussionsPage() {
  await requireCourseUser();
  const user = await requireUser();
  const db = await getDb();
  const threads = await db
    .select({
      id: discussions.id,
      userId: discussions.userId,
      title: discussions.title,
      body: discussions.body,
      resolved: discussions.resolved,
      createdAt: discussions.createdAt,
      author: users.name,
      authorRole: users.role,
      lessonTitle: lessons.title,
      lessonSlug: lessons.slug,
      courseSlug: courses.slug,
    })
    .from(discussions)
    .innerJoin(users, eq(users.id, discussions.userId))
    .leftJoin(lessons, eq(lessons.id, discussions.lessonId))
    .leftJoin(courseModules, eq(courseModules.id, lessons.moduleId))
    .leftJoin(courses, eq(courses.id, courseModules.courseId))
    .where(isNull(discussions.parentId))
    .orderBy(asc(discussions.resolved), desc(discussions.createdAt))
    .limit(100);
  const replies = threads.length
    ? await db
        .select({ id: discussions.id, parentId: discussions.parentId, body: discussions.body, createdAt: discussions.createdAt, author: users.name, authorRole: users.role })
        .from(discussions)
        .innerJoin(users, eq(users.id, discussions.userId))
        .where(inArray(discussions.parentId, threads.map((t) => t.id)))
        .orderBy(asc(discussions.createdAt))
    : [];
  const isTrainer = can(user.role, "trainer:review");

  return (
    <div className="space-y-6">
      <PageHeader title="Discussions & doubt resolution" description="Ask questions, help fellow trainees, and get answers from trainers. Never post real customer data, credentials or API keys." />
      <Card>
        <CardTitle>Ask a new question</CardTitle>
        <div className="mt-3">
          <AskQuestionForm />
        </div>
      </Card>
      {threads.length === 0 && <EmptyState title="No questions yet">Be the first to ask.</EmptyState>}
      <ul className="space-y-4">
        {threads.map((t) => (
          <li key={t.id} id={t.id} className="scroll-mt-20">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-fg">{t.title}</h2>
                  <p className="text-xs text-muted">
                    {t.author}
                    {t.authorRole !== "student" && <span className="capitalize"> ({t.authorRole})</span>} · {t.createdAt.toLocaleString()}
                    {t.lessonTitle && (
                      <>
                        {" "}
                        · on{" "}
                        <Link href={`/courses/${t.courseSlug}/${t.lessonSlug}`} className="text-primary hover:underline">
                          {t.lessonTitle}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {t.resolved ? <Badge tone="success">Resolved</Badge> : <Badge tone="warning">Open</Badge>}
                  {(t.userId === user.id || isTrainer) && (
                    <form action={resolveDiscussion.bind(null, t.id)}>
                      <button className={buttonClass("ghost", "px-2 py-1 text-xs")}>{t.resolved ? "Reopen" : "Mark resolved"}</button>
                    </form>
                  )}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-fg">{t.body}</p>
              <ul className="mt-3 space-y-2 border-l-2 border-border pl-4">
                {replies
                  .filter((r) => r.parentId === t.id)
                  .map((r) => (
                    <li key={r.id} className="text-sm">
                      <p className="whitespace-pre-line text-fg">{r.body}</p>
                      <p className="text-xs text-muted">
                        {r.author}
                        {r.authorRole !== "student" && (
                          <Badge tone="primary" className="ml-1 capitalize">
                            {r.authorRole}
                          </Badge>
                        )}{" "}
                        · {r.createdAt.toLocaleString()}
                      </p>
                    </li>
                  ))}
              </ul>
              <ReplyForm parentId={t.id} />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bookmarks, courseModules, courses, lessons, notes } from "@/lib/db/schema";
import { getStudentDashboard } from "@/lib/services/dashboard";
import { listScenariosWithProgress } from "@/lib/services/practice";
import { SimpleBarChart } from "@/components/charts";
import { PrintButton } from "@/components/print-button";
import { Badge, Card, CardTitle, EmptyState, PageHeader, ProgressBar } from "@/components/ui";

export const metadata = { title: "Progress & Reports" };

export default async function ProgressPage() {
  const user = await requireUser();
  const db = await getDb();
  const [d, scenarios, myBookmarks, myNotes] = await Promise.all([
    getStudentDashboard(db, user.id),
    listScenariosWithProgress(db, user.id),
    db
      .select({ title: lessons.title, lessonSlug: lessons.slug, courseSlug: courses.slug, courseTitle: courses.title })
      .from(bookmarks)
      .innerJoin(lessons, eq(lessons.id, bookmarks.lessonId))
      .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
      .innerJoin(courses, eq(courses.id, courseModules.courseId))
      .where(eq(bookmarks.userId, user.id))
      .orderBy(desc(bookmarks.createdAt)),
    db
      .select({ body: notes.body, updatedAt: notes.updatedAt, title: lessons.title, lessonSlug: lessons.slug, courseSlug: courses.slug })
      .from(notes)
      .innerJoin(lessons, eq(lessons.id, notes.lessonId))
      .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
      .innerJoin(courses, eq(courses.id, courseModules.courseId))
      .where(eq(notes.userId, user.id))
      .orderBy(desc(notes.updatedAt)),
  ]);

  const chart = d.allCourses.map((c) => ({ course: c.title, completed: c.totalLessons ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0 }));

  return (
    <div className="space-y-6">
      <PageHeader title="Progress & Reports" description="Your learning record across courses, labs, assessments and projects." actions={<PrintButton label="Print report" />} />

      <Card>
        <CardTitle>Course completion (%)</CardTitle>
        <SimpleBarChart data={chart} xKey="course" yKey="completed" layout="vertical" height={Math.max(240, chart.length * 34)} label="Completion percentage per course" />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Courses</CardTitle>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="py-2 font-medium">Course</th>
                <th className="py-2 font-medium">Lessons</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {d.allCourses.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 pr-3">
                    <Link href={`/courses/${c.slug}`} className="text-fg hover:text-primary">
                      {c.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-muted">
                    {c.completedLessons}/{c.totalLessons}
                  </td>
                  <td className="py-2">
                    {c.completedLessons === c.totalLessons && c.totalLessons > 0 ? (
                      <Badge tone="success">Completed</Badge>
                    ) : c.completedLessons > 0 ? (
                      <Badge tone="info">In progress</Badge>
                    ) : (
                      <Badge>Not started</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardTitle>Configuration lab</CardTitle>
            <ul className="mt-3 space-y-3">
              {scenarios.map((s) => (
                <li key={s.id}>
                  <div className="flex justify-between text-sm">
                    <Link href={`/config-lab/${s.slug}`} className="text-fg hover:text-primary">
                      {s.title}
                    </Link>
                    <span className="text-muted">
                      {s.doneSteps}/{s.totalSteps}
                    </span>
                  </div>
                  <ProgressBar value={s.totalSteps ? (s.doneSteps / s.totalSteps) * 100 : 0} className="mt-1" label={`${s.title} progress`} />
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle>Assessment history (best scores)</CardTitle>
            <ul className="mt-3 divide-y divide-border text-sm">
              {d.scores.map((s) => (
                <li key={s.assessmentId} className="flex justify-between py-2">
                  <span className="text-fg">{s.title}</span>
                  <Badge tone={s.best >= s.passMark ? "success" : "danger"}>{s.best}%</Badge>
                </li>
              ))}
              {!d.scores.length && <li className="py-2 text-muted">No attempts yet.</li>}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card id="bookmarks">
          <CardTitle>Bookmarks</CardTitle>
          {myBookmarks.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {myBookmarks.map((b) => (
                <li key={b.courseSlug + b.lessonSlug}>
                  <Link href={`/courses/${b.courseSlug}/${b.lessonSlug}`} className="text-primary hover:underline">
                    {b.title}
                  </Link>{" "}
                  <span className="text-xs text-muted">· {b.courseTitle}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <EmptyState title="No bookmarks">Bookmark lessons you want to revisit.</EmptyState>
            </div>
          )}
        </Card>
        <Card id="notes">
          <CardTitle>My notes</CardTitle>
          {myNotes.length ? (
            <ul className="mt-3 space-y-3 text-sm">
              {myNotes.map((n) => (
                <li key={n.courseSlug + n.lessonSlug}>
                  <Link href={`/courses/${n.courseSlug}/${n.lessonSlug}`} className="font-medium text-fg hover:text-primary">
                    {n.title}
                  </Link>
                  <p className="mt-0.5 line-clamp-3 whitespace-pre-line text-muted">{n.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <EmptyState title="No notes yet">Notes you take on lessons appear here.</EmptyState>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

import { asc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { testCases } from "@/lib/db/schema";
import { listCoursesWithProgress } from "@/lib/services/learning";
import { summariseTests } from "@/lib/services/practice";
import { SECTION_META } from "@/lib/nav";
import { CourseCard } from "@/components/course-card";
import { NewTestCaseForm, TestRegister } from "@/components/test-register";
import { Card, CardTitle, PageHeader, ProgressBar, Stat } from "@/components/ui";

export const metadata = { title: "Testing & Quality Assurance" };

export default async function TestingPage() {
  const user = await requireUser();
  const db = await getDb();
  const [courses, rows] = await Promise.all([
    listCoursesWithProgress(db, user.id, "testing"),
    db.select().from(testCases).where(eq(testCases.userId, user.id)).orderBy(asc(testCases.code)),
  ]);
  const s = summariseTests(rows);

  return (
    <div className="space-y-6">
      <PageHeader title="Testing & Quality Assurance" description={SECTION_META.testing.intro} />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>

      <section id="register" className="scroll-mt-20 space-y-4">
        <h2 className="text-xl font-semibold text-fg">My test register</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Stat label="Test cases" value={s.total} />
          <Stat label="Passed" value={s.pass} />
          <Stat label="Failed" value={s.fail} />
          <Stat label="Blocked" value={s.blocked} />
          <Stat label="Not run" value={s.notRun} />
        </div>
        {s.total > 0 && (
          <Card>
            <CardTitle>Testing summary</CardTitle>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex justify-between text-sm text-muted">
                  <span>Execution rate</span>
                  <span>{s.executionRate}%</span>
                </div>
                <ProgressBar value={s.executionRate} className="mt-1" label="Execution rate" />
              </div>
              <div>
                <div className="flex justify-between text-sm text-muted">
                  <span>Pass rate (of executed)</span>
                  <span>{s.passRate}%</span>
                </div>
                <ProgressBar value={s.passRate} className="mt-1" label="Pass rate" />
              </div>
            </div>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted">
                  <th className="py-2 font-medium">Module</th>
                  <th className="py-2 font-medium">Total</th>
                  <th className="py-2 font-medium">Pass</th>
                  <th className="py-2 font-medium">Fail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.modules.map((m) => (
                  <tr key={m.module}>
                    <td className="py-1.5 text-fg">{m.module}</td>
                    <td className="py-1.5 text-muted">{m.total}</td>
                    <td className="py-1.5 text-success">{m.pass}</td>
                    <td className="py-1.5 text-danger">{m.fail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted">
              Exit criteria suggestion: 100% of Must-have requirement tests executed, no open critical/high defects, pass rate ≥ 95% before UAT sign-off.
            </p>
          </Card>
        )}
        <NewTestCaseForm />
        <TestRegister rows={rows} />
      </section>
    </div>
  );
}

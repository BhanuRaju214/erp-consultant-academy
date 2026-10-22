import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { programs } from "@/lib/db/schema";
import { listEnrollments } from "@/lib/services/programs";
import { reEnrollAction, revokeEnrollmentAction } from "@/app/actions/programs";
import { EnrollUserForm } from "@/components/program-forms";
import { Badge, Card, buttonClass } from "@/components/ui";

export const metadata = { title: "Course learners" };
export const dynamic = "force-dynamic";

const SOURCE_LABEL = { auto: "Existing user", admin: "Added by admin", self: "Self-enrolled", purchase: "Purchased" } as const;

/** Learners tab: who is enrolled, add by email, remove or restore access. */
export default async function CourseLearnersPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("admin:content");
  const { id } = await params;
  const db = await getDb();
  const program = await db.query.programs.findFirst({ where: eq(programs.id, id) });
  if (!program) notFound();
  const people = await listEnrollments(db, program.id);

  return (
    <Card>
      <p className="text-sm text-muted">Add a learner by email. Trainers and admins can open every course without being enrolled.</p>
      <div className="mt-4">
        <EnrollUserForm programId={program.id} />
      </div>
      {people.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No learners yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-medium">Learner</th>
                <th className="py-2 pr-3 font-medium">How</th>
                <th className="py-2 pr-3 font-medium">Since</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.userId} className="border-b border-border last:border-0">
                  <td className="py-2 pr-3">
                    <div className="text-fg">{p.name}</div>
                    <div className="text-xs text-muted">
                      {p.email} · <span className="capitalize">{p.role}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-muted">{SOURCE_LABEL[p.source]}</td>
                  <td className="whitespace-nowrap py-2 pr-3 text-muted">{p.enrolledAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="py-2 pr-3">{p.revokedAt ? <Badge tone="danger">Removed</Badge> : <Badge tone="success">Active</Badge>}</td>
                  <td className="py-2 text-right">
                    <form action={p.revokedAt ? reEnrollAction : revokeEnrollmentAction}>
                      <input type="hidden" name="programId" value={program.id} />
                      <input type="hidden" name="userId" value={p.userId} />
                      <input type="hidden" name="email" value={p.email} />
                      <button type="submit" className={buttonClass(p.revokedAt ? "secondary" : "ghost", "px-2 py-1 text-xs")}>
                        {p.revokedAt ? "Re-enroll" : "Remove access"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

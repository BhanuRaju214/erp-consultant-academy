import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listProgramsForAdmin } from "@/lib/services/programs";
import { Badge, ButtonLink, Card, EmptyState, PageHeader, buttonClass, inputClass } from "@/components/ui";

export const metadata = { title: "Courses" };
export const dynamic = "force-dynamic";

const STATUS_TONE = { published: "success", draft: "warning", archived: "neutral" } as const;
const STATUSES = ["all", "published", "draft", "archived"] as const;

function access(mode: string, pricePaise: number | null) {
  if (mode === "paid") return pricePaise ? `₹${(pricePaise / 100).toLocaleString("en-IN")}` : "Paid";
  return mode === "open" ? "Free" : "Invite only";
}

/** All courses. Open one to manage its content, details, learners and AI writing. */
export default async function AdminProgramsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requirePermission("admin:content");
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const status = STATUSES.includes(sp.status as (typeof STATUSES)[number]) ? (sp.status as (typeof STATUSES)[number]) : "all";
  const all = await listProgramsForAdmin(await getDb());
  const rows = all.filter(({ program }) => (status === "all" || program.status === status) && (!q || program.title.toLowerCase().includes(q) || program.slug.includes(q)));

  return (
    <div className="space-y-6">
      <PageHeader
        compact
        title="Courses"
        description="Open a course to manage its modules, lessons, quizzes, details, price and learners."
        actions={
          <ButtonLink href="/admin/programs/new">
            <Plus className="h-4 w-4" /> New course
          </ButtonLink>
        }
      />
      <form className="flex flex-col gap-2 sm:flex-row" action="/admin/programs">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="course-q" className="sr-only">
            Search courses
          </label>
          <input id="course-q" name="q" defaultValue={sp.q ?? ""} placeholder="Search courses" className={`${inputClass} pl-9`} />
        </div>
        <label htmlFor="course-status" className="sr-only">
          Status
        </label>
        <select id="course-status" name="status" defaultValue={status} className={`${inputClass} sm:w-44`}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button className={buttonClass("secondary")}>Filter</button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title={all.length ? "No courses match" : "No courses yet"}>{all.length ? "Try another search or status." : "Create your first course."}</EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0!">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-2 font-semibold">Course</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Access</th>
                <th className="px-4 py-2 font-semibold">Modules</th>
                <th className="px-4 py-2 font-semibold">Lessons</th>
                <th className="px-4 py-2 font-semibold">Learners</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ program, enrolled, subCourses, lessons }) => (
                <tr key={program.id} className="border-t border-border hover:bg-surface-2/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/programs/${program.id}`} className="font-semibold text-primary hover:underline">
                      {program.title}
                    </Link>
                    <div className="text-xs text-muted">/catalog/{program.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[program.status]} className="capitalize">
                      {program.status}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{access(program.enrollmentMode, program.pricePaise)}</td>
                  <td className="px-4 py-3 text-fg">{subCourses}</td>
                  <td className="px-4 py-3 text-fg">{lessons}</td>
                  <td className="px-4 py-3 text-fg">{enrolled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

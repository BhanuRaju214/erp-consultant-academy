import Link from "next/link";
import { asc, lt, sql } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { aiConversations, courses, erpPlatforms, users } from "@/lib/db/schema";
import { purgeExpiredAiConversations, refreshCourseFromSource, syncNewContent, updateCourseAction, updateUserAction } from "@/app/actions/admin";
import { CreateUserForm } from "@/components/admin-forms";
import { Badge, Card, CardTitle, PageHeader, buttonClass, inputClass } from "@/components/ui";

export const metadata = { title: "Admin Console" };

export default async function AdminPage() {
  const admin = await requirePermission("admin:users");
  const db = await getDb();
  const [allUsers, allCourses, platforms, [{ expired }]] = await Promise.all([
    db.select().from(users).orderBy(asc(users.role), asc(users.name)),
    db.select().from(courses).orderBy(asc(courses.section), asc(courses.position)),
    db.select().from(erpPlatforms).orderBy(asc(erpPlatforms.name)),
    db.select({ expired: sql<number>`count(*)::int` }).from(aiConversations).where(lt(aiConversations.expiresAt, new Date())),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={<Link href="/trainer">Admin & Trainer Management</Link>} title="Admin console" description="Manage users and roles, publish and edit course content, and review platform settings." />

      <Card>
        <CardTitle>Create user</CardTitle>
        <div className="mt-3">
          <CreateUserForm />
        </div>
      </Card>

      <Card>
        <CardTitle>Users & roles ({allUsers.length})</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="py-2 pr-3 font-medium">User</th>
                <th className="py-2 pr-3 font-medium">Role / status</th>
                <th className="py-2 font-medium">Last login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allUsers.map((u) => (
                <tr key={u.id}>
                  <td className="py-2 pr-3">
                    <div className="font-medium text-fg">{u.name}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </td>
                  <td className="py-2 pr-3">
                    {u.id === admin.id ? (
                      <Badge tone="warning">admin (you)</Badge>
                    ) : (
                      <form action={updateUserAction} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <label className="sr-only" htmlFor={`role-${u.id}`}>
                          Role
                        </label>
                        <select id={`role-${u.id}`} name="role" defaultValue={u.role} className={`${inputClass} w-auto py-1`}>
                          <option value="student">student</option>
                          <option value="trainer">trainer</option>
                          <option value="admin">admin</option>
                        </select>
                        <label className="sr-only" htmlFor={`active-${u.id}`}>
                          Status
                        </label>
                        <select id={`active-${u.id}`} name="active" defaultValue={String(u.active)} className={`${inputClass} w-auto py-1`}>
                          <option value="true">active</option>
                          <option value="false">deactivated</option>
                        </select>
                        <button className={buttonClass("secondary", "py-1 text-xs")}>Save</button>
                      </form>
                    )}
                  </td>
                  <td className="py-2 text-xs text-muted">{u.lastLoginAt?.toLocaleString() ?? "never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Courses & content</CardTitle>
            <p className="mt-1 text-sm text-muted">Unpublished courses are hidden from trainees. The certificate threshold applies to the course&apos;s final assessment.</p>
          </div>
          <form action={syncNewContent}>
            <button
              className={buttonClass("secondary", "text-xs")}
              title="Adds new courses, projects, processes and documents from the source files and refreshes project and business-process pages. Existing lessons, edits and learner progress are not touched."
            >
              Sync new content
            </button>
          </form>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted">
                <th className="py-2 pr-3 font-medium">Course</th>
                <th className="py-2 pr-3 font-medium">Section</th>
                <th className="py-2 pr-3 font-medium">Settings</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allCourses.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 pr-3 font-medium text-fg">{c.title}</td>
                  <td className="py-2 pr-3 text-muted">{c.section}</td>
                  <td className="py-2 pr-3">
                    <form action={updateCourseAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="courseId" value={c.id} />
                      <label className="sr-only" htmlFor={`pub-${c.id}`}>
                        Published
                      </label>
                      <select id={`pub-${c.id}`} name="published" defaultValue={String(c.published)} className={`${inputClass} w-auto py-1`}>
                        <option value="true">published</option>
                        <option value="false">hidden</option>
                      </select>
                      <label htmlFor={`cert-${c.id}`} className="text-xs text-muted">
                        cert ≥
                      </label>
                      <input id={`cert-${c.id}`} name="certMinScore" type="number" min={0} max={100} defaultValue={c.certMinScore} className={`${inputClass} w-20 py-1`} />
                      <button className={buttonClass("secondary", "py-1 text-xs")}>Save</button>
                    </form>
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/courses/${c.slug}`} className="text-primary hover:underline">
                        Edit lessons
                      </Link>
                      <form action={refreshCourseFromSource}>
                        <input type="hidden" name="slug" value={c.slug} />
                        <button
                          className="text-xs text-muted underline-offset-2 hover:text-fg hover:underline"
                          title="Update this course from the content files. Keeps learner progress; overwrites lesson-editor changes to this course."
                        >
                          Refresh from source
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>ERP platforms</CardTitle>
          <p className="mt-1 text-sm text-muted">Courses are linked to a platform, so new ERP tracks can be added as content without changing the portal architecture.</p>
          <ul className="mt-3 divide-y divide-border text-sm">
            {platforms.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span className="text-fg">
                  {p.name} <span className="text-xs text-muted">({p.vendor})</span>
                </span>
                {p.active ? <Badge tone="success">Active · {p.defaultVersion}</Badge> : <Badge>Planned</Badge>}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>AI assistant data retention</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Conversations expire after AI_RETENTION_DAYS (default 30) and are purged automatically on new activity. {expired} expired conversation(s) are pending
            purge.
          </p>
          <form action={purgeExpiredAiConversations} className="mt-3">
            <button className={buttonClass("secondary")}>Purge expired conversations now</button>
          </form>
        </Card>
      </div>
    </div>
  );
}

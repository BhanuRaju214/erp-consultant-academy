import { asc } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { updateUserAction } from "@/app/actions/admin";
import { CreateUserForm } from "@/components/admin-forms";
import { Badge, Card, CardTitle, PageHeader, buttonClass, inputSmClass } from "@/components/ui";

export const metadata = { title: "Users" };

const ROLE_TONE = { admin: "warning", trainer: "info", student: "neutral" } as const;

export default async function AdminUsersPage() {
  const admin = await requirePermission("admin:users");
  const allUsers = await (await getDb()).select().from(users).orderBy(asc(users.role), asc(users.name));

  return (
    <div className="space-y-6">
      <PageHeader compact title="Users" description="Create accounts, change roles and deactivate access." />

      <Card>
        <CardTitle>Create user</CardTitle>
        <div className="mt-4">
          <CreateUserForm />
        </div>
      </Card>

      <Card className="overflow-hidden p-0!">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <CardTitle>All users</CardTitle>
          <span className="text-sm text-muted">{allUsers.length} accounts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Change role / status</th>
                <th className="px-6 py-3">Last login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-surface-2/50">
                  <td className="px-6 py-3">
                    <div className="font-semibold text-fg">{u.name}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={ROLE_TONE[u.role]} className="capitalize">
                        {u.role}
                      </Badge>
                      {!u.active && <Badge tone="danger">Deactivated</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {u.id === admin.id ? (
                      <span className="text-xs text-muted">This is you</span>
                    ) : (
                      <form action={updateUserAction} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <label className="sr-only" htmlFor={`role-${u.id}`}>
                          Role
                        </label>
                        <select id={`role-${u.id}`} name="role" defaultValue={u.role} className={inputSmClass}>
                          <option value="student">Student</option>
                          <option value="trainer">Trainer</option>
                          <option value="admin">Admin</option>
                        </select>
                        <label className="sr-only" htmlFor={`active-${u.id}`}>
                          Status
                        </label>
                        <select id={`active-${u.id}`} name="active" defaultValue={String(u.active)} className={inputSmClass}>
                          <option value="true">Active</option>
                          <option value="false">Deactivated</option>
                        </select>
                        <button className={buttonClass("secondary", "px-3 py-1.5 text-xs")}>Save</button>
                      </form>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-xs text-muted">
                    {u.lastLoginAt ? u.lastLoginAt.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

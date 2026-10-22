import { requireUser } from "@/lib/auth";
import { AdminFrame } from "@/components/admin-frame";

/** Admin and trainer pages share the admin header and section tabs. Each page still checks its own permission. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <AdminFrame role={user.role}>{children}</AdminFrame>;
}

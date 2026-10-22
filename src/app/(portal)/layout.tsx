import { requireUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { ContentShell } from "@/components/content-shell";
import { SiteFooter } from "@/components/site-footer";
import { getDb } from "@/lib/db";
import { buildNavTree } from "@/lib/services/nav-tree";
import { FLAGSHIP_PROGRAM, canAccessProgram } from "@/lib/services/programs";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const db = await getDb();
  const hasCourse = await canAccessProgram(db, user, FLAGSHIP_PROGRAM.slug);
  // Lesson titles for the course sidebar are only sent to people who can open the course.
  const navTree = hasCourse ? await buildNavTree(db, user) : {};
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:p-2">
        Skip to content
      </a>
      {/* The sidebar only renders inside the course (see isCoursePath). */}
      <Sidebar role={user.role} tree={navTree} courseTitle={FLAGSHIP_PROGRAM.title} />
      <ContentShell
        header={<TopNav user={{ name: user.name, email: user.email, role: user.role }} hasCourse={hasCourse} isStaff={can(user.role, "trainer:dashboard")} />}
        footer={<SiteFooter />}
      >
        {children}
      </ContentShell>
    </div>
  );
}

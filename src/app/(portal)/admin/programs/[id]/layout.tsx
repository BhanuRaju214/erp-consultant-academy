import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { eq, sql } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { aiGenerations, enrollments, programs } from "@/lib/db/schema";
import { CourseAdminTabs } from "@/components/course-admin-tabs";
import { Badge, ButtonLink } from "@/components/ui";

const STATUS_TONE = { published: "success", draft: "warning", archived: "neutral" } as const;

/** Every admin page of one course shares this header and its sub-tabs. */
export default async function CourseAdminLayout({ params, children }: { params: Promise<{ id: string }>; children: ReactNode }) {
  await requirePermission("admin:content");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = await getDb();
  const program = await db.query.programs.findFirst({ where: eq(programs.id, id) });
  if (!program) notFound();
  const [[{ learners }], [{ ai }]] = await Promise.all([
    db.select({ learners: sql<number>`count(*)::int` }).from(enrollments).where(sql`${enrollments.programId} = ${id} and ${enrollments.revokedAt} is null`),
    db.select({ ai: sql<number>`count(*)::int` }).from(aiGenerations).where(eq(aiGenerations.programId, id)),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link href="/admin/programs" className="text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:underline">
            ← All courses
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-fg">{program.title}</h2>
            <Badge tone={STATUS_TONE[program.status]} className="capitalize">
              {program.status}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <ButtonLink href={program.homePath} variant="secondary">
            <ExternalLink className="h-4 w-4" /> Preview as learner
          </ButtonLink>
          <ButtonLink href={`/catalog/${program.slug}`} variant="secondary">
            Course page
          </ButtonLink>
        </div>
      </div>
      <CourseAdminTabs programId={program.id} learners={learners} hasAi={ai > 0} />
      {children}
    </div>
  );
}

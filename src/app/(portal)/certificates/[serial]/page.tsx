import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { GraduationCap } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { certificates, courses, users } from "@/lib/db/schema";
import { PrintButton } from "@/components/print-button";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND, copyrightLine } from "@/lib/brand";

export const metadata = { title: "Certificate" };

export default async function CertificatePage({ params }: { params: Promise<{ serial: string }> }) {
  const { serial } = await params;
  const viewer = await requireUser();
  const db = await getDb();
  const [row] = await db
    .select({ serial: certificates.serial, issuedAt: certificates.issuedAt, score: certificates.score, userId: users.id, name: users.name, course: courses.title, level: courses.level })
    .from(certificates)
    .innerJoin(users, eq(users.id, certificates.userId))
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .where(eq(certificates.serial, serial))
    .limit(1);
  if (!row || (row.userId !== viewer.id && !can(viewer.role, "trainer:dashboard"))) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex justify-end no-print">
        <PrintButton />
      </div>
      <div className="rounded-2xl border-4 border-double border-primary/40 bg-surface p-10 text-center shadow-sm sm:p-14">
        <BrandLogo height={34} className="mx-auto" />
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <GraduationCap className="h-4 w-4 text-primary" aria-hidden /> {BRAND.productName}
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-fg">Certificate of Completion</h1>
        <p className="mt-6 text-muted">This certifies that</p>
        <p className="mt-2 text-2xl font-semibold text-fg">{row.name}</p>
        <p className="mt-4 text-muted">has completed all lessons and passed the final assessment of</p>
        <p className="mt-2 text-xl font-medium text-primary">{row.course}</p>
        <p className="mt-6 text-sm text-muted">
          Final assessment score: {row.score}% · Level: <span className="capitalize">{row.level}</span>
        </p>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-border pt-4 text-xs text-muted sm:flex-row">
          <span>Issued {row.issuedAt.toLocaleDateString(undefined, { dateStyle: "long" })}</span>
          <span>Certificate ID {row.serial}</span>
        </div>
        <p className="mt-4 text-[11px] text-muted">
          Training certificate issued by {BRAND.legalName} ({BRAND.company} {BRAND.productName}). It is not an official Odoo S.A. certification.
        </p>
        <p className="mt-1 text-[11px] text-muted">{copyrightLine()}</p>
      </div>
    </div>
  );
}

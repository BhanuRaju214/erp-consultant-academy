import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { programs } from "@/lib/db/schema";
import { listCoverImages } from "@/lib/services/media";
import { ProgramForm } from "@/components/program-forms";
import { Card } from "@/components/ui";

export const metadata = { title: "Course details" };
export const dynamic = "force-dynamic";

/** Details & pricing tab: catalogue text, cover, status (publish), enrolment mode and price. */
export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("admin:content");
  const { id } = await params;
  const db = await getDb();
  const program = await db.query.programs.findFirst({ where: eq(programs.id, id) });
  if (!program) notFound();
  const images = await listCoverImages(db);

  return (
    <Card>
      <ProgramForm
        images={images}
        values={{
          id: program.id,
          title: program.title,
          slug: program.slug,
          subtitle: program.subtitle,
          description: program.description,
          level: program.level,
          durationHours: program.durationHours,
          highlights: program.highlights,
          coverAssetId: program.coverAssetId,
          status: program.status,
          enrollmentMode: program.enrollmentMode,
          position: program.position,
          pricePaise: program.pricePaise,
        }}
      />
    </Card>
  );
}

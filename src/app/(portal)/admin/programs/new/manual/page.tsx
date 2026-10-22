import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listCoverImages } from "@/lib/services/media";
import { ProgramForm } from "@/components/program-forms";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "New course" };
export const dynamic = "force-dynamic";

export default async function NewManualCoursePage() {
  await requirePermission("admin:content");
  const images = await listCoverImages(await getDb());
  return (
    <div className="space-y-6">
      <PageHeader
        compact
        eyebrow={<Link href="/admin/programs/new">← New course</Link>}
        title="Create a course manually"
        description="Start with the details learners see in the catalogue. After saving, you'll add modules and lessons in the course's Content tab."
      />
      <Card>
        <ProgramForm
          images={images}
          values={{ title: "", slug: "", subtitle: "", description: "", level: "beginner", durationHours: null, highlights: [], coverAssetId: null, status: "draft", enrollmentMode: "invite", position: 10, pricePaise: null }}
        />
      </Card>
    </div>
  );
}

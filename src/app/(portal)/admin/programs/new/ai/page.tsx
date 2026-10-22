import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { courseAiEnabled, courseModel } from "@/lib/ai/llm";
import { AiCourseBuilder } from "@/components/ai-course-builder";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Build a course with AI" };

export default async function NewAiCoursePage() {
  await requirePermission("admin:content");
  return (
    <div className="space-y-6">
      <PageHeader
        compact
        eyebrow={<Link href="/admin/programs/new">← New course</Link>}
        title="Build a course with AI"
        description={`Describe the course and the AI drafts an outline you can edit, then writes every lesson with examples, exercises and knowledge checks, and a graded quiz per module. Model: ${courseModel()}.`}
      />
      <Card>
        <AiCourseBuilder enabled={courseAiEnabled()} />
      </Card>
    </div>
  );
}

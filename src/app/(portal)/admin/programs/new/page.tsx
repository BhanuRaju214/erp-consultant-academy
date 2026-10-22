import Link from "next/link";
import { ArrowRight, PencilRuler, Sparkles } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { courseAiEnabled } from "@/lib/ai/llm";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "New course" };

/** Step one of a new course: build it by hand, or let the AI draft it. */
export default async function NewCoursePage() {
  await requirePermission("admin:content");
  const ai = courseAiEnabled();
  const options = [
    {
      href: "/admin/programs/new/manual",
      icon: PencilRuler,
      title: "Create manually",
      text: "Enter the course details, then add modules, chapters, lessons and quizzes yourself.",
      cta: "Start with a blank course",
    },
    {
      href: "/admin/programs/new/ai",
      icon: Sparkles,
      title: "Build with AI",
      text: "Describe the course. The AI drafts an outline you can edit, then writes every lesson and a graded quiz for each module.",
      cta: ai ? "Describe your course" : "Needs OPENAI_API_KEY",
    },
  ];
  return (
    <div className="space-y-6">
      <PageHeader compact eyebrow={<Link href="/admin/programs">← All courses</Link>} title="New course" description="How would you like to create it? Either way the course starts as a draft, and you can edit everything afterwards." />
      <div className="grid gap-5 md:grid-cols-2">
        {options.map((o) => (
          <Link key={o.href} href={o.href} className="group flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition hover:border-primary hover:shadow-md">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <o.icon className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-bold text-fg">{o.title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted">{o.text}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              {o.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

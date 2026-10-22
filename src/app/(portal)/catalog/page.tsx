import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Layers } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLibraryItems } from "@/lib/services/library";
import { FLAGSHIP_PROGRAM, listCatalog } from "@/lib/services/programs";
import { LibraryBrowser } from "@/components/library-browser";
import { LibraryThumb } from "@/components/library-thumb";
import { Container } from "@/components/ui";

export const metadata = { title: "Library" };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const user = await requireUser();
  const db = await getDb();
  const [items, programs, sp] = await Promise.all([getLibraryItems(db, user.id), listCatalog(db, user), searchParams]);
  const flagship = programs.find((p) => p.program.slug === FLAGSHIP_PROGRAM.slug);
  const totalMinutes = items.reduce((n, i) => n + (i.minutes ?? 0), 0);

  return (
    <>
      <section className="border-b border-border bg-[#0b1b3f] text-white">
        <Container className="py-10">
          <h1 className="text-3xl font-extrabold tracking-[-0.025em] sm:text-4xl">Library</h1>
          <p className="mt-2 max-w-2xl text-white/75">Every module, business process, lab, project and assessment in one place. Filter by the role you&apos;re training for.</p>
        </Container>
      </section>

      <Container className="py-8">
        {flagship && (
          <Link
            href={`/catalog/${flagship.program.slug}`}
            className="group mb-10 grid overflow-hidden rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgb(15_23_42/0.08)] transition hover:shadow-[0_6px_20px_-6px_rgb(15_23_42/0.25)] md:grid-cols-[minmax(0,1.1fr)_1fr]"
          >
            <LibraryThumb type="program" title={flagship.program.title} category="Course" size="hero" fill />
            <div className="flex flex-col justify-center p-6">
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded bg-[#1a56db] px-1.5 py-0.5 text-[0.6875rem] font-bold text-white">Course</span>
                {flagship.enrolled && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[0.6875rem] font-bold text-success">Enrolled</span>}
              </div>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-fg group-hover:text-primary">{flagship.program.title}</h2>
              <p className="mt-2 text-sm text-muted">{flagship.program.subtitle}</p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fg">
                <li className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-muted" aria-hidden /> {flagship.subCourses} modules
                </li>
                <li className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-muted" aria-hidden /> {flagship.lessonsTotal} lessons
                </li>
                {totalMinutes > 0 && (
                  <li className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted" aria-hidden /> {Math.round(totalMinutes / 60)} hours
                  </li>
                )}
              </ul>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">
                {flagship.enrolled ? "Continue the course" : "View course"} <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>
        )}
        <LibraryBrowser items={items} initialQuery={sp.q ?? ""} initialRole={sp.role} />
      </Container>
    </>
  );
}

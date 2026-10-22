import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BarChart3, BookOpen, CircleCheck, Clock, Layers, ListVideo, Lock, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatMinutes, getLibraryItems } from "@/lib/services/library";
import { canAccessProgram, getProgramBySlug, getProgramSyllabus, isStaff } from "@/lib/services/programs";
import { Markdown } from "@/components/markdown";
import { LibraryThumb } from "@/components/library-thumb";
import { EnrollButton } from "@/components/program-forms";
import { BuyCourse } from "@/components/buy-course";
import { GST_STATES, formatRupees } from "@/lib/gst";
import { Callout, Container, cn } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const program = await getProgramBySlug(await getDb(), (await params).slug);
  return { title: program?.title ?? "Course" };
}

export default async function ProgramPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ locked?: string }> }) {
  const user = await requireUser();
  const db = await getDb();
  const program = await getProgramBySlug(db, (await params).slug);
  // Drafts are visible to staff only (preview before publishing).
  if (!program || (program.status === "draft" && !isStaff(user))) notFound();
  const [hasAccess, syllabus, items] = await Promise.all([canAccessProgram(db, user, program.slug), getProgramSyllabus(db, program.id), getLibraryItems(db, user.id)]);
  const { locked } = await searchParams;
  const byCourse = new Map(items.filter((i) => i.type === "course").map((i) => [i.id, i]));
  const totalLessons = syllabus.reduce((n, c) => n + c.lessons, 0);
  const totalMinutes = syllabus.reduce((n, c) => n + (byCourse.get(c.id)?.minutes ?? 0), 0);
  const done = syllabus.reduce((n, c) => n + (byCourse.get(c.id)?.progress?.done ?? 0), 0);
  const pct = totalLessons ? Math.round((done / totalLessons) * 100) : 0;
  const roles = [...new Set(syllabus.flatMap((c) => byCourse.get(c.id)?.roles ?? []))];

  const forSale = program.status === "published" && program.enrollmentMode === "paid" && (program.pricePaise ?? 0) > 0;

  const cta = hasAccess ? (
    <Link href={program.homePath} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1a56db] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1648b8]">
      {done ? "Continue learning" : "Start learning"} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  ) : program.status !== "published" ? (
    <span className="text-sm text-muted">Not open for enrolment.</span>
  ) : program.enrollmentMode === "open" ? (
    <EnrollButton slug={program.slug} label="Enroll for free" />
  ) : forSale ? (
    <a href="#buy" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1a56db] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1648b8]">
      Buy · {formatRupees(program.pricePaise!)}
    </a>
  ) : (
    <span className="text-sm text-muted">
      Enrolment by invitation.{" "}
      <a href="mailto:info@nexsademy.com" className="font-semibold text-primary hover:underline">
        Contact us
      </a>
    </span>
  );

  const info = [
    { icon: Users, label: "Audience", value: roles.slice(0, 3).join(", ") + (roles.length > 3 ? ` +${roles.length - 3}` : "") },
    { icon: Layers, label: "Modules", value: String(syllabus.length) },
    { icon: BookOpen, label: "Lessons", value: String(totalLessons) },
    { icon: Clock, label: "Duration", value: totalMinutes ? formatMinutes(totalMinutes) : "Self-paced" },
    { icon: BarChart3, label: "Level", value: program.level[0].toUpperCase() + program.level.slice(1) + " to advanced" },
  ];

  return (
    <Container className="py-8">
      <Link href="/catalog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Library
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold leading-tight tracking-[-0.025em] text-fg sm:text-4xl">{program.title}</h1>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg">
            <li className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted" aria-hidden /> {roles.length ? `${roles.length} roles` : "All learners"}
            </li>
            <li className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-muted" aria-hidden /> {syllabus.length} modules
            </li>
            {totalMinutes > 0 && (
              <li className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted" aria-hidden /> {formatMinutes(totalMinutes)}
              </li>
            )}
          </ul>

          {locked && !hasAccess && (
            <div className="mt-5">
              <Callout tone="warning" title="Enrol to open this course">
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" aria-hidden /> That page is part of this course. Enrol below to get access.
                </span>
              </Callout>
            </div>
          )}
          {program.status === "draft" && (
            <div className="mt-5">
              <Callout tone="warning">Draft: only trainers and admins can see this page.</Callout>
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-lg">
            <LibraryThumb type="program" title={program.title} category="Course" size="hero" />
          </div>

          <div className="mt-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold text-fg">{program.title}</h2>
              <span className="rounded bg-[#1a56db] px-1.5 py-0.5 text-[0.6875rem] font-bold text-white">Course</span>
              {hasAccess && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[0.6875rem] font-bold text-success">Enrolled</span>}
              {!hasAccess && program.enrollmentMode === "open" && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[0.6875rem] font-bold text-success">Free</span>}
              {!hasAccess && forSale && <span className="rounded bg-gold-soft px-1.5 py-0.5 text-[0.6875rem] font-bold text-gold">{formatRupees(program.pricePaise!)}</span>}
            </div>
            <div className="shrink-0">{cta}</div>
          </div>

          <div className="mt-6 grid gap-6 rounded-lg border border-border bg-surface-2/60 p-6 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0">
              {program.subtitle && <p className="text-[0.9375rem] font-semibold text-fg">{program.subtitle}</p>}
              {program.description && (
                <div className="prose prose-sm mt-3 max-w-none text-fg dark:prose-invert">
                  <Markdown>{program.description}</Markdown>
                </div>
              )}
              {program.highlights.length > 0 && (
                <>
                  <h3 className="mt-6 text-sm font-extrabold text-fg">What you&apos;ll learn</h3>
                  <ul className="mt-3 space-y-2">
                    {program.highlights.map((h) => (
                      <li key={h} className="flex gap-2.5 text-sm text-fg">
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> {h}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <aside>
              <h3 className="border-b border-border pb-2 text-sm font-extrabold text-fg">Course information</h3>
              <dl className="mt-3 space-y-3">
                {info.map((i) => (
                  <div key={i.label} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
                      <i.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-sm font-semibold text-fg">{i.label}</dt>
                      <dd className="text-xs text-muted">{i.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </div>

        {/* Playlist of the modules in this course */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {forSale && !hasAccess && (
            <section id="buy" className="scroll-mt-24 rounded-lg border border-border bg-surface p-5 shadow-[0_1px_3px_rgb(15_23_42/0.08)]">
              <div className="text-3xl font-extrabold tracking-[-0.02em] text-fg">{formatRupees(program.pricePaise!)}</div>
              <p className="mt-0.5 text-xs text-muted">Inclusive of GST · one-time payment</p>
              <div className="mt-4">
                <BuyCourse slug={program.slug} title={program.title} pricePaise={program.pricePaise!} defaultName={user.name} states={GST_STATES} />
              </div>
            </section>
          )}
          <section className="overflow-hidden rounded-lg border border-border bg-surface">
            <header className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3 text-sm font-extrabold text-fg">
              <ListVideo className="h-4 w-4 text-primary" aria-hidden /> Modules in this course
            </header>
            <ol className="max-h-[32rem] overflow-y-auto [scrollbar-width:thin]">
              {syllabus.map((c, i) => {
                const item = byCourse.get(c.id);
                const cDone = item?.progress?.done ?? 0;
                const complete = c.lessons > 0 && cDone === c.lessons;
                const row = (
                  <div className={cn("flex items-start gap-3 px-4 py-3", hasAccess && "hover:bg-surface-2")}>
                    {complete ? (
                      <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-label="Completed" />
                    ) : (
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border text-[0.625rem] font-bold text-muted">{i + 1}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.8125rem] font-bold leading-snug text-fg">{c.title}</div>
                      <div className="mt-0.5 text-[0.6875rem] text-muted">
                        {c.lessons} lessons{item?.minutes ? ` · ${formatMinutes(item.minutes)}` : ""}
                        {cDone > 0 && !complete ? ` · ${cDone} done` : ""}
                      </div>
                    </div>
                  </div>
                );
                return (
                  <li key={c.id} className="border-b border-border last:border-0">
                    {hasAccess ? <Link href={`/courses/${c.slug}`}>{row}</Link> : row}
                  </li>
                );
              })}
            </ol>
            <footer className="border-t border-border px-4 py-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-fg">{hasAccess ? "Your progress" : "Total duration"}</span>
                <span className="text-muted">{hasAccess ? `${done}/${totalLessons} lessons · ${pct}%` : formatMinutes(totalMinutes)}</span>
              </div>
              {hasAccess && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              )}
            </footer>
          </section>
        </aside>
      </div>
    </Container>
  );
}

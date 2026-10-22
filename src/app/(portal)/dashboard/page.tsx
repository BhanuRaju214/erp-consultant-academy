import Link from "next/link";
import { ArrowRight, Award, Code2, DatabaseZap, Plug, ClipboardCheck, Briefcase, UserRound, PlayCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getStudentDashboard } from "@/lib/services/dashboard";
import { listCertificates } from "@/lib/services/learning";
import { getLibraryItems, ROLES } from "@/lib/services/library";
import { FLAGSHIP_PROGRAM, isStaff, listMyPrograms } from "@/lib/services/programs";
import { LibraryCard } from "@/components/library-browser";
import { LibraryThumb } from "@/components/library-thumb";
import { Callout, Container } from "@/components/ui";

export const metadata = { title: "Home" };

const ROLE_ICONS = {
  "Functional consultant": Briefcase,
  "Technical consultant": Code2,
  "Data migration": DatabaseZap,
  Integration: Plug,
  "QA & testing": ClipboardCheck,
  "Business user": UserRound,
} as const;

function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="text-xl font-extrabold tracking-[-0.02em] text-fg">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-semibold text-primary hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string; denied?: string }> }) {
  const user = await requireUser();
  const db = await getDb();
  const sp = await searchParams;
  const [mine, items, certs] = await Promise.all([
    listMyPrograms(db, user),
    getLibraryItems(db, user.id),
    listCertificates(db, user.id, 4),
  ]);
  const flagship = mine.find((m) => m.program.slug === FLAGSHIP_PROGRAM.slug && (m.enrolled || isStaff(user)));
  const next = flagship ? (await getStudentDashboard(db, user.id)).nextLesson : null;
  const pct = flagship?.lessonsTotal ? Math.round((flagship.lessonsDone / flagship.lessonsTotal) * 100) : 0;

  const courseItems = items.filter((i) => i.type === "course");
  const inProgress = courseItems.filter((i) => i.progress && i.progress.done > 0 && i.progress.done < i.progress.total);
  const recommended = courseItems.filter((i) => i.progress && i.progress.done === 0).slice(0, 3);
  const handsOn = items.filter((i) => i.type === "lab" || i.type === "project").slice(0, 3);

  return (
    <>
      <section className="bg-[#1a56db] text-white">
        <Container className="py-9">
          <p className="text-sm font-semibold text-white/80">{sp.welcome ? "Welcome to Nexsademy" : "Welcome back"}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.025em] sm:text-4xl">{user.name.split(" ")[0]}&apos;s learning</h1>
          <p className="mt-1 text-white/80">Pick up where you left off, or find something new in the Library.</p>
        </Container>
      </section>

      {next && flagship ? (
        <section className="border-b border-border bg-primary-soft">
          <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
            <PlayCircle className="hidden h-10 w-10 shrink-0 text-primary sm:block" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">Continue learning</div>
              <div className="mt-0.5 truncate font-bold text-fg">
                {next.lessonTitle} <span className="font-normal text-muted">· {next.courseTitle}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted">
                  {flagship.lessonsDone} of {flagship.lessonsTotal} lessons · {pct}%
                </span>
              </div>
            </div>
            <Link href={`/courses/${next.courseSlug}/${next.lessonSlug}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0b1b3f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#13285a]">
              Resume <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Container>
        </section>
      ) : (
        !flagship && (
          <section className="border-b border-border bg-primary-soft">
            <Container className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-bold text-fg">You&apos;re not enrolled in a course yet</div>
                <div className="text-sm text-muted">Enrol in the {FLAGSHIP_PROGRAM.title} to unlock every module, lab and project.</div>
              </div>
              <Link href={`/catalog/${FLAGSHIP_PROGRAM.slug}`} className="inline-flex items-center justify-center rounded-md bg-[#0b1b3f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#13285a]">
                View course
              </Link>
            </Container>
          </section>
        )
      )}

      <Container className="space-y-12 py-10">
        {sp.denied && <Callout tone="warning">You don&apos;t have access to that area with your current role.</Callout>}

        {flagship && (
          <section>
            <SectionHeading title="My course" />
            <Link
              href={flagship.program.homePath}
              className="group grid overflow-hidden rounded-lg border border-border bg-surface shadow-[0_1px_3px_rgb(15_23_42/0.08)] transition hover:shadow-[0_6px_20px_-6px_rgb(15_23_42/0.25)] md:grid-cols-[minmax(0,1fr)_1.2fr]"
            >
              <LibraryThumb type="program" title={flagship.program.title} category="Course" size="hero" fill />
              <div className="flex flex-col justify-center p-6">
                <span className="w-fit rounded bg-[#1a56db] px-1.5 py-0.5 text-[0.6875rem] font-bold text-white">Course</span>
                <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-fg group-hover:text-primary">{flagship.program.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  {flagship.subCourses} modules · {flagship.lessonsTotal} lessons
                </p>
                <div className="mt-5 max-w-sm">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted">
                      {flagship.lessonsDone} of {flagship.lessonsTotal} lessons
                    </span>
                    <span className="font-bold text-fg">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">
                  Go to course home <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          </section>
        )}

        {inProgress.length > 0 && (
          <section>
            <SectionHeading title="In progress" href="/catalog" linkLabel="Open Library" />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {inProgress.slice(0, 3).map((i) => (
                <LibraryCard key={i.id} item={i} />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeading title="Explore by role" href="/catalog" linkLabel="Browse the Library" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {ROLES.map((r) => {
              const Icon = ROLE_ICONS[r];
              const n = items.filter((i) => i.roles.includes(r)).length;
              return (
                <Link
                  key={r}
                  href={`/catalog?role=${encodeURIComponent(r)}`}
                  className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition hover:border-primary hover:shadow-[0_6px_20px_-8px_rgb(26_86_219/0.35)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-fg group-hover:text-primary">{r}</span>
                    <span className="text-xs text-muted">{n} items</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {recommended.length > 0 && (
          <section>
            <SectionHeading title={inProgress.length ? "Up next" : "Start here"} href="/catalog" linkLabel="See all modules" />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {recommended.map((i) => (
                <LibraryCard key={i.id} item={i} />
              ))}
            </div>
          </section>
        )}

        {handsOn.length > 0 && (
          <section>
            <SectionHeading title="Hands-on practice" href="/catalog" linkLabel="All labs & projects" />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {handsOn.map((i) => (
                <LibraryCard key={i.id} item={i} />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeading title="Certificates" />
          {certs.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {certs.map((c) => (
                <li key={c.serial}>
                  <Link href={`/certificates/${c.serial}`} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 hover:border-primary">
                    <Award className="h-8 w-8 shrink-0 text-gold" aria-hidden />
                    <span>
                      <span className="block font-bold text-fg">{c.title}</span>
                      <span className="text-xs text-muted">Issued {c.issuedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-4 rounded-lg border border-dashed border-border p-5 text-sm text-muted">
              <Award className="h-8 w-8 shrink-0 text-muted/60" aria-hidden />
              Complete a course and pass its assessments to earn your first certificate.
            </div>
          )}
        </section>
      </Container>
    </>
  );
}

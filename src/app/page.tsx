import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatMinutes, getLibraryItems } from "@/lib/services/library";
import { FLAGSHIP_PROGRAM, getProgramBySlug } from "@/lib/services/programs";
import { LibraryThumb } from "@/components/library-thumb";
import { priceLabel } from "@/components/program-card";
import { SiteFooter } from "@/components/site-footer";
import { Wordmark } from "@/components/wordmark";
import { Container } from "@/components/ui";

export const dynamic = "force-dynamic";

const NIL_USER = "00000000-0000-0000-0000-000000000000";

const PATHS = [
  {
    title: "Self-paced courses",
    label: "Courses",
    img: "/marketing/learn-courses.png",
    text: "Structured lessons you can take at your own pace, with progress saved as you go.",
  },
  {
    title: "Hands-on labs",
    label: "Labs",
    img: "/marketing/learn-labs.png",
    text: "Practise in guided labs and simulators until each skill feels natural.",
  },
  {
    title: "Real projects",
    label: "Projects",
    img: "/marketing/learn-projects.png",
    text: "Apply everything to realistic projects, then prove it with assessments and certificates.",
  },
];

export default async function Home() {
  if (await getCurrentUser()) redirect("/dashboard");
  const db = await getDb();
  const [items, program] = await Promise.all([getLibraryItems(db, NIL_USER), getProgramBySlug(db, FLAGSHIP_PROGRAM.slug)]);
  // The course's parts are modules; labs, projects and assessments are counted separately.
  const modules = items.filter((i) => i.type === "course");
  const totalMinutes = modules.reduce((n, m) => n + (m.minutes ?? 0), 0);
  const labCount = items.filter((i) => i.type === "lab").length;
  const projectCount = items.filter((i) => i.type === "project").length;
  const assessmentCount = items.filter((i) => i.type === "assessment").length;
  const title = program?.title ?? FLAGSHIP_PROGRAM.title;
  const lessons = modules.reduce((n, m) => n + (m.progress?.total ?? 0), 0);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <Container className="flex h-16 items-center gap-6">
          <Link href="/" aria-label="Nexsademy home">
            <Wordmark />
          </Link>
          <nav className="ml-auto hidden items-center gap-7 text-sm text-fg md:flex" aria-label="Main">
            <a href="#course" className="hover:text-primary">
              Course
            </a>
            <a href="#paths" className="hover:text-primary">
              How it works
            </a>
            <a href="mailto:info@nexsademy.com" className="hover:text-primary">
              Contact
            </a>
            <Link href="/login" className="hover:text-primary">
              Log in
            </Link>
          </nav>
          <Link href="/register" className="ml-auto rounded-md bg-[#0b1b3f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#13285a] md:ml-0">
            Sign up free
          </Link>
        </Container>
      </header>

      {/* Hero */}
      <section className="bg-[#1a56db] text-white">
        <Container className="grid items-center gap-12 py-14 lg:grid-cols-[1fr_1fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Training &amp; certification</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-5xl">Welcome to Nexsademy</h1>
            <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-white/85">
              Practical, job-ready courses with hands-on labs, real projects and certificates. Learn at your own pace and build skills you can use from day one.
            </p>
            <div className="mt-8">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-md bg-[#0b1b3f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#13285a]">
                <ArrowUpRight className="h-4 w-4" aria-hidden /> Start learning
              </Link>
            </div>
          </div>

          {/* Learner photo with the learning steps around it (Celigo-style chips). */}
          <div className="relative mx-auto w-full max-w-xl py-8">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 380" preserveAspectRatio="none" aria-hidden>
              <path d="M70 40 H20 V200 H60" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />
              <path d="M440 300 H485 V120 H450" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />
              <path d="M250 370 V350" fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" />
            </svg>
            <div className="relative overflow-hidden rounded-xl border-4 border-white/90 shadow-2xl">
              <Image src="/marketing/hero-learner.png" alt="A learner taking a Nexsademy course on her laptop" width={1200} height={896} priority sizes="(min-width: 1024px) 560px, 100vw" className="block h-auto w-full" />
            </div>
            {[
              { label: "Learn", cls: "-left-3 top-2" },
              { label: "Practise", cls: "-right-3 bottom-14" },
              { label: "Get certified", cls: "left-1/2 -bottom-2 -translate-x-1/2" },
            ].map((c) => (
              <span key={c.label} className={`absolute rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#0b1b3f] shadow-md ${c.cls}`}>
                {c.label}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* Ways to learn */}
      <section id="paths" className="scroll-mt-4 py-16">
        <Container>
          <h2 className="text-center text-3xl font-normal tracking-[-0.01em] text-fg">How are you looking to learn today?</h2>
          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
            {PATHS.map((p) => (
              <Link key={p.title} href="/register" className="group flex gap-4 rounded-md border border-border bg-surface p-3 shadow-[0_1px_3px_rgb(15_23_42/0.08)] transition hover:border-primary">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded">
                  <Image src={p.img} alt="" fill sizes="96px" className="object-cover transition duration-300 group-hover:scale-105" />
                </div>
                <div className="min-w-0 py-1">
                  <h3 className="text-lg font-normal text-fg group-hover:text-primary">{p.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{p.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured course: one course, its modules listed inside it */}
      <section id="course" className="scroll-mt-4">
        <div className="bg-primary-soft py-6">
          <h2 className="text-center text-3xl font-semibold tracking-[-0.01em] text-fg">Featured course</h2>
        </div>
        <Container className="py-10">
          <Link
            href="/register"
            className="group grid overflow-hidden rounded-md border border-border bg-surface shadow-[0_1px_3px_rgb(15_23_42/0.1)] transition hover:shadow-[0_8px_24px_-8px_rgb(15_23_42/0.3)] md:grid-cols-[minmax(0,1.1fr)_1fr]"
          >
            <LibraryThumb type="program" title={title} category="Course" size="hero" fill />
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded bg-[#1a56db] px-1.5 py-0.5 text-[0.6875rem] font-bold text-white">Course</span>
                {program && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[0.6875rem] font-bold text-success">{priceLabel(program)}</span>}
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-fg group-hover:text-primary">{title}</h3>
              {program?.subtitle && <p className="mt-2 text-sm text-muted">{program.subtitle}</p>}
              <p className="mt-4 text-sm text-fg">
                {modules.length} modules · {lessons} lessons{totalMinutes ? ` · about ${Math.round(totalMinutes / 60)} hours` : ""}
              </p>
              <p className="mt-1 text-sm text-muted">
                Includes {labCount} hands-on labs, {projectCount} real projects and {assessmentCount} assessments.
              </p>
              <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-[#0b1b3f] px-5 py-2.5 text-sm font-semibold text-white">
                {program?.enrollmentMode === "paid" ? "View course" : "Enroll for free"} <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>

          <h3 className="mt-12 text-xl font-semibold text-fg">Inside this course: {modules.length} modules</h3>
          <ol className="mt-4 grid gap-x-8 border-t border-border md:grid-cols-2">
            {modules.map((m, i) => (
              <li key={m.id} className="flex items-start gap-4 border-b border-border py-4">
                <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-primary">Module {i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-fg">{m.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {m.progress?.total ?? 0} lessons{m.minutes ? ` · ${formatMinutes(m.minutes)}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <SiteFooter signedIn={false} />
    </div>
  );
}

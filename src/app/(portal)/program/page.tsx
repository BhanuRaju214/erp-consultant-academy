import Link from "next/link";
import { Award, BookOpen, Circle, CircleCheck, Clock, FileText, FlaskConical, Workflow, type LucideIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getProgram, type ResolvedItem } from "@/lib/services/program";
import { PROGRAM_DAY_MINUTES } from "@/content/program";
import { Badge, ButtonLink, Callout, Card, PageHeader, ProgressBar, Stat, cn } from "@/components/ui";

export const metadata = { title: "4-Week Program" };

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const KIND_ICON: Record<ResolvedItem["kind"], LucideIcon> = {
  lesson: BookOpen,
  process: Workflow,
  assessment: Award,
  assignment: FileText,
  lab: FlaskConical,
};

const KIND_LABEL: Record<ResolvedItem["kind"], string> = {
  lesson: "Lesson",
  process: "Process walkthrough",
  assessment: "Final assessment",
  assignment: "Assignment",
  lab: "Lab",
};

function hours(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
}

function ItemRow({ item }: { item: ResolvedItem }) {
  const Icon = KIND_ICON[item.kind];
  return (
    <li>
      <Link href={item.href} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-2">
        {item.done === undefined ? (
          <Icon className="h-4 w-4 shrink-0 text-muted" aria-label={KIND_LABEL[item.kind]} />
        ) : item.done ? (
          <CircleCheck className="h-4 w-4 shrink-0 text-success" aria-label={`${KIND_LABEL[item.kind]}, completed`} />
        ) : (
          <Circle className="h-4 w-4 shrink-0 text-muted" aria-label={`${KIND_LABEL[item.kind]}, not completed`} />
        )}
        <span className="min-w-0 flex-1 text-sm text-fg">
          {item.kind !== "lesson" && item.kind !== "lab" && <span className="text-muted">{KIND_LABEL[item.kind]}: </span>}
          {item.title}
        </span>
        {item.minutes !== undefined && <span className="shrink-0 text-xs text-muted">{item.minutes} min</span>}
      </Link>
    </li>
  );
}

export default async function ProgramPage() {
  const user = await requireUser();
  const weeks = await getProgram(await getDb(), user.id);
  const days = weeks.flatMap((w) => w.days);
  const tracked = days.flatMap((d) => [...d.learn, ...d.practice]).filter((i) => i.done !== undefined);
  const completed = tracked.filter((i) => i.done).length;
  const lessonCount = days.flatMap((d) => d.learn).filter((i) => i.kind === "lesson").length;
  const learnMinutes = days.reduce((s, d) => s + d.learnMinutes, 0);
  const practiceMinutes = days.reduce((s, d) => s + d.practiceMinutes, 0);
  const today = days.find((d) => [...d.learn, ...d.practice].some((i) => i.done === false));
  const nextItem = today && [...today.learn, ...today.practice].find((i) => i.done === false);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Full-time · 5 days a week · 6 hours a day"
        title="4-Week ERP Consultant Program"
        description="The whole academy as a 20-day schedule. Each day is one chapter: guided learning first, then a hands-on practice block for assignments, labs and the Project A capstone. Finish a day's items before moving on; practice time is whatever the learning leaves of the 6 hours."
        actions={nextItem && <ButtonLink href={nextItem.href}>{completed === 0 ? "Start Day 1" : `Continue Day ${today!.number}`}</ButtonLink>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Duration" value="4 weeks" hint={`${days.length} training days`} />
        <Stat label="Lessons" value={lessonCount} hint="across 12 courses" />
        <Stat label="Guided learning" value={hours(learnMinutes)} hint="lessons, processes, assessments" />
        <Stat label="Hands-on practice" value={hours(practiceMinutes)} hint="assignments, labs, projects" />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-fg">Program progress</span>
          <span className="text-muted">
            {completed}/{tracked.length} lessons, assessments and assignments
          </span>
        </div>
        <ProgressBar className="mt-3" value={tracked.length ? (completed / tracked.length) * 100 : 0} label="Program progress" />
      </Card>

      {!today && tracked.length > 0 && (
        <Callout tone="success" title="Program complete">
          You have finished every lesson, assessment and assignment in the program. Collect your certificates under Assessments.
        </Callout>
      )}

      {weeks.map((week) => (
        <section key={week.number} id={`week-${week.number}`} className="scroll-mt-20 space-y-4" aria-labelledby={`week-${week.number}-title`}>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">Week {week.number}</div>
            <h2 id={`week-${week.number}-title`} className="text-xl font-semibold text-fg">
              {week.title}
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">{week.goal}</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {week.days.map((day, di) => {
              const isToday = day.number === today?.number;
              return (
                <Card key={day.number} id={`day-${day.number}`} as="article" className={cn("flex flex-col", isToday && "border-primary ring-1 ring-primary")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary">Day {day.number}</Badge>
                    <span className="text-xs text-muted">{WEEKDAYS[di]}</span>
                    {isToday && <Badge tone="success">You are here</Badge>}
                  </div>
                  <h3 className="mt-2 font-semibold text-fg">{day.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {hours(day.learnMinutes)} learning · {hours(day.practiceMinutes)} practice · {hours(PROGRAM_DAY_MINUTES)} day
                  </p>
                  <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Learn</h4>
                  <ol className="mt-1 space-y-0.5">
                    {day.learn.map((item) => (
                      <ItemRow key={item.href} item={item} />
                    ))}
                  </ol>
                  <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Practice</h4>
                  <ul className="mt-1 space-y-0.5">
                    {day.practice.map((item) => (
                      <ItemRow key={item.href} item={item} />
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

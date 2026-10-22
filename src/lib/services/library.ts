import { and, asc, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { SECTION_ORDER } from "@/lib/nav";
import {
  assessments,
  businessProcesses,
  courseModules,
  courses,
  exercises,
  lessonProgress,
  lessons,
  programs,
  projects,
} from "@/lib/db/schema";
import { FLAGSHIP_PROGRAM } from "./programs";

/**
 * The Library (Oracle MyLearn-style catalogue): every learnable item in the flagship
 * program as its own card, filterable by role, type and level.
 */
export const ITEM_TYPES = ["course", "process", "lab", "project", "assessment"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const TYPE_LABEL: Record<ItemType, string> = {
  course: "Module",
  process: "Business process",
  lab: "Hands-on lab",
  project: "Project",
  assessment: "Assessment",
};

export const ROLES = [
  "Functional consultant",
  "Technical consultant",
  "Data migration",
  "Integration",
  "QA & testing",
  "Business user",
] as const;
export type LearnerRole = (typeof ROLES)[number];

/** Which job roles each course section serves. */
const SECTION_ROLES: Record<string, LearnerRole[]> = {
  "erp-fundamentals": ["Functional consultant", "Technical consultant", "Business user"],
  methodology: ["Functional consultant", "Technical consultant"],
  "odoo-apps": ["Functional consultant", "Business user"],
  "technical-lab": ["Technical consultant"],
  "integration-lab": ["Integration", "Technical consultant"],
  testing: ["QA & testing", "Functional consultant"],
};

export interface LibraryItem {
  id: string;
  type: ItemType;
  title: string;
  summary: string;
  href: string;
  /** Small category shown on the thumbnail, e.g. "Odoo apps". */
  category: string;
  level: "beginner" | "intermediate" | "advanced" | null;
  /** Short facts such as "11 lessons" or "4h 25m". */
  meta: string[];
  roles: LearnerRole[];
  /** Total lesson minutes (courses only). */
  minutes: number | null;
  /** Lesson progress for courses (null for other types). */
  progress: { done: number; total: number } | null;
  position: number;
}

const SECTION_LABEL: Record<string, string> = {
  "erp-fundamentals": "Fundamentals",
  methodology: "Implementation",
  "odoo-apps": "Odoo apps",
  "technical-lab": "Development",
  "integration-lab": "Integration",
  testing: "Testing & QA",
};

/** Sorts modules in learning order: by section (as in the course sidebar), then position. */
export function sectionRank() {
  return sql`array_position(${sql.raw("ARRAY[" + SECTION_ORDER.map((s) => `'${s}'`).join(",") + "]::text[]")}, ${courses.section})`;
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export async function getLibraryItems(db: Db, userId: string): Promise<LibraryItem[]> {
  const [courseRows, processRows, labRows, projectRows, assessmentRows] = await Promise.all([
    db
      .select({
        id: courses.id,
        slug: courses.slug,
        title: courses.title,
        summary: courses.summary,
        section: courses.section,
        level: courses.level,
        position: courses.position,
        lessons: sql<number>`count(distinct ${lessons.id})::int`,
        minutes: sql<number>`coalesce(sum(${lessons.durationMin}), 0)::int`,
        done: sql<number>`count(distinct ${lessonProgress.lessonId}) filter (where ${lessonProgress.status} = 'completed')::int`,
        programSlug: programs.slug,
        programTitle: programs.title,
      })
      .from(courses)
      .innerJoin(programs, eq(programs.id, courses.programId))
      .leftJoin(courseModules, eq(courseModules.courseId, courses.id))
      .leftJoin(lessons, eq(lessons.moduleId, courseModules.id))
      .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
      // Only modules of published courses appear in the Library.
      .where(and(eq(courses.published, true), eq(programs.status, "published")))
      .groupBy(courses.id, programs.id)
      .orderBy(sectionRank(), asc(courses.position)),
    db.select().from(businessProcesses).orderBy(asc(businessProcesses.position)),
    db
      .select({
        id: exercises.id,
        slug: exercises.slug,
        title: exercises.title,
        summary: exercises.summary,
        level: exercises.level,
        businessType: exercises.businessType,
        position: exercises.position,
        steps: sql<number>`(select count(*)::int from exercise_steps s where s.exercise_id = "exercises"."id")`,
      })
      .from(exercises)
      .where(eq(exercises.kind, "config_scenario"))
      .orderBy(asc(exercises.position)),
    db
      .select({
        id: projects.id,
        slug: projects.slug,
        code: projects.code,
        title: projects.title,
        summary: projects.summary,
        industry: projects.industry,
        level: projects.level,
        tasks: sql<number>`(select count(*)::int from project_tasks t where t.project_id = "projects"."id")`,
      })
      .from(projects)
      .orderBy(asc(projects.code)),
    db
      .select({
        id: assessments.id,
        slug: assessments.slug,
        title: assessments.title,
        passMark: assessments.passMark,
        section: courses.section,
        questions: sql<number>`(select count(*)::int from questions q where q.assessment_id = "assessments"."id")`,
      })
      .from(assessments)
      .leftJoin(courses, eq(courses.id, assessments.courseId))
      .orderBy(asc(assessments.title)),
  ]);

  const items: LibraryItem[] = [];
  for (const c of courseRows) {
    // The Odoo course has its own pages; other courses use the /programs player.
    const flagship = c.programSlug === FLAGSHIP_PROGRAM.slug;
    items.push({
      id: c.id,
      type: "course",
      title: c.title,
      summary: c.summary,
      href: flagship ? `/courses/${c.slug}` : `/programs/${c.programSlug}/${c.slug}`,
      category: flagship ? (SECTION_LABEL[c.section] ?? "Module") : c.programTitle,
      level: c.level,
      meta: [`${c.lessons} lessons`, ...(c.minutes ? [formatMinutes(c.minutes)] : [])],
      roles: flagship ? (SECTION_ROLES[c.section] ?? ["Functional consultant"]) : [],
      minutes: c.minutes,
      progress: { done: c.done, total: c.lessons },
      position: c.position,
    });
  }
  for (const p of processRows) {
    items.push({
      id: p.id,
      type: "process",
      title: p.title,
      summary: p.summary,
      href: `/processes/${p.slug}`,
      category: p.shortName,
      level: null,
      meta: [p.category],
      roles: ["Functional consultant", "Business user"],
      minutes: null,
      progress: null,
      position: 100 + p.position,
    });
  }
  // The data-migration lab is one page with several import templates.
  items.push({
    id: "import-lab",
    type: "lab",
    title: "Data Migration & Import Lab",
    summary: "Validate import files against Odoo's rules, fix errors, export a cleansed file and reconcile, using real import templates.",
    href: "/import-lab",
    category: "Data migration",
    level: "intermediate",
    meta: ["Templates & validator"],
    roles: ["Data migration", "Functional consultant"],
    minutes: null,
    progress: null,
    position: 200,
  });
  for (const l of labRows) {
    items.push({
      id: l.id,
      type: "lab",
      title: l.title,
      summary: l.summary,
      href: `/config-lab/${l.slug}`,
      category: "Configuration lab",
      level: l.level,
      meta: [`${l.steps} steps`],
      roles: ["Functional consultant"],
      minutes: null,
      progress: null,
      position: 201 + l.position,
    });
  }
  for (const p of projectRows) {
    items.push({
      id: p.id,
      type: "project",
      title: p.title,
      summary: p.summary,
      href: `/projects/${p.slug}`,
      category: `${p.code} · ${p.industry}`,
      level: p.level,
      meta: [`${p.tasks} tasks`],
      roles: ["Functional consultant", "Technical consultant", "Data migration"],
      minutes: null,
      progress: null,
      position: 300,
    });
  }
  for (const a of assessmentRows) {
    items.push({
      id: a.id,
      type: "assessment",
      title: a.title,
      summary: `${a.questions} questions. Pass mark ${a.passMark}%. Counts towards your certificate.`,
      href: `/assessments/${a.slug}`,
      category: a.section ? (SECTION_LABEL[a.section] ?? "Assessment") : "Business process",
      level: null,
      meta: [`${a.questions} questions`, `Pass ${a.passMark}%`],
      roles: a.section ? (SECTION_ROLES[a.section] ?? ["Functional consultant"]) : ["Functional consultant", "Business user"],
      minutes: null,
      progress: null,
      position: 400,
    });
  }
  return items;
}

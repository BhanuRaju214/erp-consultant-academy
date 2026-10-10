import { and, asc, eq, inArray } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import {
  assessments,
  businessProcesses,
  courseModules,
  courses,
  docResources,
  exerciseSteps,
  exercises,
  lessonProgress,
  lessons,
  projects,
  type Role,
} from "@/lib/db/schema";
import { IMPORT_TEMPLATES } from "@/lib/import/templates";
import { can } from "@/lib/auth/rbac";

/** A node in the sidebar navigation tree. Nodes without `href` are expandable group headings. */
export interface NavNode {
  id: string;
  label: string;
  href?: string;
  /** Lesson completed by the current user. */
  done?: boolean;
  /** Short trailing text, e.g. course progress "3/11". */
  badge?: string;
  children?: NavNode[];
}

/** Sub-navigation keyed by top-level NAV href. */
export type NavTree = Record<string, NavNode[]>;

const COURSE_SECTIONS: Record<string, string> = {
  "/learn/erp-fundamentals": "erp-fundamentals",
  "/learn/odoo-apps": "odoo-apps",
  "/learn/methodology": "methodology",
  "/learn/technical-lab": "technical-lab",
  "/learn/integration-lab": "integration-lab",
  "/testing": "testing",
};

const PROJECT_CHAPTERS: [string, string][] = [
  ["profile", "Company profile"],
  ["requirements", "Requirements"],
  ["as-is", "AS-IS / TO-BE"],
  ["data", "Master data files"],
  ["plan", "Implementation plan"],
  ["transactions", "Transaction scenarios"],
  ["custom", "Customizations"],
  ["tests", "Test cases"],
  ["acceptance", "Acceptance & rubric"],
];

export async function buildNavTree(db: Db, user: { id: string; role: Role }): Promise<NavTree> {
  const [lessonRows, processRows, scenarioRows, stepRows, projectRows, assessmentRows, docRows] = await Promise.all([
    db
      .select({
        courseSlug: courses.slug,
        courseTitle: courses.title,
        section: courses.section,
        moduleId: courseModules.id,
        moduleTitle: courseModules.title,
        lessonId: lessons.id,
        lessonSlug: lessons.slug,
        lessonTitle: lessons.title,
      })
      .from(lessons)
      .innerJoin(courseModules, eq(courseModules.id, lessons.moduleId))
      .innerJoin(courses, eq(courses.id, courseModules.courseId))
      .where(eq(courses.published, true))
      .orderBy(asc(courses.position), asc(courseModules.position), asc(lessons.position)),
    db.select({ slug: businessProcesses.slug, title: businessProcesses.title }).from(businessProcesses).orderBy(asc(businessProcesses.position)),
    db
      .select({ id: exercises.id, slug: exercises.slug, title: exercises.title })
      .from(exercises)
      .where(eq(exercises.kind, "config_scenario"))
      .orderBy(asc(exercises.position)),
    db
      .select({ exerciseId: exerciseSteps.exerciseId, position: exerciseSteps.position, title: exerciseSteps.title })
      .from(exerciseSteps)
      .orderBy(asc(exerciseSteps.position)),
    db.select({ slug: projects.slug, code: projects.code, title: projects.title }).from(projects).orderBy(asc(projects.code)),
    db
      .select({ slug: assessments.slug, title: courses.title, section: courses.section, position: courses.position })
      .from(assessments)
      .innerJoin(courses, eq(courses.id, assessments.courseId))
      .where(eq(courses.published, true))
      .orderBy(asc(courses.position)),
    db.select({ slug: docResources.slug, title: docResources.title, category: docResources.category }).from(docResources).orderBy(asc(docResources.title)),
  ]);

  const lessonIds = lessonRows.map((l) => l.lessonId);
  const done = new Set(
    lessonIds.length
      ? (
          await db
            .select({ id: lessonProgress.lessonId })
            .from(lessonProgress)
            .where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.status, "completed"), inArray(lessonProgress.lessonId, lessonIds)))
        ).map((r) => r.id)
      : [],
  );

  // ---- Courses → modules → lessons ------------------------------------------
  type CourseAcc = { slug: string; title: string; modules: Map<string, { title: string; lessons: NavNode[] }> };
  const bySection = new Map<string, Map<string, CourseAcc>>();
  for (const r of lessonRows) {
    const section = bySection.get(r.section) ?? new Map<string, CourseAcc>();
    bySection.set(r.section, section);
    const course = section.get(r.courseSlug) ?? { slug: r.courseSlug, title: r.courseTitle, modules: new Map() };
    section.set(r.courseSlug, course);
    const mod = course.modules.get(r.moduleId) ?? { title: r.moduleTitle, lessons: [] };
    course.modules.set(r.moduleId, mod);
    mod.lessons.push({ id: r.lessonId, label: r.lessonTitle, href: `/courses/${r.courseSlug}/${r.lessonSlug}`, done: done.has(r.lessonId) });
  }

  const progressBadge = (nodes: NavNode[]) => `${nodes.filter((n) => n.done).length}/${nodes.length}`;

  const sectionNodes = (section: string): NavNode[] => {
    const list = Array.from(bySection.get(section)?.values() ?? []);
    if (list.length === 1) {
      // Single-course section: Course overview, then modules → lessons (keeps depth ≤ 3).
      const c = list[0];
      const all = Array.from(c.modules.values()).flatMap((m) => m.lessons);
      return [
        { id: `course:${c.slug}`, label: "Course overview", href: `/courses/${c.slug}`, badge: progressBadge(all) },
        ...Array.from(c.modules.entries()).map(([id, m], i) => ({
          id: `module:${id}`,
          label: `${i + 1}. ${m.title}`,
          badge: progressBadge(m.lessons),
          children: m.lessons,
        })),
      ];
    }
    // Multi-course section: courses → lessons.
    return list.map((c) => {
      const all = Array.from(c.modules.values()).flatMap((m) => m.lessons);
      return {
        id: `course:${c.slug}`,
        label: c.title,
        badge: progressBadge(all),
        children: [{ id: `course-overview:${c.slug}`, label: "Course overview & assessment", href: `/courses/${c.slug}` }, ...all],
      };
    });
  };

  const tree: NavTree = {};
  for (const [href, section] of Object.entries(COURSE_SECTIONS)) tree[href] = sectionNodes(section);

  tree["/testing"] = [...tree["/testing"], { id: "testing:register", label: "My test register", href: "/testing#register" }];

  tree["/processes"] = [
    { id: "processes:all", label: "All processes", href: "/processes" },
    ...processRows.map((p) => ({ id: `process:${p.slug}`, label: p.title, href: `/processes/${p.slug}` })),
  ];

  const stepsByExercise = new Map<string, typeof stepRows>();
  for (const s of stepRows) stepsByExercise.set(s.exerciseId, [...(stepsByExercise.get(s.exerciseId) ?? []), s]);
  tree["/config-lab"] = [
    { id: "config:all", label: "All scenarios", href: "/config-lab" },
    ...scenarioRows.map((s) => ({
      id: `scenario:${s.slug}`,
      label: s.title,
      children: [
        { id: `scenario-overview:${s.slug}`, label: "Scenario overview", href: `/config-lab/${s.slug}` },
        ...(stepsByExercise.get(s.id) ?? []).map((st) => ({
          id: `step:${s.slug}:${st.position}`,
          label: `${st.position}. ${st.title}`,
          href: `/config-lab/${s.slug}#step-${st.position}`,
        })),
      ],
    })),
  ];

  tree["/import-lab"] = [
    { id: "import:overview", label: "Overview & dependency order", href: "/import-lab" },
    {
      id: "import:templates",
      label: "Import exercises",
      children: [...IMPORT_TEMPLATES]
        .sort((a, b) => a.order - b.order)
        .map((t) => ({ id: `template:${t.key}`, label: `${t.order}. ${t.title}`, href: `/import-lab/${t.key}` })),
    },
    { id: "import:generator", label: "Sample data generator", href: "/import-lab#generator" },
    { id: "import:simulator", label: "Validation simulator", href: "/import-lab#simulator" },
  ];

  tree["/projects"] = [
    { id: "projects:all", label: "All projects", href: "/projects" },
    ...projectRows.map((p) => ({
      id: `project:${p.slug}`,
      label: `Project ${p.code}: ${p.title}`,
      children: PROJECT_CHAPTERS.map(([anchor, label]) => ({ id: `project:${p.slug}:${anchor}`, label, href: `/projects/${p.slug}#${anchor}` })),
    })),
  ];

  tree["/assessments"] = [
    { id: "assessments:all", label: "Overview & certificates", href: "/assessments" },
    {
      id: "assessments:finals",
      label: "Course final assessments",
      children: assessmentRows.map((a) => ({ id: `assessment:${a.slug}`, label: a.title, href: `/assessments/${a.slug}` })),
    },
  ];

  const categories = Array.from(new Set(docRows.map((d) => d.category)));
  tree["/docs"] = [
    { id: "docs:all", label: "Library home & downloads", href: "/docs" },
    ...categories.map((c) => ({
      id: `doc-category:${c}`,
      label: c === "Glossary" ? c : `${c}s`,
      children: docRows.filter((d) => d.category === c).map((d) => ({ id: `doc:${d.slug}`, label: d.title, href: `/docs/${d.slug}` })),
    })),
  ];

  tree["/progress"] = [
    { id: "progress:overview", label: "Completion overview", href: "/progress" },
    { id: "progress:bookmarks", label: "Bookmarks", href: "/progress#bookmarks" },
    { id: "progress:notes", label: "My notes", href: "/progress#notes" },
  ];

  if (can(user.role, "trainer:dashboard")) {
    tree["/trainer"] = [
      { id: "trainer:dashboard", label: "Trainer dashboard", href: "/trainer" },
      { id: "trainer:review", label: "Submissions to review", href: "/trainer#review" },
      { id: "trainer:questions", label: "Open questions", href: "/discussions" },
      ...(can(user.role, "admin:content") ? [{ id: "admin:console", label: "Admin console", href: "/admin" }] : []),
    ];
  }

  return tree;
}

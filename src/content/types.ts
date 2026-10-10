/**
 * Content contract for seeded training material.
 *
 * All course, process, lab and project content is authored as typed TypeScript
 * objects in `src/content/**` and loaded into PostgreSQL by `scripts/seed.ts`.
 * After seeding, administrators edit lessons in the portal (the DB is the source
 * of truth at runtime). Markdown fields support GitHub-flavoured markdown
 * (tables, task lists, fenced code).
 */

/** Navigation sections a course can belong to. */
export type SectionKey =
  | "erp-fundamentals"
  | "business-processes"
  | "odoo-apps"
  | "methodology"
  | "config-lab"
  | "import-lab"
  | "technical-lab"
  | "integration-lab"
  | "testing"
  | "projects";

export type Level = "beginner" | "intermediate" | "advanced";

/**
 * How a feature is delivered. Lessons must label version/edition sensitive
 * content so trainees can distinguish standard Odoo from custom work.
 * - standard: available out of the box in Odoo Community and Enterprise
 * - enterprise: requires Odoo Enterprise (or Odoo Online / Odoo.sh)
 * - configuration: standard, but needs settings/configuration to enable
 * - customization: requires custom development (a custom module / Studio)
 * - third-party: requires a third-party / OCA app or external system
 */
export type FeatureScope = "standard" | "enterprise" | "configuration" | "customization" | "third-party";

export interface Flashcard {
  term: string;
  definition: string;
}

export interface LessonResource {
  title: string;
  kind: "template" | "link" | "download";
  /** Internal path (e.g. /api/templates/customers) or an official documentation URL. */
  url: string;
}

export interface LessonContent {
  slug: string; // kebab-case, unique within the course
  title: string;
  durationMin: number;
  /** e.g. "Odoo 17.0 / 18.0" or "Version-independent" */
  odooVersions: string;
  scope: FeatureScope[];
  /** Lesson body in markdown. Start with business context, then the system. Use ## and ### headings. */
  body: string;
  flashcards?: Flashcard[];
  resources?: LessonResource[];
}

export interface ModuleContent {
  title: string;
  lessons: LessonContent[];
}

export interface QuestionContent {
  prompt: string;
  kind: "single" | "multiple" | "truefalse";
  /** For truefalse use ["True", "False"]. */
  options: string[];
  /** Zero-based indexes of the correct options. */
  correct: number[];
  explanation: string;
}

export interface AssessmentContent {
  slug: string; // globally unique
  title: string;
  passMark: number; // percentage, e.g. 70
  questions: QuestionContent[];
}

export interface AssignmentContent {
  slug: string; // globally unique
  title: string;
  /** Markdown instructions incl. deliverables and evaluation criteria. */
  instructions: string;
}

export interface CourseContent {
  slug: string; // globally unique
  section: SectionKey;
  title: string;
  summary: string;
  level: Level;
  /** "generic" = ERP-platform independent, otherwise ERP platform slug */
  platform: "generic" | "odoo";
  odooVersion: string;
  position: number;
  skills: string[];
  modules: ModuleContent[];
  assessment?: AssessmentContent;
  assignments?: AssignmentContent[];
}

/* ---------------------------------------------------------------- */
/* Business Process Academy                                         */
/* ---------------------------------------------------------------- */

export interface ProcessStep {
  id: string; // short key, e.g. "lead"
  title: string;
  actor: string; // role performing the step
  department: string;
  description: string;
  document?: string; // business document produced/used
  /** How the step is performed in Odoo (app + document + menu path if known). */
  odoo: string;
  /** Accounting and/or inventory impact of this step, if any. */
  impact?: string;
  approval?: string;
}

export interface BusinessProcessContent {
  slug: string;
  title: string;
  /** e.g. "Order to Cash" */
  shortName: string;
  category: string;
  summary: string;
  objective: string;
  odooVersion: string;
  departments: string[];
  stakeholders: { role: string; responsibility: string }[];
  steps: ProcessStep[];
  documents: string[];
  masterData: string[];
  transactionData: string[];
  approvals: string[];
  accountingImpact: string; // markdown
  inventoryImpact: string; // markdown
  exceptions: { title: string; mitigation: string }[];
  kpis: { name: string; formula: string }[];
  reports: string[];
  odooHandling: string; // markdown
  example: { company: string; narrative: string }; // narrative markdown
  quiz?: AssessmentContent;
}

/* ---------------------------------------------------------------- */
/* Business Configuration Lab                                       */
/* ---------------------------------------------------------------- */

export interface ConfigStep {
  title: string;
  why: string; // business reason for the step
  instructions: string; // markdown
  odooPath?: string; // e.g. "Inventory ▸ Configuration ▸ Warehouses"
  dependsOn?: number[]; // 1-based indexes of prerequisite steps
  validation: string; // how to verify the step was done correctly
  commonMistakes: string[];
}

export interface ConfigScenarioContent {
  slug: string;
  title: string;
  businessType: string;
  level: Level;
  odooVersion: string;
  summary: string;
  companyProfile: string; // markdown
  odooApps: string[];
  prerequisites: string[];
  steps: ConfigStep[];
  expectedResult: string; // markdown
  commonMistakes: string[];
}

/* ---------------------------------------------------------------- */
/* Real-time implementation projects                                */
/* ---------------------------------------------------------------- */

export type RequirementType = "standard" | "configuration" | "customization" | "integration" | "reporting";

export interface ProjectTestCase {
  id: string; // e.g. "TC-001"
  requirementId: string;
  module: string;
  scenario: string;
  preconditions: string;
  testData: string;
  steps: string;
  expected: string;
}

export interface ProjectContent {
  slug: string;
  code: string; // "A".."E"
  title: string;
  industry: string;
  level: Level;
  odooVersion: string;
  summary: string;
  company: { name: string; profile: string; locations: string[]; employees: number; currency: string };
  requirements: {
    id: string;
    area: string;
    description: string;
    type: RequirementType;
    priority: "Must" | "Should" | "Could";
  }[];
  asIs: string; // markdown
  toBe: string; // markdown
  masterDataFiles: { name: string; templateKey?: string; description: string; rows: Record<string, string>[] }[];
  phases: { key: string; title: string; tasks: { title: string; description: string; deliverable: string }[] }[];
  transactionScenarios: { id: string; title: string; steps: string[]; expected: string }[];
  customizations: { id: string; title: string; spec: string }[];
  testCases: ProjectTestCase[];
  acceptanceCriteria: string[];
  documentation: string[];
  rubric: { criterion: string; weight: number; excellent: string; adequate: string; poor: string }[];
}

/* ---------------------------------------------------------------- */
/* Documentation library                                            */
/* ---------------------------------------------------------------- */

export interface DocContent {
  slug: string;
  title: string;
  category: "Glossary" | "Template" | "Checklist" | "Reference" | "Guide";
  summary: string;
  body: string; // markdown
}

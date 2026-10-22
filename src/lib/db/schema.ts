import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export const roleEnum = pgEnum("role", ["student", "trainer", "admin"]);
export const levelEnum = pgEnum("level", ["beginner", "intermediate", "advanced"]);
export const progressStatusEnum = pgEnum("progress_status", ["in_progress", "completed"]);
export const questionKindEnum = pgEnum("question_kind", ["single", "multiple", "truefalse"]);
export const submissionStatusEnum = pgEnum("submission_status", ["submitted", "needs_revision", "accepted"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done"]);
export const testStatusEnum = pgEnum("test_status", ["not_run", "pass", "fail", "blocked"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* ------------------------------------------------------------------ */
/* Platforms (extensibility: Odoo now, SAP B1 / D365 / NetSuite later)  */
/* ------------------------------------------------------------------ */

export const erpPlatforms = pgTable("erp_platforms", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  vendor: text("vendor"),
  active: boolean("active").notNull().default(true),
  defaultVersion: text("default_version"),
  ...timestamps,
});

/* ------------------------------------------------------------------ */
/* Identity & access                                                   */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    /** Null for accounts that only sign in with an OAuth provider. */
    passwordHash: text("password_hash"),
    role: roleEnum("role").notNull().default("student"),
    learningPathId: uuid("learning_path_id").references(() => learningPaths.id, { onDelete: "set null" }),
    active: boolean("active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_lower_idx").on(sql`lower(${t.email})`), index("users_role_idx").on(t.role)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Single-use password reset links. Only the token hash is stored. */
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("password_reset_tokens_user_idx").on(t.userId)],
);

/** External identities (e.g. Google) linked to a user. */
export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("oauth_accounts_provider_account_idx").on(t.provider, t.providerAccountId),
    index("oauth_accounts_user_idx").on(t.userId),
  ],
);

/* ------------------------------------------------------------------ */
/* Catalogue: learning paths → courses → modules → lessons             */
/* ------------------------------------------------------------------ */

export const learningPaths = pgTable("learning_paths", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  level: levelEnum("level").notNull(),
  description: text("description").notNull(),
  position: integer("position").notNull().default(0),
  ...timestamps,
});

/* ------------------------------------------------------------------ */
/* Programs: the courses learners see in the catalogue and enrol in.   */
/* A program groups the internal `courses` (sub-courses) below.        */
/* ------------------------------------------------------------------ */

export const programStatusEnum = pgEnum("program_status", ["draft", "published", "archived"]);
/** open: free self-enrolment · paid: enrol after payment · invite: only admins enrol learners. */
export const enrollmentModeEnum = pgEnum("enrollment_mode", ["open", "invite", "paid"]);
export const enrollmentSourceEnum = pgEnum("enrollment_source", ["auto", "admin", "self", "purchase"]);

export const programs = pgTable(
  "programs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull().default(""),
    /** Markdown shown on the course page. */
    description: text("description").notNull().default(""),
    level: levelEnum("level").notNull().default("beginner"),
    durationHours: integer("duration_hours"),
    highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
    coverAssetId: uuid("cover_asset_id").references((): AnyPgColumn => mediaAssets.id, { onDelete: "set null" }),
    /** Where "Go to course" leads, e.g. /learn for the flagship program. */
    homePath: text("home_path").notNull(),
    /** Price in paise, inclusive of GST. Used when enrollmentMode is "paid". */
    pricePaise: integer("price_paise"),
    status: programStatusEnum("status").notNull().default("draft"),
    enrollmentMode: enrollmentModeEnum("enrollment_mode").notNull().default("invite"),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("programs_status_idx").on(t.status, t.position)],
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    source: enrollmentSourceEnum("source").notNull(),
    enrolledById: uuid("enrolled_by_id").references(() => users.id, { onDelete: "set null" }),
    /** Set when access is removed; the row is kept for history and re-activated on re-enrolment. */
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("enrollments_program_user_idx").on(t.programId, t.userId), index("enrollments_user_idx").on(t.userId)],
);

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    programId: uuid("program_id").references(() => programs.id, { onDelete: "set null" }),
    platformId: uuid("platform_id").references(() => erpPlatforms.id, { onDelete: "set null" }),
    section: text("section").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    level: levelEnum("level").notNull(),
    odooVersion: text("odoo_version"),
    skills: jsonb("skills").$type<string[]>().notNull().default([]),
    position: integer("position").notNull().default(0),
    published: boolean("published").notNull().default(true),
    /** Certificate criteria: all lessons completed + final assessment score ≥ this value. */
    certMinScore: integer("cert_min_score").notNull().default(70),
    ...timestamps,
  },
  (t) => [index("courses_section_idx").on(t.section, t.position), index("courses_program_idx").on(t.programId)],
);

export const learningPathCourses = pgTable(
  "learning_path_courses",
  {
    pathId: uuid("path_id")
      .notNull()
      .references(() => learningPaths.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.pathId, t.courseId] })],
);

export const courseModules = pgTable(
  "course_modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("course_modules_course_idx").on(t.courseId, t.position)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => courseModules.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    durationMin: integer("duration_min").notNull().default(15),
    odooVersions: text("odoo_versions"),
    scope: jsonb("scope").$type<string[]>().notNull().default([]),
    flashcards: jsonb("flashcards").$type<{ term: string; definition: string }[]>().notNull().default([]),
    position: integer("position").notNull().default(0),
    /** AI course builder: null for hand-written lessons, otherwise pending → generating → done | error. */
    aiStatus: text("ai_status"),
    aiError: text("ai_error"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("lessons_module_slug_idx").on(t.moduleId, t.slug),
    index("lessons_module_pos_idx").on(t.moduleId, t.position),
  ],
);

export const lessonResources = pgTable("lesson_resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
});

/* ------------------------------------------------------------------ */
/* Business processes & scenarios                                      */
/* ------------------------------------------------------------------ */

export const businessProcesses = pgTable("business_processes", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  shortName: text("short_name").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  position: integer("position").notNull().default(0),
  /** Full BusinessProcessContent document (steps, KPIs, impacts...). */
  data: jsonb("data").notNull(),
  ...timestamps,
});

/** Guided exercises: configuration checklists and practical tasks. */
export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    kind: text("kind").notNull(), // "config_scenario" | "practical"
    title: text("title").notNull(),
    businessType: text("business_type"),
    level: levelEnum("level").notNull().default("beginner"),
    summary: text("summary").notNull(),
    odooVersion: text("odoo_version"),
    data: jsonb("data").notNull(), // profile, prerequisites, expected result, mistakes
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("exercises_kind_idx").on(t.kind)],
);

export const exerciseSteps = pgTable(
  "exercise_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    why: text("why").notNull(),
    instructions: text("instructions").notNull(),
    odooPath: text("odoo_path"),
    dependsOn: jsonb("depends_on").$type<number[]>().notNull().default([]),
    validation: text("validation").notNull(),
    commonMistakes: jsonb("common_mistakes").$type<string[]>().notNull().default([]),
  },
  (t) => [uniqueIndex("exercise_steps_pos_idx").on(t.exerciseId, t.position)],
);

export const studentExerciseSteps = pgTable(
  "student_exercise_steps",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stepId: uuid("step_id")
      .notNull()
      .references(() => exerciseSteps.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
    note: text("note"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.stepId] })],
);

/* ------------------------------------------------------------------ */
/* Assessments                                                         */
/* ------------------------------------------------------------------ */

export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
  processId: uuid("process_id").references(() => businessProcesses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  passMark: integer("pass_mark").notNull().default(70),
  ...timestamps,
});

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    kind: questionKindEnum("kind").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correct: jsonb("correct").$type<number[]>().notNull(),
    explanation: text("explanation").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("questions_assessment_idx").on(t.assessmentId, t.position)],
);

export const assessmentAttempts = pgTable(
  "assessment_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    passed: boolean("passed").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("attempts_user_idx").on(t.userId, t.assessmentId)],
);

export const studentAnswers = pgTable(
  "student_answers",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => assessmentAttempts.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    answer: jsonb("answer").$type<number[]>().notNull(),
    correct: boolean("correct").notNull(),
  },
  (t) => [primaryKey({ columns: [t.attemptId, t.questionId] })],
);

/* ------------------------------------------------------------------ */
/* Assignments & submissions                                           */
/* ------------------------------------------------------------------ */

export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  instructions: text("instructions").notNull(),
  ...timestamps,
});

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull().default(""),
    fileName: text("file_name"),
    /** Path relative to the private storage directory; never publicly served. */
    filePath: text("file_path"),
    status: submissionStatusEnum("status").notNull().default("submitted"),
    grade: integer("grade"),
    ...timestamps,
  },
  (t) => [index("submissions_user_idx").on(t.userId), index("submissions_status_idx").on(t.status)],
);

/* ------------------------------------------------------------------ */
/* Implementation projects                                             */
/* ------------------------------------------------------------------ */

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  industry: text("industry").notNull(),
  level: levelEnum("level").notNull(),
  summary: text("summary").notNull(),
  odooVersion: text("odoo_version"),
  /** Full ProjectContent document. */
  data: jsonb("data").notNull(),
  ...timestamps,
});

export const projectTasks = pgTable(
  "project_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    phase: text("phase").notNull(),
    phaseTitle: text("phase_title").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    deliverable: text("deliverable").notNull(),
    position: integer("position").notNull(),
  },
  (t) => [index("project_tasks_project_idx").on(t.projectId, t.position)],
);

export const studentProjectTasks = pgTable(
  "student_project_tasks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: uuid("task_id")
      .notNull()
      .references(() => projectTasks.id, { onDelete: "cascade" }),
    status: taskStatusEnum("status").notNull().default("todo"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.taskId] })],
);

/* ------------------------------------------------------------------ */
/* Progress, notes, certificates, feedback                             */
/* ------------------------------------------------------------------ */

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    status: progressStatusEnum("status").notNull().default("in_progress"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] }), index("lesson_progress_user_idx").on(t.userId, t.status)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("notes_user_lesson_idx").on(t.userId, t.lessonId)],
);

export const certificates = pgTable(
  "certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serial: text("serial").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("certificates_user_course_idx").on(t.userId, t.courseId)],
);

/**
 * Course (program) certificate for courses built in the course builder: every lesson
 * completed and every module quiz passed. The Odoo course issues per-module certificates.
 */
export const programCertificates = pgTable(
  "program_certificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serial: text("serial").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    /** Average of the best module quiz scores (100 when the course has no quizzes). */
    score: integer("score").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("program_certificates_user_program_idx").on(t.userId, t.programId)],
);

export const trainerFeedback = pgTable(
  "trainer_feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trainerId: uuid("trainer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("feedback_student_idx").on(t.studentId)],
);

/** Discussion & doubt resolution, optionally attached to a lesson. Replies use parentId. */
export const discussions = pgTable(
  "discussions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "set null" }),
    parentId: uuid("parent_id"),
    title: text("title"),
    body: text("body").notNull(),
    resolved: boolean("resolved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("discussions_parent_idx").on(t.parentId), index("discussions_lesson_idx").on(t.lessonId)],
);

/* ------------------------------------------------------------------ */
/* Documentation library                                               */
/* ------------------------------------------------------------------ */

export const docResources = pgTable("doc_resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  ...timestamps,
});

/* ------------------------------------------------------------------ */
/* Testing lab                                                         */
/* ------------------------------------------------------------------ */

export const testCases = pgTable(
  "test_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    code: text("code").notNull(),
    requirementId: text("requirement_id").notNull().default(""),
    module: text("module").notNull(),
    scenario: text("scenario").notNull(),
    preconditions: text("preconditions").notNull().default(""),
    testData: text("test_data").notNull().default(""),
    steps: text("steps").notNull(),
    expected: text("expected").notNull(),
    actual: text("actual").notNull().default(""),
    status: testStatusEnum("status").notNull().default("not_run"),
    defectId: text("defect_id").notNull().default(""),
    remarks: text("remarks").notNull().default(""),
    ...timestamps,
  },
  (t) => [uniqueIndex("test_cases_user_code_idx").on(t.userId, t.code)],
);

/* ------------------------------------------------------------------ */
/* AI assistant (subject to retention policy: AI_RETENTION_DAYS)       */
/* ------------------------------------------------------------------ */

export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    context: jsonb("context").$type<{ odooVersion?: string; edition?: string; apps?: string[] }>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("ai_conv_user_idx").on(t.userId), index("ai_conv_expiry_idx").on(t.expiresAt)],
);

export const aiMessages = pgTable(
  "ai_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => aiConversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_msg_conv_idx").on(t.conversationId, t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Media library: files live in R2 (or local disk in development),     */
/* videos in Mux. This table is the source of truth for every asset.   */
/* ------------------------------------------------------------------ */

export const mediaKindEnum = pgEnum("media_kind", ["image", "document", "video", "other"]);
export const mediaStatusEnum = pgEnum("media_status", ["pending", "ready", "errored"]);
/**
 * public: anyone · authenticated: any signed-in user (e.g. course covers) ·
 * enrolled: learners enrolled in the course (paid content) · private: the uploader plus trainers/admins.
 */
export const mediaVisibilityEnum = pgEnum("media_visibility", ["public", "authenticated", "private", "enrolled"]);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: mediaKindEnum("kind").notNull(),
    status: mediaStatusEnum("status").notNull().default("ready"),
    visibility: mediaVisibilityEnum("visibility").notNull().default("authenticated"),
    title: text("title").notNull().default(""),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull().default("application/octet-stream"),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    /** "r2" | "local" for files, "mux" for videos. */
    storage: text("storage").notNull(),
    /** Object key in R2 / path under STORAGE_DIR. Null for Mux videos. */
    storageKey: text("storage_key"),
    muxUploadId: text("mux_upload_id"),
    muxAssetId: text("mux_asset_id"),
    muxPlaybackId: text("mux_playback_id"),
    durationSeconds: integer("duration_seconds"),
    error: text("error"),
    /** Optional link to a course, for enrollment-based access once payments are added. */
    courseId: uuid("course_id").references(() => courses.id, { onDelete: "set null" }),
    uploadedById: uuid("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("media_assets_storage_key_idx").on(t.storage, t.storageKey),
    uniqueIndex("media_assets_mux_upload_idx").on(t.muxUploadId),
    uniqueIndex("media_assets_mux_asset_idx").on(t.muxAssetId),
    index("media_assets_kind_idx").on(t.kind, t.createdAt),
  ],
);

/* ------------------------------------------------------------------ */
/* Relations (for the relational query builder)                        */
/* ------------------------------------------------------------------ */

export const coursesRelations = relations(courses, ({ many, one }) => ({
  modules: many(courseModules),
  platform: one(erpPlatforms, { fields: [courses.platformId], references: [erpPlatforms.id] }),
}));

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, { fields: [courseModules.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(courseModules, { fields: [lessons.moduleId], references: [courseModules.id] }),
  resources: many(lessonResources),
}));

export const lessonResourcesRelations = relations(lessonResources, ({ one }) => ({
  lesson: one(lessons, { fields: [lessonResources.lessonId], references: [lessons.id] }),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({ steps: many(exerciseSteps) }));
export const exerciseStepsRelations = relations(exerciseSteps, ({ one }) => ({
  exercise: one(exercises, { fields: [exerciseSteps.exerciseId], references: [exercises.id] }),
}));

export const assessmentsRelations = relations(assessments, ({ many }) => ({ questions: many(questions) }));
export const questionsRelations = relations(questions, ({ one }) => ({
  assessment: one(assessments, { fields: [questions.assessmentId], references: [assessments.id] }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({ tasks: many(projectTasks) }));
export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, { fields: [projectTasks.projectId], references: [projects.id] }),
}));

export type User = typeof users.$inferSelect;
export type Role = (typeof roleEnum.enumValues)[number];
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type MediaKind = (typeof mediaKindEnum.enumValues)[number];
export type MediaVisibility = (typeof mediaVisibilityEnum.enumValues)[number];

/* ------------------------------------------------------------------ */
/* Payments (Razorpay): coupons, orders and GST invoice numbering      */
/* ------------------------------------------------------------------ */

export const couponKindEnum = pgEnum("coupon_kind", ["percent", "amount"]);
export const orderStatusEnum = pgEnum("order_status", ["created", "paid", "failed", "refunded"]);

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Stored upper-case; matched case-insensitively. */
    code: text("code").notNull(),
    kind: couponKindEnum("kind").notNull(),
    /** Percent (1–100) or amount in paise, depending on kind. */
    value: integer("value").notNull(),
    /** Null = valid for every course. */
    programId: uuid("program_id").references(() => programs.id, { onDelete: "cascade" }),
    maxRedemptions: integer("max_redemptions"),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [uniqueIndex("coupons_code_idx").on(t.code)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "restrict" }),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    status: orderStatusEnum("status").notNull().default("created"),
    currency: text("currency").notNull().default("INR"),
    /** All amounts in paise. amount = list − discount, inclusive of GST. */
    listPricePaise: integer("list_price_paise").notNull(),
    discountPaise: integer("discount_paise").notNull().default(0),
    amountPaise: integer("amount_paise").notNull(),
    taxablePaise: integer("taxable_paise").notNull(),
    cgstPaise: integer("cgst_paise").notNull().default(0),
    sgstPaise: integer("sgst_paise").notNull().default(0),
    igstPaise: integer("igst_paise").notNull().default(0),
    billingName: text("billing_name").notNull(),
    billingEmail: text("billing_email").notNull(),
    /** GST state code of the buyer (place of supply), e.g. "36". */
    billingStateCode: text("billing_state_code").notNull(),
    billingGstin: text("billing_gstin"),
    razorpayOrderId: text("razorpay_order_id"),
    razorpayPaymentId: text("razorpay_payment_id"),
    razorpayRefundId: text("razorpay_refund_id"),
    paymentMethod: text("payment_method"),
    invoiceNumber: text("invoice_number"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("orders_razorpay_order_idx").on(t.razorpayOrderId),
    uniqueIndex("orders_razorpay_payment_idx").on(t.razorpayPaymentId),
    uniqueIndex("orders_invoice_number_idx").on(t.invoiceNumber),
    index("orders_user_idx").on(t.userId, t.createdAt),
    index("orders_status_idx").on(t.status, t.createdAt),
  ],
);

/** Gap-free invoice numbers per Indian financial year (e.g. "2026-27"). */
export const invoiceSequences = pgTable("invoice_sequences", {
  financialYear: text("financial_year").primaryKey(),
  lastNumber: integer("last_number").notNull().default(0),
});

/* ------------------------------------------------------------------ */
/* AI course builder                                                   */
/* ------------------------------------------------------------------ */

export const aiGenerationStatusEnum = pgEnum("ai_generation_status", ["generating", "done", "failed", "cancelled"]);

/** One AI course build: the brief, progress of the lesson-writing job and token usage. */
export const aiGenerations = pgTable(
  "ai_generations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    status: aiGenerationStatusEnum("status").notNull().default("generating"),
    /** The admin's brief (topic, audience, level, sizes, instructions). */
    brief: jsonb("brief").$type<Record<string, unknown>>().notNull(),
    model: text("model").notNull(),
    lessonsTotal: integer("lessons_total").notNull().default(0),
    lessonsDone: integer("lessons_done").notNull().default(0),
    lessonsFailed: integer("lessons_failed").notNull().default(0),
    /** One graded quiz per module, written after the lessons. */
    quizzesTotal: integer("quizzes_total").notNull().default(0),
    quizzesDone: integer("quizzes_done").notNull().default(0),
    quizzesFailed: integer("quizzes_failed").notNull().default(0),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    error: text("error"),
    /** Updated while the job runs; a stale heartbeat means the job stopped and can be resumed. */
    heartbeatAt: timestamp("heartbeat_at", { withTimezone: true }),
    createdById: uuid("created_by_id").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("ai_generations_program_idx").on(t.programId)],
);

export type AiGeneration = typeof aiGenerations.$inferSelect;

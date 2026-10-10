import { relations, sql } from "drizzle-orm";
import {
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
    passwordHash: text("password_hash").notNull(),
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

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
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
  (t) => [index("courses_section_idx").on(t.section, t.position)],
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

/**
 * Programs (catalogue courses) and enrolments against in-memory PostgreSQL.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq, isNull } from "drizzle-orm";
import { createDb, type DbHandle } from "@/lib/db/client";
import { courses, enrollments, programs, users } from "@/lib/db/schema";
import { seedAll } from "@/lib/seed";
import { registerUser } from "@/lib/services/users";
import {
  FLAGSHIP_PROGRAM,
  canAccessProgram,
  enrollByEmail,
  ensureFlagshipProgram,
  getProgramSyllabus,
  listCatalog,
  listMyPrograms,
  revokeEnrollment,
  saveProgram,
  selfEnroll,
} from "@/lib/services/programs";

let h: DbHandle;
let early = { id: "", role: "student" as const };

beforeAll(async () => {
  h = await createDb({ dataDir: "memory://", url: "" });
  await h.migrate();
  // A learner who registered before programs existed must keep access.
  const reg = await registerUser(h.db, { name: "Early Learner", email: "early@example.test", password: "EarlyLearner2026" });
  if (!reg.ok) throw new Error(reg.error);
  early = { id: reg.value.id, role: "student" };
  await seedAll(h.db, { skipUsers: true });
});

afterAll(async () => {
  await h?.close();
});

describe("flagship program setup", () => {
  it("creates the program, links every sub-course and enrols existing users once", async () => {
    const [program] = await h.db.select().from(programs).where(eq(programs.slug, FLAGSHIP_PROGRAM.slug));
    expect(program).toMatchObject({ status: "published", homePath: "/learn" });
    expect(await h.db.select().from(courses).where(isNull(courses.programId))).toHaveLength(0);
    expect(await canAccessProgram(h.db, early, FLAGSHIP_PROGRAM.slug)).toBe(true);

    // Re-running setup neither duplicates nor auto-enrols users who joined later.
    const late = await registerUser(h.db, { name: "Late Learner", email: "late@example.test", password: "LateLearner2026" });
    if (!late.ok) throw new Error(late.error);
    expect(await ensureFlagshipProgram(h.db)).toMatchObject({ created: false, enrolled: 0 });
    expect(await canAccessProgram(h.db, { id: late.value.id, role: "student" }, FLAGSHIP_PROGRAM.slug)).toBe(false);
  });

  it("builds the syllabus from the linked sub-courses", async () => {
    const [program] = await h.db.select().from(programs).where(eq(programs.slug, FLAGSHIP_PROGRAM.slug));
    const syllabus = await getProgramSyllabus(h.db, program.id);
    expect(syllabus.length).toBe(12);
    expect(syllabus.reduce((n, c) => n + c.lessons, 0)).toBeGreaterThan(100);
  });
});

describe("enrolment", () => {
  it("lets learners self-enrol in open courses only", async () => {
    const reg = await registerUser(h.db, { name: "Open Learner", email: "open@example.test", password: "OpenLearner2026" });
    if (!reg.ok) throw new Error(reg.error);
    const learner = { id: reg.value.id, role: "student" as const };

    expect((await selfEnroll(h.db, learner, FLAGSHIP_PROGRAM.slug)).ok).toBe(true);
    expect(await canAccessProgram(h.db, learner, FLAGSHIP_PROGRAM.slug)).toBe(true);
    const mine = await listMyPrograms(h.db, learner);
    expect(mine.map((m) => m.program.slug)).toEqual([FLAGSHIP_PROGRAM.slug]);
    expect(mine[0].lessonsTotal).toBeGreaterThan(100);

    const invite = await saveProgram(h.db, { title: "SAP Basics", slug: "sap-basics", level: "beginner", status: "published", enrollmentMode: "invite" });
    if (!invite.ok) throw new Error(invite.error);
    expect((await selfEnroll(h.db, learner, "sap-basics")).ok).toBe(false);
    expect((await selfEnroll(h.db, learner, "does-not-exist")).ok).toBe(false);
  });

  it("supports admin enrolment by email, removal and re-enrolment", async () => {
    const [admin] = await h.db.insert(users).values({ name: "Admin", email: "admin2@example.test", passwordHash: null, role: "admin" }).returning();
    const [program] = await h.db.select().from(programs).where(eq(programs.slug, "sap-basics"));
    const late = { id: (await h.db.select().from(users).where(eq(users.email, "late@example.test")))[0].id, role: "student" as const };

    expect((await enrollByEmail(h.db, program.id, "nobody@example.test", admin.id)).ok).toBe(false);
    expect((await enrollByEmail(h.db, program.id, "LATE@example.test", admin.id)).ok).toBe(true);
    expect(await canAccessProgram(h.db, late, "sap-basics")).toBe(true);

    await revokeEnrollment(h.db, program.id, late.id);
    expect(await canAccessProgram(h.db, late, "sap-basics")).toBe(false);
    expect(await h.db.select().from(enrollments).where(eq(enrollments.userId, late.id))).toHaveLength(1);

    await enrollByEmail(h.db, program.id, "late@example.test", admin.id);
    expect(await canAccessProgram(h.db, late, "sap-basics")).toBe(true);
  });

  it("hides drafts from learners but not from staff", async () => {
    const draft = await saveProgram(h.db, { title: "Draft Course", slug: "draft-course", level: "advanced", status: "draft", enrollmentMode: "open" });
    if (!draft.ok) throw new Error(draft.error);
    expect(draft.value.homePath).toBe("/programs/draft-course");
    expect((await listCatalog(h.db, early)).map((c) => c.program.slug)).not.toContain("draft-course");
    expect((await selfEnroll(h.db, early, "draft-course")).ok).toBe(false);
    expect(await canAccessProgram(h.db, { id: early.id, role: "trainer" }, "draft-course")).toBe(true);
  });

  it("validates course details", async () => {
    expect((await saveProgram(h.db, { title: "X", slug: "ok-slug", level: "beginner", status: "draft", enrollmentMode: "open" })).ok).toBe(false);
    expect((await saveProgram(h.db, { title: "Bad slug", slug: "Bad Slug!", level: "beginner", status: "draft", enrollmentMode: "open" })).ok).toBe(false);
    expect((await saveProgram(h.db, { title: "Duplicate", slug: "sap-basics", level: "beginner", status: "draft", enrollmentMode: "open" })).ok).toBe(false);
  });
});

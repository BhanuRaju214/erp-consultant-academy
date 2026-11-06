/**
 * Free beginner modules: any signed-in learner can open them; later levels need the
 * course. Runs against in-memory PostgreSQL.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createDb, type DbHandle } from "@/lib/db/client";
import { lessons, mediaAssets } from "@/lib/db/schema";
import { addChapter, addLesson, addModule, courseIdForLesson, updateModule } from "@/lib/services/builder";
import { canAccessModule, enroll, hasFreeModules, hasFullAccessForModule, isMediaInFreeLesson, saveProgram } from "@/lib/services/programs";
import { registerUser } from "@/lib/services/users";
import { listCoursesWithProgress } from "@/lib/services/learning";
import { retrievePassages, searchContent } from "@/lib/services/search";

let h: DbHandle;

beforeAll(async () => {
  h = await createDb({ dataDir: "memory://", url: "" });
  await h.migrate();
});

afterAll(async () => {
  await h?.close();
});

describe("free beginner modules", () => {
  it("opens beginner modules to everyone and the rest to enrolled learners", async () => {
    const p = await saveProgram(h.db, { title: "Paid Course", slug: "paid-course", level: "beginner", status: "published", enrollmentMode: "paid", pricePaise: 100_000 });
    if (!p.ok) throw new Error(p.error);
    const intro = await addModule(h.db, p.value.id, { title: "Introduction" });
    const deep = await addModule(h.db, p.value.id, { title: "Deep dive" });
    if (!intro.ok || !deep.ok) throw new Error("module");
    expect((await updateModule(h.db, deep.value.id, { title: "Deep dive", summary: "", published: true, level: "intermediate" })).ok).toBe(true);
    const ch = await addChapter(h.db, intro.value.id, "Basics");
    if (!ch.ok) throw new Error("chapter");
    const lesson = await addLesson(h.db, ch.value.id, { title: "Welcome" });
    if (!lesson.ok) throw new Error("lesson");

    const reg = await registerUser(h.db, { name: "Free Learner", email: "free@example.test", password: "FreeLearner2026" });
    if (!reg.ok) throw new Error(reg.error);
    const learner = reg.value;

    expect(await hasFreeModules(h.db, p.value.id)).toBe(true);
    expect(await canAccessModule(h.db, learner, { slug: intro.value.slug })).toBe(true);
    expect(await canAccessModule(h.db, learner, { id: intro.value.id })).toBe(true);
    expect(await canAccessModule(h.db, learner, { slug: deep.value.slug })).toBe(false);
    expect(await hasFullAccessForModule(h.db, learner, { slug: intro.value.slug })).toBe(false);
    expect(await courseIdForLesson(h.db, lesson.value.id)).toBe(intro.value.id);

    // Course media used in a free lesson can be played without an enrolment.
    const [asset] = await h.db
      .insert(mediaAssets)
      .values({ kind: "video", title: "Intro", fileName: "intro.mp4", contentType: "video/mp4", storage: "mux", storageKey: "/videos/intro.mp4", visibility: "enrolled", status: "ready" })
      .returning();
    expect(await isMediaInFreeLesson(h.db, asset)).toBe(false);
    await h.db.update(lessons).set({ body: '```visual-video\n{"src": "/videos/intro.mp4"}\n```' }).where(eq(lessons.id, lesson.value.id));
    expect(await isMediaInFreeLesson(h.db, asset)).toBe(true);

    // Buying the course opens every module.
    await enroll(h.db, { programId: p.value.id, userId: learner.id, source: "purchase" });
    expect(await canAccessModule(h.db, learner, { slug: deep.value.slug })).toBe(true);
    expect(await hasFullAccessForModule(h.db, learner, { slug: intro.value.slug })).toBe(true);
  });

  it("keeps draft courses and hidden modules closed", async () => {
    const p = await saveProgram(h.db, { title: "Draft Course", slug: "draft-course", level: "beginner", status: "draft", enrollmentMode: "paid", pricePaise: 100_000 });
    if (!p.ok) throw new Error(p.error);
    const m = await addModule(h.db, p.value.id, { title: "Start here" });
    if (!m.ok) throw new Error("module");
    const ch = await addChapter(h.db, m.value.id, "Basics");
    if (!ch.ok) throw new Error("chapter");
    const l = await addLesson(h.db, ch.value.id, { title: "Zanzibar invoicing secrets" });
    if (!l.ok) throw new Error("lesson");
    await h.db.update(lessons).set({ body: "Zanzibar invoicing secrets explained in detail for learners." }).where(eq(lessons.id, l.value.id));
    const reg = await registerUser(h.db, { name: "Curious Learner", email: "curious@example.test", password: "CuriousLearn2026" });
    if (!reg.ok) throw new Error(reg.error);
    expect(await canAccessModule(h.db, reg.value, { slug: m.value.slug })).toBe(false);
    // A draft course stays out of course lists, search and the assistant's sources, even for enrolled learners.
    await enroll(h.db, { programId: p.value.id, userId: reg.value.id, source: "admin" });
    expect(await canAccessModule(h.db, reg.value, { slug: m.value.slug })).toBe(false);
    expect((await listCoursesWithProgress(h.db, reg.value.id)).some((c) => c.id === m.value.id)).toBe(false);
    expect((await searchContent(h.db, "Zanzibar")).some((r) => r.title.includes("Zanzibar"))).toBe(false);
    expect((await retrievePassages(h.db, "Zanzibar invoicing")).some((r) => r.title.includes("Zanzibar"))).toBe(false);

    await saveProgram(h.db, { title: "Draft Course", slug: "draft-course", level: "beginner", status: "published", enrollmentMode: "paid", pricePaise: 100_000 }, p.value.id);
    expect(await canAccessModule(h.db, reg.value, { slug: m.value.slug })).toBe(true);
    expect((await listCoursesWithProgress(h.db, reg.value.id)).some((c) => c.id === m.value.id)).toBe(true);
    expect((await retrievePassages(h.db, "Zanzibar invoicing")).some((r) => r.title.includes("Zanzibar"))).toBe(true);
    await updateModule(h.db, m.value.id, { title: "Start here", summary: "", published: false });
    expect(await canAccessModule(h.db, reg.value, { slug: m.value.slug })).toBe(false);
    expect(await hasFreeModules(h.db, p.value.id)).toBe(false);
  });
});

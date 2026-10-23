/**
 * Twice-weekly "continue your course" reminder emails against in-memory PostgreSQL.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createDb, type DbHandle } from "@/lib/db/client";
import { enrollments, users } from "@/lib/db/schema";
import type { EmailMessage } from "@/lib/email";
import { addChapter, addLesson, addModule } from "@/lib/services/builder";
import { setLessonCompleted } from "@/lib/services/learning";
import { enroll, saveProgram } from "@/lib/services/programs";
import { dueReminders, getReminderSetting, isReminderWindow, sendCourseReminders, setCourseReminders } from "@/lib/services/reminders";
import { registerUser } from "@/lib/services/users";

let h: DbHandle;
const DAY = 24 * 60 * 60 * 1000;
// Monday 2026-11-02 11:00 IST
const MONDAY = new Date("2026-11-02T05:30:00Z");

beforeAll(async () => {
  h = await createDb({ dataDir: "memory://", url: "" });
  await h.migrate();
});

afterAll(async () => {
  await h?.close();
});

async function course(title: string, slug: string, lessonCount: number) {
  const p = await saveProgram(h.db, { title, slug, level: "beginner", status: "published", enrollmentMode: "open" });
  if (!p.ok) throw new Error(p.error);
  const m = await addModule(h.db, p.value.id, { title: "Start" });
  if (!m.ok) throw new Error("module");
  const ch = await addChapter(h.db, m.value.id, "Intro");
  if (!ch.ok) throw new Error("chapter");
  const ids: string[] = [];
  for (let i = 0; i < lessonCount; i++) {
    const l = await addLesson(h.db, ch.value.id, { title: `Lesson ${i + 1}` });
    if (!l.ok) throw new Error("lesson");
    ids.push(l.value.id);
  }
  return { program: p.value, lessonIds: ids };
}

async function learner(name: string, email: string) {
  const r = await registerUser(h.db, { name, email, password: "LearnerPass2026" });
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

describe("course reminders", () => {
  it("goes out on Mondays and Thursdays from 10:00 IST only", () => {
    expect(isReminderWindow(new Date("2026-11-02T04:29:00Z"))).toBe(false); // Mon 09:59 IST
    expect(isReminderWindow(new Date("2026-11-02T04:30:00Z"))).toBe(true); // Mon 10:00 IST
    expect(isReminderWindow(new Date("2026-11-05T12:00:00Z"))).toBe(true); // Thu 17:30 IST
    expect(isReminderWindow(new Date("2026-11-03T06:00:00Z"))).toBe(false); // Tuesday
    expect(isReminderWindow(new Date("2026-11-01T20:00:00Z"))).toBe(false); // Mon 01:30 IST, before 10:00
  });

  it("reminds learners with unfinished courses, twice a week, until they finish or unsubscribe", async () => {
    const { program, lessonIds } = await course("SAP Basics", "sap-basics", 4);
    const ravi = await learner("Ravi Kumar", "ravi@example.test");
    const done = await learner("Meena Iyer", "meena@example.test");
    const fresh = await learner("New Joiner", "new@example.test");
    for (const u of [ravi, done, fresh]) await enroll(h.db, { programId: program.id, userId: u.id, source: "self" });
    // Ravi and Meena enrolled a week ago; the newcomer only just now.
    await h.db.update(enrollments).set({ createdAt: new Date(MONDAY.getTime() - 7 * DAY) }).where(eq(enrollments.programId, program.id));
    await h.db.update(enrollments).set({ createdAt: MONDAY }).where(eq(enrollments.userId, fresh.id));
    await setLessonCompleted(h.db, ravi.id, lessonIds[0], true);
    for (const id of lessonIds) await setLessonCompleted(h.db, done.id, id, true);

    expect((await dueReminders(h.db, MONDAY)).map((r) => r.email)).toEqual(["ravi@example.test"]);

    const outbox: EmailMessage[] = [];
    const send = async (m: EmailMessage) => (outbox.push(m), { ok: true as const });
    expect(await sendCourseReminders(h.db, { baseUrl: "https://train.nexsademy.com", send, now: MONDAY })).toEqual({ sent: 1, failed: 0 });
    const mail = outbox[0];
    expect(mail.to).toBe("ravi@example.test");
    expect(mail.subject).toBe("Keep going: SAP Basics is 25% done");
    expect(mail.text).toContain("You have registered for SAP Basics");
    expect(mail.text).toContain("You've completed 1 of 4 lessons (25%)");
    expect(mail.text).toContain("earn your certificate");
    expect(mail.text).toContain("https://train.nexsademy.com/programs/sap-basics");
    expect(mail.html).toContain("Continue the course");
    expect(mail.headers?.["List-Unsubscribe"]).toMatch(/^<https:\/\/train\.nexsademy\.com\/unsubscribe\?token=[0-9a-f-]{36}>$/);

    // Running again the same day sends nothing; Thursday sends the next one.
    expect(await sendCourseReminders(h.db, { baseUrl: "https://x", send, now: new Date(MONDAY.getTime() + 3 * 60 * 60 * 1000) })).toEqual({ sent: 0, failed: 0 });
    const thursday = new Date(MONDAY.getTime() + 3 * DAY);
    expect(await sendCourseReminders(h.db, { baseUrl: "https://x", send, now: thursday })).toEqual({ sent: 2, failed: 0 }); // Ravi + the newcomer (now 3 days in)

    // Unsubscribing stops them; the link token is the only key needed.
    const token = mail.headers!["List-Unsubscribe"].match(/token=([0-9a-f-]{36})/)![1];
    expect(await getReminderSetting(h.db, token)).toEqual({ email: "ravi@example.test", on: true });
    expect(await setCourseReminders(h.db, token, false)).toEqual({ email: "ravi@example.test" });
    expect(await setCourseReminders(h.db, "not-a-token", false)).toBeNull();
    const nextMonday = new Date(MONDAY.getTime() + 7 * DAY);
    expect((await dueReminders(h.db, nextMonday)).map((r) => r.email)).toEqual(["new@example.test"]);
    const ravisRow = await h.db.query.users.findFirst({ where: eq(users.id, ravi.id) });
    expect(ravisRow?.courseReminders).toBe(false);
  });

  it("releases a reminder that failed to send so the next run retries it", async () => {
    const { program } = await course("Tally Prime", "tally-prime", 2);
    const u = await learner("Arjun Das", "arjun@example.test");
    await enroll(h.db, { programId: program.id, userId: u.id, source: "self" });
    await h.db.update(enrollments).set({ createdAt: new Date(MONDAY.getTime() - 7 * DAY) }).where(eq(enrollments.userId, u.id));
    const failing = async () => ({ ok: false as const, error: "Resend 500" });
    const res = await sendCourseReminders(h.db, { baseUrl: "https://x", send: failing, now: MONDAY });
    expect(res.failed).toBeGreaterThanOrEqual(1);
    expect((await dueReminders(h.db, MONDAY)).map((r) => r.email)).toContain("arjun@example.test");
  });
});

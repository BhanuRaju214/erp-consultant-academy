import { describe, expect, it } from "vitest";
import { allCourses } from "@/content";
import { businessProcesses } from "@/content/processes";
import { ASSESSMENT_MINUTES, PROCESS_MINUTES, PROGRAM_DAY_MINUTES, program, type ProgramItem } from "@/content/program";

const days = program.flatMap((w) => w.days);
const items = days.flatMap((d) => [...d.learn, ...d.practice]);
const lessonMinutes = new Map(allCourses.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => [`${c.slug}/${l.slug}`, l.durationMin] as const))));

const minutes = (i: ProgramItem) =>
  i.kind === "lesson" ? (lessonMinutes.get(`${i.course}/${i.lesson}`) ?? 0) : i.kind === "assessment" ? ASSESSMENT_MINUTES : i.kind === "process" ? PROCESS_MINUTES : 0;

describe("4-week program", () => {
  it("has 4 weeks of 5 days", () => {
    expect(program).toHaveLength(4);
    for (const w of program) expect(w.days).toHaveLength(5);
  });

  it("schedules every lesson exactly once", () => {
    const scheduled = items.flatMap((i) => (i.kind === "lesson" ? [`${i.course}/${i.lesson}`] : []));
    expect(new Set(scheduled).size, "a lesson is scheduled twice").toBe(scheduled.length);
    expect([...scheduled].sort()).toEqual([...lessonMinutes.keys()].sort());
  });

  it("keeps each course's lessons in course order", () => {
    for (const c of allCourses) {
      const expected = c.modules.flatMap((m) => m.lessons.map((l) => l.slug));
      const actual = items.flatMap((i) => (i.kind === "lesson" && i.course === c.slug ? [i.lesson] : []));
      expect(actual, c.slug).toEqual(expected);
    }
  });

  it("schedules every final assessment after the course's last lesson, and every assignment once", () => {
    const order = items.map((i) => (i.kind === "lesson" ? `L:${i.course}/${i.lesson}` : i.kind === "assessment" ? `A:${i.course}` : ""));
    for (const c of allCourses.filter((c) => c.assessment)) {
      const lastLesson = c.modules.at(-1)!.lessons.at(-1)!.slug;
      expect(order.indexOf(`A:${c.slug}`), `${c.slug} final`).toBeGreaterThan(order.indexOf(`L:${c.slug}/${lastLesson}`));
    }
    const assignments = items.flatMap((i) => (i.kind === "assignment" ? [i.slug] : []));
    expect([...assignments].sort()).toEqual(allCourses.flatMap((c) => (c.assignments ?? []).map((a) => a.slug)).sort());
  });

  it("covers every business process and links labs inside the portal", () => {
    const processes = items.flatMap((i) => (i.kind === "process" ? [i.slug] : []));
    expect([...processes].sort()).toEqual(businessProcesses.map((p) => p.slug).sort());
    for (const i of items) if (i.kind === "lab") expect(i.href).toMatch(/^\/[a-z]/);
  });

  it("leaves at least 90 minutes of practice in every 6-hour day", () => {
    for (const [n, d] of days.entries()) {
      const learn = d.learn.reduce((s, i) => s + minutes(i), 0);
      expect(learn, `day ${n + 1}`).toBeLessThanOrEqual(PROGRAM_DAY_MINUTES - 90);
      expect(d.practice.length, `day ${n + 1} practice`).toBeGreaterThan(0);
    }
  });
});

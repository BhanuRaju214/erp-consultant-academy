import { describe, expect, it } from "vitest";
import { gradeQuiz } from "@/lib/quiz";
import { can } from "@/lib/auth/rbac";
import { passwordPolicyError } from "@/lib/auth/password";
import { summariseTests } from "@/lib/services/practice";
import { buildSystemPrompt, offlineReply } from "@/lib/ai/assistant";
import { allCourses, businessProcesses, configScenarios } from "@/content";

describe("quiz grading", () => {
  const qs = [
    { id: "a", kind: "single" as const, correct: [1] },
    { id: "b", kind: "multiple" as const, correct: [0, 2] },
    { id: "c", kind: "truefalse" as const, correct: [0] },
  ];
  it("scores all-or-nothing per question", () => {
    const r = gradeQuiz(qs, { a: [1], b: [2, 0], c: [1] }, 60);
    expect(r.score).toBe(67);
    expect(r.passed).toBe(true);
    expect(r.graded.map((g) => g.correct)).toEqual([true, true, false]);
  });
  it("treats partial multi-select and unanswered as wrong", () => {
    const r = gradeQuiz(qs, { b: [0] }, 70);
    expect(r.score).toBe(0);
    expect(r.passed).toBe(false);
  });
  it("ignores extra answers on single-choice questions", () => {
    expect(gradeQuiz([qs[0]], { a: [1, 0] }, 50).score).toBe(100);
  });
});

describe("rbac & password policy", () => {
  it("restricts trainer and admin capabilities", () => {
    expect(can("student", "learn")).toBe(true);
    expect(can("student", "trainer:dashboard")).toBe(false);
    expect(can("trainer", "trainer:review")).toBe(true);
    expect(can("trainer", "admin:users")).toBe(false);
    expect(can("admin", "admin:content")).toBe(true);
    expect(can(null, "learn")).toBe(false);
  });
  it("requires length, letters and digits", () => {
    expect(passwordPolicyError("short1")).toBeTruthy();
    expect(passwordPolicyError("onlyletterslong")).toBeTruthy();
    expect(passwordPolicyError("Letters12345")).toBeNull();
  });
});

describe("testing summary", () => {
  it("computes execution and pass rates", () => {
    const s = summariseTests([
      { status: "pass", module: "Sales" },
      { status: "fail", module: "Sales" },
      { status: "not_run", module: "Inventory" },
      { status: "pass", module: "Inventory" },
    ]);
    expect(s.executionRate).toBe(75);
    expect(s.passRate).toBe(67);
    expect(s.modules.find((m) => m.module === "Sales")).toMatchObject({ total: 2, pass: 1, fail: 1 });
  });
});

describe("AI assistant guardrails", () => {
  it("embeds accuracy rules, trainee context and sources in the system prompt", () => {
    const p = buildSystemPrompt({ odooVersion: "17.0", edition: "Community", apps: ["Sales"], mode: "explain" }, [
      { title: "Invoicing policy", href: "/courses/odoo-sales/x", text: "Ordered vs delivered quantities." },
    ]);
    expect(p).toContain("Never invent Odoo menu paths");
    expect(p).toContain("Odoo 17.0, Community edition");
    expect(p).toContain("[S1] Invoicing policy");
    expect(p).toContain("Verification:");
  });
  it("falls back to portal passages offline", () => {
    const r = offlineReply("q", [{ title: "T", href: "/docs/t", text: "Body text" }]);
    expect(r.provider).toBe("offline");
    expect(r.content).toContain("[S1]");
  });
});

describe("seed content integrity", () => {
  it("has unique slugs and valid quiz answer keys", () => {
    const slugs = allCourses.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const assessments = [...allCourses.flatMap((c) => (c.assessment ? [c.assessment] : [])), ...businessProcesses.flatMap((p) => (p.quiz ? [p.quiz] : []))];
    expect(new Set(assessments.map((a) => a.slug)).size).toBe(assessments.length);
    for (const a of assessments) {
      for (const q of a.questions) {
        expect(q.correct.length, `${a.slug}: ${q.prompt}`).toBeGreaterThan(0);
        for (const c of q.correct) expect(c, `${a.slug}: ${q.prompt}`).toBeLessThan(q.options.length);
        if (q.kind !== "multiple") expect(q.correct.length, `${a.slug}: ${q.prompt}`).toBe(1);
      }
    }
  });
  it("has unique lesson slugs per course and every lesson labelled with scope + version", () => {
    for (const c of allCourses) {
      const ls = c.modules.flatMap((m) => m.lessons);
      expect(new Set(ls.map((l) => l.slug)).size, c.slug).toBe(ls.length);
      for (const l of ls) {
        expect(l.scope.length, `${c.slug}/${l.slug}`).toBeGreaterThan(0);
        expect(l.odooVersions, `${c.slug}/${l.slug}`).toBeTruthy();
        expect(l.body.length, `${c.slug}/${l.slug}`).toBeGreaterThan(1500);
      }
    }
  });
  it("config scenario dependencies point to earlier steps", () => {
    for (const s of configScenarios) {
      s.steps.forEach((st, i) => (st.dependsOn ?? []).forEach((d) => expect(d, `${s.slug} step ${i + 1}`).toBeLessThan(i + 1)));
    }
  });
});

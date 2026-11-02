/**
 * Certificate lookup, verification IDs and LinkedIn links against in-memory PostgreSQL.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { createDb, type DbHandle } from "@/lib/db/client";
import { certificates, courses, programs } from "@/lib/db/schema";
import { seedAll } from "@/lib/seed";
import { BRAND } from "@/lib/brand";
import { addChapter, addLesson, addModule } from "@/lib/services/builder";
import { certificateSkills, getCertificate, linkedInAddToProfileUrl, normalizeSerial, whatsAppShareUrl } from "@/lib/services/certificates";
import { getFlagshipCertificateStatus, getProgramCertificateStatus, maybeIssueFlagshipCertificate, setLessonCompleted } from "@/lib/services/learning";
import { FLAGSHIP_PROGRAM, saveProgram } from "@/lib/services/programs";
import { registerUser } from "@/lib/services/users";

let h: DbHandle;

beforeAll(async () => {
  h = await createDb({ dataDir: "memory://", url: "" });
  await h.migrate();
});

afterAll(async () => {
  await h?.close();
});

describe("certificates", () => {
  it("normalises and validates certificate IDs", () => {
    expect(normalizeSerial(" nxs-2026-3f9a12bc ")).toBe("NXS-2026-3F9A12BC");
    expect(normalizeSerial("ECA-2025-0A1B2C3D")).toBe("ECA-2025-0A1B2C3D");
    expect(normalizeSerial("NXS-2026-3F9A12")).toBeNull();
    expect(normalizeSerial("'; drop table users; --")).toBeNull();
  });

  it("looks up a course certificate by ID and builds share links", async () => {
    const p = await saveProgram(h.db, { title: "Excel Basics", slug: "excel-basics", level: "beginner", status: "published", enrollmentMode: "open" });
    if (!p.ok) throw new Error(p.error);
    const m = await addModule(h.db, p.value.id, { title: "Start" });
    if (!m.ok) throw new Error("module");
    const ch = await addChapter(h.db, m.value.id, "Intro");
    if (!ch.ok) throw new Error("chapter");
    const l = await addLesson(h.db, ch.value.id, { title: "Hello" });
    if (!l.ok) throw new Error("lesson");
    const reg = await registerUser(h.db, { name: "Asha Rao", email: "asha@example.test", password: "AshaLearner2026" });
    if (!reg.ok) throw new Error(reg.error);
    await setLessonCompleted(h.db, reg.value.id, l.value.id, true);
    const issued = (await getProgramCertificateStatus(h.db, reg.value.id, p.value.id)).certificate;
    if (!issued) throw new Error("no certificate");

    const cert = await getCertificate(h.db, issued.serial.toLowerCase());
    expect(cert).toMatchObject({ kind: "course", name: "Asha Rao", title: "Excel Basics", partOf: null, score: 100, userId: reg.value.id });
    expect(await getCertificate(h.db, "NXS-2026-00000000")).toBeNull();
    expect(await getCertificate(h.db, "not-an-id")).toBeNull();

    const verifyUrl = `https://train.nexsademy.com/verify/${issued.serial}`;
    const add = new URL(linkedInAddToProfileUrl(cert!, verifyUrl));
    expect(add.origin + add.pathname).toBe("https://www.linkedin.com/profile/add");
    expect(Object.fromEntries(add.searchParams)).toMatchObject({
      startTask: "CERTIFICATION_NAME",
      name: "Excel Basics",
      organizationId: BRAND.linkedinOrgId,
      certUrl: verifyUrl,
      certId: issued.serial,
      issueYear: String(new Date().getFullYear()),
    });
    expect(decodeURIComponent(whatsAppShareUrl(cert!, verifyUrl))).toContain(verifyUrl);
  });
});

describe("Odoo course certificate", () => {
  it("is awarded once every module certificate is earned, and module certificates show skills", async () => {
    await seedAll(h.db, { skipUsers: true });
    const program = await h.db.query.programs.findFirst({ where: eq(programs.slug, FLAGSHIP_PROGRAM.slug) });
    if (!program) throw new Error("flagship not seeded");
    const mods = await h.db.select({ id: courses.id }).from(courses).where(and(eq(courses.programId, program.id), eq(courses.published, true)));
    expect(mods.length).toBeGreaterThan(1);
    const reg = await registerUser(h.db, { name: "Ravi Teja", email: "ravi@example.test", password: "RaviLearner2026" });
    if (!reg.ok) throw new Error(reg.error);
    const uid = reg.value.id;
    const grant = (courseId: string, score: number, i: number) =>
      h.db.insert(certificates).values({ userId: uid, courseId, score, serial: `ECA-2026-${String(i).padStart(8, "0")}` });

    // Every module but one: no course certificate yet.
    for (const [i, m] of mods.slice(1).entries()) await grant(m.id, 80, i + 1);
    expect(await maybeIssueFlagshipCertificate(h.db, uid)).toBeNull();
    const before = await getFlagshipCertificateStatus(h.db, uid);
    expect(before).toMatchObject({ modulesTotal: mods.length, modulesCertified: mods.length - 1, eligible: false, certificate: null });
    expect(before!.remaining).toHaveLength(1);

    await grant(mods[0].id, 100, 99);
    const course = await maybeIssueFlagshipCertificate(h.db, uid);
    expect(course?.serial).toMatch(/^NXS-\d{4}-[0-9A-F]{8}$/);
    expect(course?.score).toBe(Math.round((80 * (mods.length - 1) + 100) / mods.length));
    expect((await maybeIssueFlagshipCertificate(h.db, uid))?.serial).toBe(course!.serial); // idempotent

    const view = await getCertificate(h.db, course!.serial);
    expect(view).toMatchObject({ kind: "course", title: FLAGSHIP_PROGRAM.title, modules: mods.length, partOf: null });
    expect(view!.lessons).toBeGreaterThan(0);

    const moduleView = await getCertificate(h.db, "ECA-2026-00000099");
    expect(moduleView?.kind).toBe("module");
    expect(moduleView!.skills.length).toBeGreaterThan(0);
    expect(moduleView!.skills.every((s) => s.length <= 60)).toBe(true);
  }, 120_000);

  it("picks up to three short skills for the certificate", () => {
    expect(certificateSkills(["Bills of materials", "Work centers & routings", "A".repeat(70), "Costing", "Subcontracting"])).toEqual([
      "Bills of materials",
      "Work centers & routings",
      "Costing",
    ]);
    expect(certificateSkills([])).toEqual([]);
  });
});

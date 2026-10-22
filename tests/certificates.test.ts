/**
 * Certificate lookup, verification IDs and LinkedIn links against in-memory PostgreSQL.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb, type DbHandle } from "@/lib/db/client";
import { BRAND } from "@/lib/brand";
import { addChapter, addLesson, addModule } from "@/lib/services/builder";
import { getCertificate, linkedInAddToProfileUrl, normalizeSerial, whatsAppShareUrl } from "@/lib/services/certificates";
import { getProgramCertificateStatus, setLessonCompleted } from "@/lib/services/learning";
import { saveProgram } from "@/lib/services/programs";
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

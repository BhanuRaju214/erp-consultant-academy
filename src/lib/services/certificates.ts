import { eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { certificates, courseModules, courses, evaluationCertificates, lessons, programCertificates, programs, users } from "@/lib/db/schema";
import { BRAND } from "@/lib/brand";
import { FLAGSHIP_PROGRAM } from "./programs";

/**
 * One view over the three levels of certificate: module certificates (`certificates`),
 * course certificates for completing every module (`program_certificates`) and the
 * Certified Odoo ERP Consultant credential for passing the trainer-approved final
 * evaluation (`evaluation_certificates`). Certificates are public by ID so employers
 * can verify them.
 */

/** Title of the credential awarded for passing the final evaluation. */
export const CONSULTANT_TITLE = "Certified Odoo ERP Consultant";

/** ECA-2026-1A2B3C4D (modules), NXS-2026-1A2B3C4D (courses) or NXC-2026-1A2B3C4D (consultant). */
const SERIAL = /^[A-Z]{3}-\d{4}-[0-9A-F]{8}$/;

export function normalizeSerial(raw: string): string | null {
  const s = decodeURIComponent(raw).trim().toUpperCase();
  return SERIAL.test(s) ? s : null;
}

export interface CertificateView {
  serial: string;
  kind: "module" | "course" | "consultant";
  userId: string;
  name: string;
  /** What the certificate is for: the course, or the module of the Odoo course. */
  title: string;
  /** For module and consultant certificates: the course it belongs to. */
  partOf: string | null;
  level: string;
  score: number;
  issuedAt: Date;
  /** Module certificates: a few of the skills the module teaches (short ones first fit the artwork). */
  skills: string[];
  /** Course certificates: how much the course covers. */
  modules: number;
  lessons: number;
}

/** Up to three short skills that fit on one or two lines of the certificate. */
export function certificateSkills(all: string[]): string[] {
  const picked: string[] = [];
  let length = 0;
  for (const s of all.map((x) => x.trim()).filter((x) => x && x.length <= 60)) {
    if (picked.length === 3 || length + s.length > 150) break;
    picked.push(s);
    length += s.length;
  }
  return picked;
}

export async function getCertificate(db: Db, rawSerial: string): Promise<CertificateView | null> {
  const serial = normalizeSerial(rawSerial);
  if (!serial) return null;
  const [mod] = await db
    .select({
      serial: certificates.serial,
      userId: users.id,
      name: users.name,
      title: courses.title,
      level: courses.level,
      score: certificates.score,
      issuedAt: certificates.issuedAt,
      partOf: programs.title,
      skills: courses.skills,
    })
    .from(certificates)
    .innerJoin(users, eq(users.id, certificates.userId))
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .leftJoin(programs, eq(programs.id, courses.programId))
    .where(eq(certificates.serial, serial))
    .limit(1);
  if (mod) return { ...mod, skills: certificateSkills(mod.skills), modules: 0, lessons: 0, kind: "module" };
  const [course] = await db
    .select({
      serial: programCertificates.serial,
      userId: users.id,
      name: users.name,
      title: programs.title,
      level: programs.level,
      score: programCertificates.score,
      issuedAt: programCertificates.issuedAt,
      modules: sql<number>`(select count(*) from ${courses} c where c.program_id = ${programs.id} and c.published)::int`,
      lessons: sql<number>`(select count(*) from ${lessons} l join ${courseModules} cm on cm.id = l.module_id join ${courses} c on c.id = cm.course_id where c.program_id = ${programs.id} and c.published)::int`,
    })
    .from(programCertificates)
    .innerJoin(users, eq(users.id, programCertificates.userId))
    .innerJoin(programs, eq(programs.id, programCertificates.programId))
    .where(eq(programCertificates.serial, serial))
    .limit(1);
  if (course) return { ...course, partOf: null, skills: [], kind: "course" };
  const [consultant] = await db
    .select({
      serial: evaluationCertificates.serial,
      userId: users.id,
      name: users.name,
      score: evaluationCertificates.score,
      issuedAt: evaluationCertificates.issuedAt,
    })
    .from(evaluationCertificates)
    .innerJoin(users, eq(users.id, evaluationCertificates.userId))
    .where(eq(evaluationCertificates.serial, serial))
    .limit(1);
  return consultant
    ? { ...consultant, title: CONSULTANT_TITLE, partOf: FLAGSHIP_PROGRAM.title, level: "advanced", skills: [], modules: 0, lessons: 0, kind: "consultant" }
    : null;
}

export function verifyPath(serial: string) {
  return `/verify/${serial}`;
}

export function formatIssued(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}

/** LinkedIn "Add licence or certification" form, prefilled; NexusEPM is the issuing organisation. */
export function linkedInAddToProfileUrl(cert: CertificateView, verifyUrl: string): string {
  const issued = new Date(cert.issuedAt.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: cert.kind === "module" && cert.partOf ? `${cert.title} (${cert.partOf})` : cert.title,
    organizationId: BRAND.linkedinOrgId,
    issueYear: String(issued.getFullYear()),
    issueMonth: String(issued.getMonth() + 1),
    certUrl: verifyUrl,
    certId: cert.serial,
  });
  return `https://www.linkedin.com/profile/add?${params}`;
}

export function linkedInShareUrl(verifyUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
}

export function whatsAppShareUrl(cert: CertificateView, verifyUrl: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`I just earned my ${BRAND.productName} certificate for "${cert.title}"! Verify it here: ${verifyUrl}`)}`;
}

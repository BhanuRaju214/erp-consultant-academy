import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { certificates, courses, programCertificates, programs, users } from "@/lib/db/schema";
import { BRAND } from "@/lib/brand";

/**
 * One view over both kinds of certificate: per-module certificates of the Odoo
 * course (`certificates`) and whole-course certificates of builder courses
 * (`program_certificates`). Certificates are public by ID so employers can verify them.
 */

/** ECA-2026-1A2B3C4D (Odoo modules) or NXS-2026-1A2B3C4D (courses). */
const SERIAL = /^[A-Z]{3}-\d{4}-[0-9A-F]{8}$/;

export function normalizeSerial(raw: string): string | null {
  const s = decodeURIComponent(raw).trim().toUpperCase();
  return SERIAL.test(s) ? s : null;
}

export interface CertificateView {
  serial: string;
  kind: "module" | "course";
  userId: string;
  name: string;
  /** What the certificate is for: the course, or the module of the Odoo course. */
  title: string;
  /** For module certificates: the course the module belongs to. */
  partOf: string | null;
  level: string;
  score: number;
  issuedAt: Date;
}

export async function getCertificate(db: Db, rawSerial: string): Promise<CertificateView | null> {
  const serial = normalizeSerial(rawSerial);
  if (!serial) return null;
  const [mod] = await db
    .select({ serial: certificates.serial, userId: users.id, name: users.name, title: courses.title, level: courses.level, score: certificates.score, issuedAt: certificates.issuedAt, partOf: programs.title })
    .from(certificates)
    .innerJoin(users, eq(users.id, certificates.userId))
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .leftJoin(programs, eq(programs.id, courses.programId))
    .where(eq(certificates.serial, serial))
    .limit(1);
  if (mod) return { ...mod, kind: "module" };
  const [course] = await db
    .select({ serial: programCertificates.serial, userId: users.id, name: users.name, title: programs.title, level: programs.level, score: programCertificates.score, issuedAt: programCertificates.issuedAt })
    .from(programCertificates)
    .innerJoin(users, eq(users.id, programCertificates.userId))
    .innerJoin(programs, eq(programs.id, programCertificates.programId))
    .where(eq(programCertificates.serial, serial))
    .limit(1);
  return course ? { ...course, partOf: null, kind: "course" } : null;
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
    name: cert.partOf ? `${cert.title} (${cert.partOf})` : cert.title,
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

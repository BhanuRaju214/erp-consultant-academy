import { and, eq, isNull, lte, or, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { enrollments, users } from "@/lib/db/schema";
import type { EmailMessage, EmailResult } from "@/lib/email";
import { BRAND } from "@/lib/brand";

/**
 * "Continue your course" reminders: twice a week (Monday and Thursday, from 10:00 IST)
 * every learner who has not finished a course they are enrolled in gets one email per
 * course, until they complete it, earn the certificate or unsubscribe.
 */
export const REMINDER_DAYS = [1, 4]; // Monday, Thursday
export const REMINDER_HOUR_IST = 10;
/** Minimum gap between two reminders for the same enrolment (and after enrolling). */
const MIN_GAP_MS = 2 * 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Whether reminders go out at this moment: Monday or Thursday, 10:00 IST or later. */
export function isReminderWindow(now: Date): boolean {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  return REMINDER_DAYS.includes(ist.getUTCDay()) && ist.getUTCHours() >= REMINDER_HOUR_IST;
}

export interface DueReminder {
  enrollmentId: string;
  lastReminderAt: Date | null;
  name: string;
  email: string;
  emailToken: string;
  programTitle: string;
  homePath: string;
  lessonsTotal: number;
  lessonsDone: number;
}

/** Enrolments that should get a reminder now: active learner, unfinished published course, no certificate. */
export async function dueReminders(db: Db, now = new Date()): Promise<DueReminder[]> {
  const cutoff = new Date(now.getTime() - MIN_GAP_MS);
  const res = await db.execute(sql`
    select * from (
      select e.id as "enrollmentId", e.last_reminder_at as "lastReminderAt",
             u.name, u.email, u.email_token as "emailToken",
             p.title as "programTitle", p.home_path as "homePath",
             (select count(*)::int from lessons l
                join course_modules cm on cm.id = l.module_id
                join courses c on c.id = cm.course_id
               where c.program_id = p.id and c.published) as "lessonsTotal",
             (select count(*)::int from lessons l
                join course_modules cm on cm.id = l.module_id
                join courses c on c.id = cm.course_id
                join lesson_progress lp on lp.lesson_id = l.id and lp.user_id = u.id and lp.status = 'completed'
               where c.program_id = p.id and c.published) as "lessonsDone"
        from enrollments e
        join users u on u.id = e.user_id
        join programs p on p.id = e.program_id
       where e.revoked_at is null
         and u.active and u.role = 'student' and u.course_reminders
         and p.status = 'published'
         and e.created_at <= ${cutoff.toISOString()}
         and (e.last_reminder_at is null or e.last_reminder_at <= ${cutoff.toISOString()})
         and not exists (select 1 from program_certificates pc where pc.user_id = u.id and pc.program_id = p.id)
    ) due
    where "lessonsTotal" > 0 and "lessonsDone" < "lessonsTotal"
    order by email`);
  return (res.rows as unknown as DueReminder[]).map((r) => ({
    ...r,
    lastReminderAt: r.lastReminderAt ? new Date(r.lastReminderAt) : null,
    lessonsTotal: Number(r.lessonsTotal),
    lessonsDone: Number(r.lessonsDone),
  }));
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function reminderEmail(r: DueReminder, baseUrl: string): EmailMessage {
  const courseUrl = `${baseUrl}${r.homePath}`;
  const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${encodeURIComponent(r.emailToken)}`;
  const pct = Math.round((r.lessonsDone / r.lessonsTotal) * 100);
  const left = r.lessonsTotal - r.lessonsDone;
  const first = r.name.split(/\s+/)[0] || r.name;
  const progress =
    r.lessonsDone === 0
      ? `You haven't started yet. The first lesson takes just a few minutes.`
      : `You've completed ${r.lessonsDone} of ${r.lessonsTotal} lessons (${pct}%). Only ${left} ${left === 1 ? "lesson" : "lessons"} to go.`;
  const subject = r.lessonsDone === 0 ? `Start your ${r.programTitle} course` : `Keep going: ${r.programTitle} is ${pct}% done`;
  const text = [
    `Hi ${first},`,
    "",
    `You have registered for ${r.programTitle} on ${BRAND.productName}.`,
    progress,
    "",
    "Please continue the course and complete it to earn your certificate. You can verify it online and add it to your LinkedIn profile.",
    "",
    `Continue the course: ${courseUrl}`,
    "",
    `The ${BRAND.productName} team`,
    "",
    `You get these reminders twice a week until you finish the course. Stop them: ${unsubscribeUrl}`,
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:28px">
<tr><td>
<p style="margin:0 0 4px;font-size:13px;font-weight:bold;color:#2563eb;letter-spacing:.04em;text-transform:uppercase">${BRAND.productName}</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">Hi ${escapeHtml(first)}, continue your course</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">You have registered for <strong>${escapeHtml(r.programTitle)}</strong>. ${escapeHtml(progress)}</p>
<div style="margin:16px 0;background:#e5e7eb;border-radius:999px;height:10px;overflow:hidden"><div style="width:${pct}%;background:#2563eb;height:10px"></div></div>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6">Please continue the course and complete it to earn your <strong>certificate</strong>. You can verify it online and add it to your LinkedIn profile.</p>
<p style="margin:0 0 24px"><a href="${courseUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">Continue the course</a></p>
<p style="margin:0;font-size:14px;color:#4b5563">The ${BRAND.productName} team</p>
</td></tr></table>
<p style="max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#6b7280">You get these reminders twice a week until you finish the course. <a href="${unsubscribeUrl}" style="color:#6b7280">Stop course reminders</a></p>
</td></tr></table></body></html>`;
  return { to: r.email, subject, text, html, headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` } };
}

/**
 * Sends every due reminder once. Each enrolment is claimed before sending, so two runs
 * at the same time never email the same learner twice; a failed send is released again.
 */
export async function sendCourseReminders(
  db: Db,
  opts: { baseUrl: string; send: (msg: EmailMessage) => Promise<EmailResult>; now?: Date },
): Promise<{ sent: number; failed: number }> {
  const now = opts.now ?? new Date();
  const cutoff = new Date(now.getTime() - MIN_GAP_MS);
  let sent = 0;
  let failed = 0;
  for (const r of await dueReminders(db, now)) {
    const claimed = await db
      .update(enrollments)
      .set({ lastReminderAt: now })
      .where(and(eq(enrollments.id, r.enrollmentId), or(isNull(enrollments.lastReminderAt), lte(enrollments.lastReminderAt, cutoff))))
      .returning({ id: enrollments.id });
    if (claimed.length === 0) continue;
    const result = await opts.send(reminderEmail(r, opts.baseUrl)).catch((err: Error) => ({ ok: false as const, error: err.message }));
    if (result.ok) sent++;
    else {
      failed++;
      await db.update(enrollments).set({ lastReminderAt: r.lastReminderAt }).where(eq(enrollments.id, r.enrollmentId));
    }
  }
  return { sent, failed };
}

/** Turns course reminders on or off for the account behind an email link. */
export async function setCourseReminders(db: Db, token: string, on: boolean): Promise<{ email: string } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const [row] = await db.update(users).set({ courseReminders: on }).where(eq(users.emailToken, token)).returning({ email: users.email });
  return row ?? null;
}

export async function getReminderSetting(db: Db, token: string): Promise<{ email: string; on: boolean } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const row = await db.query.users.findFirst({ where: eq(users.emailToken, token), columns: { email: true, courseReminders: true } });
  return row ? { email: row.email, on: row.courseReminders } : null;
}

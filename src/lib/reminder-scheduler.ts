import "server-only";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { isReminderWindow, sendCourseReminders } from "@/lib/services/reminders";

const CHECK_EVERY_MS = 15 * 60 * 1000;

/**
 * Checks every 15 minutes and, on Mondays and Thursdays from 10:00 IST, emails the
 * "continue your course" reminders that are due. Runs inside the production server
 * (started from instrumentation.ts); sending is idempotent, so restarts are safe.
 */
export function startReminderScheduler(): void {
  const baseUrl = process.env.APP_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    console.warn("[reminders] APP_URL is not set; course reminder emails are off.");
    return;
  }
  let running = false;
  const tick = async () => {
    if (running || !isReminderWindow(new Date())) return;
    running = true;
    try {
      const { sent, failed } = await sendCourseReminders(await getDb(), { baseUrl, send: sendEmail });
      if (sent || failed) console.info(`[reminders] sent ${sent} course reminder(s), ${failed} failed`);
    } catch (err) {
      console.error("[reminders] run failed", err);
    } finally {
      running = false;
    }
  };
  setInterval(tick, CHECK_EVERY_MS).unref();
  setTimeout(tick, 60_000).unref();
  console.info("[reminders] course reminders scheduled for Mondays and Thursdays from 10:00 IST");
}

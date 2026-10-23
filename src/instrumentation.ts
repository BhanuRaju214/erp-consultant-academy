/** Runs once when the server starts. Background jobs only run in production (next start). */
export async function register() {
  // The NEXT_RUNTIME check must wrap the import so the edge build drops it.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NODE_ENV !== "production" || process.env.COURSE_REMINDERS === "off") return;
    const { startReminderScheduler } = await import("@/lib/reminder-scheduler");
    startReminderScheduler();
  }
}

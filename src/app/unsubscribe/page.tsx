import { MailCheck, MailX } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getReminderSetting } from "@/lib/services/reminders";
import { setCourseRemindersAction } from "@/app/actions/reminders";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { Callout, Container, buttonClass } from "@/components/ui";

export const metadata = { title: "Course reminder emails", robots: { index: false } };

/**
 * Opened from the link in a reminder email; works without signing in. Changing the
 * setting needs a button press, so link scanners in mail clients can't unsubscribe anyone.
 */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const setting = await getReminderSetting(await getDb(), token);
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <PublicHeader signedIn={Boolean(user)} />
      <main className="flex-1">
        <Container className="max-w-xl py-16">
          {!setting ? (
            <Callout tone="danger" title="This link isn't valid">
              Open the link from your latest reminder email, or contact us and we&apos;ll stop the emails for you.
            </Callout>
          ) : (
            <>
              {setting.on ? <MailCheck className="h-10 w-10 text-primary" aria-hidden /> : <MailX className="h-10 w-10 text-muted" aria-hidden />}
              <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.02em] text-fg">Course reminder emails</h1>
              <p className="mt-2 text-muted">
                {setting.on ? (
                  <>
                    <span className="font-semibold text-fg">{setting.email}</span> gets a reminder twice a week for each course that isn&apos;t finished yet.
                  </>
                ) : (
                  <>
                    Course reminders are off for <span className="font-semibold text-fg">{setting.email}</span>. You&apos;ll still get emails about your account and purchases.
                  </>
                )}
              </p>
              <form action={setCourseRemindersAction} className="mt-6">
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="on" value={setting.on ? "false" : "true"} />
                <button className={buttonClass(setting.on ? "secondary" : "primary")}>{setting.on ? "Stop course reminders" : "Turn reminders back on"}</button>
              </form>
            </>
          )}
        </Container>
      </main>
      <SiteFooter signedIn={Boolean(user)} />
    </div>
  );
}

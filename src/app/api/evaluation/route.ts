import { NextResponse } from "next/server";
import { z } from "zod";
import { courseApiUser } from "@/lib/auth/course-access";
import { getDb } from "@/lib/db";
import { chatJson, transcribe } from "@/lib/evaluation/ai";
import { rateLimit } from "@/lib/rate-limit";
import { getLatestEvaluation, processPresentation, startEvaluation, submitEvaluation } from "@/lib/services/evaluation";

export const maxDuration = 300;

const bodySchema = z.object({
  action: z.enum(["start", "process", "submit"]),
  clientDurationSec: z.number().min(0).max(4 * 3600).optional(),
});

/** Final evaluation workflow for the signed-in trainee: start an attempt, process the recording, submit for scoring. */
export async function POST(req: Request) {
  // Signed in and enrolled in the Odoo course (or staff).
  const auth = await courseApiUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (!rateLimit(`evaluation:${user.id}`, 10, 60_000)) return NextResponse.json({ error: "Too many requests. Wait a minute and try again." }, { status: 429 });

  const db = await getDb();
  const ai = { transcribe, chatJson };
  if (parsed.data.action === "start") {
    const res = await startEvaluation(db, user.id);
    return res.ok ? NextResponse.json({ evaluation: res.evaluation }) : NextResponse.json({ error: res.error }, { status: 403 });
  }
  const ev = await getLatestEvaluation(db, user.id);
  if (!ev) return NextResponse.json({ error: "Start an evaluation first." }, { status: 404 });
  const res =
    parsed.data.action === "process"
      ? await processPresentation(db, ev, ai, parsed.data.clientDurationSec ?? 0)
      : await submitEvaluation(db, ev, ai);
  return res.ok ? NextResponse.json({ evaluation: res.evaluation }) : NextResponse.json({ error: res.error }, { status: 409 });
}

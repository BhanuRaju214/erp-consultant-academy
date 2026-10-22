import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { razorpayGateway } from "@/lib/payment-gateway";
import { rateLimit } from "@/lib/rate-limit";
import { getProgramBySlug } from "@/lib/services/programs";
import { quote, startCheckout } from "@/lib/services/payments";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  slug: z.string().min(1).max(100),
  couponCode: z.string().max(40).optional(),
  /** "quote" only prices the order (coupon preview); "start" creates it. */
  mode: z.enum(["quote", "start"]).default("start"),
  billing: z.object({ name: z.string(), stateCode: z.string(), gstin: z.string().optional() }).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!rateLimit(`checkout:${user.id}`, 20, 60_000)) return NextResponse.json({ error: "Too many attempts. Wait a minute and try again." }, { status: 429 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { slug, couponCode, mode, billing } = parsed.data;
  const db = await getDb();

  if (mode === "quote") {
    const program = await getProgramBySlug(db, slug);
    if (!program) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    const q = await quote(db, program, couponCode);
    if (!q.ok) return NextResponse.json({ error: q.error }, { status: 400 });
    return NextResponse.json({ listPaise: q.value.listPaise, discountPaise: q.value.discountPaise, amountPaise: q.value.amountPaise, couponCode: q.value.coupon?.code ?? null });
  }

  if (!billing) return NextResponse.json({ error: "Billing details are required." }, { status: 400 });
  const res = await startCheckout(db, razorpayGateway(), { user, slug, billing, couponCode });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  // Free (100% coupon) orders are confirmed already: send the learner to this course's home.
  const home = res.value.kind === "free" ? `${(await getProgramBySlug(db, slug))?.homePath ?? "/dashboard"}?purchased=1` : undefined;
  return NextResponse.json({ ...res.value, redirect: home, name: user.name, email: user.email });
}

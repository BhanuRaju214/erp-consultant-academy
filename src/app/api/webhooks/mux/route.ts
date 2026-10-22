import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyMuxWebhook } from "@/lib/mux";
import { applyMuxEvent, type MuxEvent } from "@/lib/services/media";

export const dynamic = "force-dynamic";

/** Mux notifies us when an upload becomes an asset and when the asset is ready or failed. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyMuxWebhook(raw, req.headers.get("mux-signature"), process.env.MUX_WEBHOOK_SECRET ?? "")) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let event: MuxEvent;
  try {
    event = JSON.parse(raw) as MuxEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  await applyMuxEvent(await getDb(), event);
  return NextResponse.json({ received: true });
}

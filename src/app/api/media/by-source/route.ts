import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { mediaPlaybackResponse } from "@/lib/media-playback";

export const dynamic = "force-dynamic";

/**
 * Playback info for a lesson video written as `"src": "/videos/<name>.mp4"` in course
 * content. The file was uploaded to Mux by scripts/upload-videos-to-mux.ts, which stores
 * that path as the asset's storage key.
 */
export async function GET(req: Request) {
  const src = new URL(req.url).searchParams.get("src") ?? "";
  if (!/^\/videos\/[a-z0-9_.-]+\.mp4$/.test(src)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const db = await getDb();
  const asset = await db.query.mediaAssets.findFirst({ where: and(eq(mediaAssets.storage, "mux"), eq(mediaAssets.storageKey, src)) });
  return mediaPlaybackResponse(db, await getCurrentUser(), asset ?? null);
}

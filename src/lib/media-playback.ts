import "server-only";
import { NextResponse } from "next/server";
import type { Db } from "@/lib/db/client";
import type { MediaAsset, User } from "@/lib/db/schema";
import { MUX_STATUS_API, muxEnabled, signPlaybackToken } from "@/lib/mux";
import { canViewMedia, syncPendingMuxAsset } from "@/lib/services/media";
import { FLAGSHIP_PROGRAM, canAccessProgram } from "@/lib/services/programs";

/**
 * Playback/status info for a video player:
 * - Mux video → playback ID plus short-lived signed tokens
 * - file video (no Mux) → the /media URL
 * - still processing → { status: "pending" }
 * Returns 404 when the asset is missing or the viewer may not see it.
 */
export async function mediaPlaybackResponse(db: Db, user: User | null, found: MediaAsset | null): Promise<NextResponse> {
  let asset = found;
  if (asset && muxEnabled()) asset = await syncPendingMuxAsset(db, asset, MUX_STATUS_API).catch(() => asset);
  const courseAccess = asset?.visibility === "enrolled" && user ? await canAccessProgram(db, user, FLAGSHIP_PROGRAM.slug) : false;
  if (!asset || !canViewMedia(user, asset, courseAccess)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const base = { id: asset.id, kind: asset.kind, status: asset.status, title: asset.title || asset.fileName, error: asset.error };
  if (asset.status !== "ready") return NextResponse.json(base, { headers: { "Cache-Control": "no-store" } });
  if (asset.storage === "mux" && asset.muxPlaybackId && muxEnabled()) {
    return NextResponse.json(
      {
        ...base,
        player: "mux",
        playbackId: asset.muxPlaybackId,
        tokens: {
          playback: signPlaybackToken(asset.muxPlaybackId, "v"),
          thumbnail: signPlaybackToken(asset.muxPlaybackId, "t"),
          storyboard: signPlaybackToken(asset.muxPlaybackId, "s"),
        },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }
  return NextResponse.json({ ...base, player: "file", src: `/media/${asset.id}` }, { headers: { "Cache-Control": "private, no-store" } });
}

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { MUX_STATUS_API, cancelDirectUpload, deleteMuxAsset, muxEnabled, signPlaybackToken } from "@/lib/mux";
import { deleteObject, headObject } from "@/lib/storage";
import { canViewMedia, getMediaAsset, syncPendingMuxAsset } from "@/lib/services/media";
import { FLAGSHIP_PROGRAM, canAccessProgram } from "@/lib/services/programs";

export const dynamic = "force-dynamic";

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

/**
 * Playback/status info for the lesson video player:
 * - Mux video → playback ID plus short-lived signed tokens
 * - file video (no Mux) → the /media URL
 * - still processing → { status: "pending" }
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const db = await getDb();
  let asset = await getMediaAsset(db, (await params).id);
  if (asset && muxEnabled()) asset = await syncPendingMuxAsset(db, asset, MUX_STATUS_API).catch(() => asset);
  const courseAccess = asset?.visibility === "enrolled" && user ? await canAccessProgram(db, user, FLAGSHIP_PROGRAM.slug) : false;
  if (!asset || !canViewMedia(user, asset, courseAccess)) return notFound();
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

/** Step 2 of a file upload: confirms the object reached storage and marks the asset ready. */
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "media:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = await getDb();
  const asset = await getMediaAsset(db, (await params).id);
  if (!asset) return notFound();
  if (asset.storage === "mux") return NextResponse.json({ status: asset.status });
  if (!asset.storageKey) return notFound();
  const size = await headObject(asset.storageKey);
  if (size === null) return NextResponse.json({ error: "The file did not arrive in storage. Try the upload again." }, { status: 409 });
  await db.update(mediaAssets).set({ status: "ready", sizeBytes: size, error: null }).where(eq(mediaAssets.id, asset.id));
  return NextResponse.json({ status: "ready" });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "media:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = await getDb();
  const asset = await getMediaAsset(db, (await params).id);
  if (!asset) return notFound();
  try {
    if (asset.storage === "mux") {
      if (asset.muxAssetId) await deleteMuxAsset(asset.muxAssetId);
      else if (asset.muxUploadId) await cancelDirectUpload(asset.muxUploadId);
    } else if (asset.storageKey) {
      await deleteObject(asset.storageKey);
    }
  } catch (err) {
    console.error("[media] storage delete failed:", err);
    return NextResponse.json({ error: "Could not delete the file from storage. Try again." }, { status: 502 });
  }
  await db.delete(mediaAssets).where(eq(mediaAssets.id, asset.id));
  return new NextResponse(null, { status: 204 });
}

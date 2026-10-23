import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { cancelDirectUpload, deleteMuxAsset } from "@/lib/mux";
import { mediaPlaybackResponse } from "@/lib/media-playback";
import { deleteObject, headObject } from "@/lib/storage";
import { getMediaAsset } from "@/lib/services/media";

export const dynamic = "force-dynamic";

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

/** Playback/status info for the lesson video player (see mediaPlaybackResponse). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  return mediaPlaybackResponse(db, await getCurrentUser(), await getMediaAsset(db, (await params).id));
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

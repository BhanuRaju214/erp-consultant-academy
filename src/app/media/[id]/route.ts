import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { localFileResponse, publicObjectUrl, signedGetUrl } from "@/lib/storage";
import { canViewMedia, getMediaAsset } from "@/lib/services/media";
import { FLAGSHIP_PROGRAM, canAccessProgram } from "@/lib/services/programs";

export const dynamic = "force-dynamic";

/**
 * Stable URL for an asset, used in lesson markdown (`![…](/media/<id>)`).
 * Access is checked against Postgres on every request; the browser is then sent to
 * a short-lived signed R2 URL (or the public bucket for public assets), so file
 * bytes are served by Cloudflare rather than this server.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const db = await getDb();
  const asset = await getMediaAsset(db, (await params).id);
  // Course content ("enrolled") needs an enrolment, not just a sign-in.
  const courseAccess = asset?.visibility === "enrolled" && user ? await canAccessProgram(db, user, FLAGSHIP_PROGRAM.slug) : false;
  if (!asset || asset.status !== "ready" || !asset.storageKey || !canViewMedia(user, asset, courseAccess)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const inline = asset.kind === "image" || asset.kind === "video" || asset.contentType === "application/pdf";
  const opts = { fileName: asset.fileName, contentType: asset.contentType, inline };

  if (asset.storage === "local") {
    try {
      return await localFileResponse(asset.storageKey, req, opts);
    } catch {
      return NextResponse.json({ error: "File missing from storage" }, { status: 404 });
    }
  }
  const publicUrl = asset.visibility === "public" ? publicObjectUrl(asset.storageKey) : null;
  const target = publicUrl ?? (await signedGetUrl(asset.storageKey, opts));
  return NextResponse.redirect(target, { status: 302, headers: { "Cache-Control": publicUrl ? "public, max-age=3600" : "private, no-store" } });
}

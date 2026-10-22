import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { getDb } from "@/lib/db";
import { putObject, storageDriver } from "@/lib/storage";
import { getMediaAsset, MAX_FILE_BYTES, MAX_VIDEO_BYTES } from "@/lib/services/media";

export const dynamic = "force-dynamic";

/** Development fallback for the direct-to-R2 PUT when R2 is not configured. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (storageDriver() !== "local") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const user = await getCurrentUser();
  if (!user || !can(user.role, "media:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const asset = await getMediaAsset(await getDb(), (await params).id);
  if (!asset || asset.storage !== "local" || !asset.storageKey || asset.status !== "pending") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = new Uint8Array(await req.arrayBuffer());
  const max = asset.kind === "video" ? MAX_VIDEO_BYTES : MAX_FILE_BYTES;
  if (body.byteLength === 0 || body.byteLength > max) return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
  await putObject(asset.storageKey, body, asset.contentType);
  return new NextResponse(null, { status: 204 });
}

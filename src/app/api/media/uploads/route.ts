import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/auth/rbac";
import { appUrl } from "@/lib/auth/cookie";
import { getDb } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { createDirectUpload, muxEnabled } from "@/lib/mux";
import { newStorageKey, signedPutUrl, storageDriver } from "@/lib/storage";
import { validateUploadRequest } from "@/lib/services/media";

export const dynamic = "force-dynamic";

/**
 * Step 1 of an upload: creates a pending media row and returns where the browser
 * should PUT the file — a signed R2 URL, a Mux direct-upload URL, or (local
 * development without R2) this app's own local-upload route.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "media:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const check = validateUploadRequest(await req.json().catch(() => null));
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
  const { fileName, size, title, visibility, kind, contentType } = check.value;
  const db = await getDb();

  if (kind === "video" && muxEnabled()) {
    const [row] = await db
      .insert(mediaAssets)
      .values({ kind, status: "pending", visibility, title, fileName, contentType, sizeBytes: size, storage: "mux", uploadedById: user.id })
      .returning();
    try {
      const upload = await createDirectUpload({ corsOrigin: await appUrl(), passthrough: row.id });
      await db.update(mediaAssets).set({ muxUploadId: upload.id }).where(eq(mediaAssets.id, row.id));
      return NextResponse.json({ id: row.id, target: "mux", uploadUrl: upload.url, method: "PUT", headers: {} });
    } catch (err) {
      console.error("[media] Mux upload creation failed:", err);
      await db.delete(mediaAssets).where(eq(mediaAssets.id, row.id));
      return NextResponse.json({ error: "Could not start the video upload. Check the Mux settings." }, { status: 502 });
    }
  }

  const driver = storageDriver();
  const now = new Date();
  const key = newStorageKey(`media/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`, fileName);
  const [row] = await db
    .insert(mediaAssets)
    .values({ kind, status: "pending", visibility, title, fileName, contentType, sizeBytes: size, storage: driver, storageKey: key, uploadedById: user.id })
    .returning();
  const uploadUrl = driver === "r2" ? await signedPutUrl(key, contentType) : `/api/media/${row.id}/local-upload`;
  return NextResponse.json({ id: row.id, target: driver, uploadUrl, method: "PUT", headers: { "Content-Type": contentType } });
}

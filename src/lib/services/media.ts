import path from "node:path";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/lib/db/client";
import { mediaAssets, type MediaAsset, type MediaKind, type User } from "@/lib/db/schema";
import { can } from "@/lib/auth/rbac";
import type { ServiceResult } from "./users";

export const MAX_FILE_BYTES = 200 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 10 * 1024 * 1024 * 1024;

const FILE_TYPES: Record<string, { kind: MediaKind; contentType: string }> = {
  ".png": { kind: "image", contentType: "image/png" },
  ".jpg": { kind: "image", contentType: "image/jpeg" },
  ".jpeg": { kind: "image", contentType: "image/jpeg" },
  ".webp": { kind: "image", contentType: "image/webp" },
  ".gif": { kind: "image", contentType: "image/gif" },
  ".pdf": { kind: "document", contentType: "application/pdf" },
  ".docx": { kind: "document", contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  ".xlsx": { kind: "document", contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  ".pptx": { kind: "document", contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  ".csv": { kind: "document", contentType: "text/csv" },
  ".txt": { kind: "document", contentType: "text/plain" },
  ".zip": { kind: "other", contentType: "application/zip" },
  ".mp4": { kind: "video", contentType: "video/mp4" },
  ".mov": { kind: "video", contentType: "video/quicktime" },
  ".webm": { kind: "video", contentType: "video/webm" },
  ".mkv": { kind: "video", contentType: "video/x-matroska" },
};

export const ACCEPTED_EXTENSIONS = Object.keys(FILE_TYPES);

/** Content type comes from the extension, never from the browser, so it can't be spoofed into e.g. text/html. */
export function classifyFile(fileName: string): { kind: MediaKind; contentType: string } | null {
  return FILE_TYPES[path.extname(fileName).toLowerCase()] ?? null;
}

export const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  size: z.number().int().positive(),
  title: z.string().trim().max(200).optional().default(""),
  visibility: z.enum(["public", "authenticated", "enrolled", "private"]).optional().default("enrolled"),
});

export function validateUploadRequest(input: unknown): ServiceResult<z.output<typeof uploadRequestSchema> & { kind: MediaKind; contentType: string }> {
  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid upload." };
  const type = classifyFile(parsed.data.fileName);
  if (!type) return { ok: false, error: `This file type is not supported. Allowed: ${ACCEPTED_EXTENSIONS.join(", ")}` };
  const max = type.kind === "video" ? MAX_VIDEO_BYTES : MAX_FILE_BYTES;
  if (parsed.data.size > max) return { ok: false, error: `File is larger than ${Math.round(max / 1024 / 1024)} MB.` };
  return { ok: true, value: { ...parsed.data, ...type } };
}

/**
 * Who may view an asset. Pending or errored assets are visible to media managers only.
 * `enrolled` assets need course access (pass hasCourseAccess, from canAccessProgram).
 */
export function canViewMedia(
  user: Pick<User, "id" | "role"> | null,
  asset: Pick<MediaAsset, "visibility" | "status" | "uploadedById">,
  hasCourseAccess = false,
): boolean {
  const manager = can(user?.role, "media:manage");
  if (asset.status !== "ready" && !manager) return false;
  if (asset.visibility === "public") return true;
  if (!user) return false;
  if (asset.visibility === "authenticated") return true;
  if (asset.visibility === "enrolled") return manager || hasCourseAccess || asset.uploadedById === user.id;
  return manager || asset.uploadedById === user.id;
}

export async function getMediaAsset(db: Db, id: string): Promise<MediaAsset | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return (await db.query.mediaAssets.findFirst({ where: eq(mediaAssets.id, id) })) ?? null;
}

export async function listMediaAssets(db: Db, limit = 200): Promise<MediaAsset[]> {
  return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(limit);
}

/** Ready images that can be used as course covers (public or signed-in visibility). */
export async function listCoverImages(db: Db): Promise<{ id: string; name: string }[]> {
  const rows = await db
    .select({ id: mediaAssets.id, title: mediaAssets.title, fileName: mediaAssets.fileName })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.kind, "image"), eq(mediaAssets.status, "ready"), inArray(mediaAssets.visibility, ["public", "authenticated"])))
    .orderBy(desc(mediaAssets.createdAt))
    .limit(300);
  return rows.map((r) => ({ id: r.id, name: r.title || r.fileName }));
}

/** Markdown to paste into a lesson for this asset. */
export function embedSnippet(asset: Pick<MediaAsset, "id" | "kind" | "title" | "fileName">): string {
  const label = (asset.title || asset.fileName).replace(/[\[\]]/g, "");
  if (asset.kind === "image") return `![${label}](/media/${asset.id})`;
  if (asset.kind === "video") return "```media-video\n" + asset.id + "\n```";
  return `[Download ${label}](/media/${asset.id})`;
}

/* ------------------------------------------------------------------ */
/* Mux webhooks                                                        */
/* ------------------------------------------------------------------ */

export interface MuxEvent {
  type: string;
  data: {
    id?: string;
    asset_id?: string;
    passthrough?: string;
    duration?: number;
    playback_ids?: { id: string; policy: string }[];
    errors?: { messages?: string[] };
    new_asset_settings?: { passthrough?: string };
  };
}

export interface MuxStatusApi {
  getUpload(id: string): Promise<{ id: string; status: string; asset_id?: string }>;
  getAsset(id: string): Promise<{ id: string; status: string; duration?: number; playback_ids?: { id: string; policy: string }[]; errors?: { messages?: string[] } }>;
}

/**
 * Asks Mux for the current state of a pending video and applies it, for when
 * webhooks can't reach the app (local development) or one was missed.
 * Returns the refreshed row.
 */
const lastMuxSync = new Map<string, number>();

export async function syncPendingMuxAsset(db: Db, asset: MediaAsset, api: MuxStatusApi, minIntervalMs = 5000): Promise<MediaAsset> {
  if (asset.storage !== "mux" || asset.status !== "pending") return asset;
  const now = Date.now();
  if (now - (lastMuxSync.get(asset.id) ?? 0) < minIntervalMs) return asset;
  lastMuxSync.set(asset.id, now);
  if (lastMuxSync.size > 5000) lastMuxSync.clear();
  let assetId = asset.muxAssetId;
  if (!assetId && asset.muxUploadId) {
    const upload = await api.getUpload(asset.muxUploadId);
    if (upload.asset_id) {
      await applyMuxEvent(db, { type: "video.upload.asset_created", data: { id: upload.id, asset_id: upload.asset_id, new_asset_settings: { passthrough: asset.id } } });
      assetId = upload.asset_id;
    } else if (upload.status === "errored" || upload.status === "cancelled" || upload.status === "timed_out") {
      await applyMuxEvent(db, { type: upload.status === "cancelled" ? "video.upload.cancelled" : "video.upload.errored", data: { id: upload.id, new_asset_settings: { passthrough: asset.id } } });
    }
  }
  if (assetId) {
    const remote = await api.getAsset(assetId);
    if (remote.status === "ready") await applyMuxEvent(db, { type: "video.asset.ready", data: { ...remote, passthrough: asset.id } });
    else if (remote.status === "errored") await applyMuxEvent(db, { type: "video.asset.errored", data: { ...remote, passthrough: asset.id } });
  }
  return (await getMediaAsset(db, asset.id)) ?? asset;
}

/** Applies a verified Mux webhook event. Returns true when a media row was updated. */
export async function applyMuxEvent(db: Db, event: MuxEvent): Promise<boolean> {
  const d = event.data ?? {};
  const byPassthrough = (id?: string) => (id && /^[0-9a-f-]{36}$/i.test(id) ? eq(mediaAssets.id, id) : null);
  let where;
  let patch: Partial<MediaAsset> = {};

  switch (event.type) {
    case "video.upload.asset_created":
      where = byPassthrough(d.new_asset_settings?.passthrough) ?? (d.id ? eq(mediaAssets.muxUploadId, d.id) : null);
      patch = { muxAssetId: d.asset_id ?? null };
      break;
    case "video.asset.ready": {
      where = byPassthrough(d.passthrough) ?? (d.id ? eq(mediaAssets.muxAssetId, d.id) : null);
      const playback = d.playback_ids?.find((p) => p.policy === "signed") ?? d.playback_ids?.[0];
      patch = {
        status: "ready",
        muxAssetId: d.id ?? null,
        muxPlaybackId: playback?.id ?? null,
        durationSeconds: d.duration ? Math.round(d.duration) : null,
        error: null,
      };
      break;
    }
    case "video.asset.errored":
      where = byPassthrough(d.passthrough) ?? (d.id ? eq(mediaAssets.muxAssetId, d.id) : null);
      patch = { status: "errored", error: d.errors?.messages?.join("; ").slice(0, 500) || "Mux could not process this video." };
      break;
    case "video.upload.errored":
    case "video.upload.cancelled":
      where = byPassthrough(d.new_asset_settings?.passthrough) ?? (d.id ? eq(mediaAssets.muxUploadId, d.id) : null);
      patch = { status: "errored", error: event.type === "video.upload.cancelled" ? "Upload was cancelled." : "Upload failed." };
      break;
    default:
      return false;
  }
  if (!where) return false;
  const rows = await db.update(mediaAssets).set(patch).where(where).returning({ id: mediaAssets.id });
  return rows.length > 0;
}

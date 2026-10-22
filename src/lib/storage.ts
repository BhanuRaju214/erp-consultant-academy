import "server-only";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { AwsClient } from "aws4fetch";

/**
 * Object storage for media and submissions.
 * - R2 (production): set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET.
 *   Browsers upload and download directly with short-lived signed URLs, so file bytes
 *   never pass through the app server.
 * - Local disk (development fallback): files live under STORAGE_DIR, outside /public,
 *   and are served only through authorised route handlers.
 */
const ROOT = path.resolve(process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage"));

export type StorageDriver = "r2" | "local";

export function storageDriver(): StorageDriver {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
  return R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET ? "r2" : "local";
}

let r2Client: AwsClient | null = null;
function r2(): AwsClient {
  r2Client ??= new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    service: "s3",
    region: "auto",
  });
  return r2Client;
}

function r2ObjectUrl(key: string): URL {
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return new URL(`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}/${encoded}`);
}

function localPath(key: string): string {
  const abs = path.resolve(ROOT, key);
  if (!abs.startsWith(ROOT + path.sep)) throw new Error("Invalid storage key");
  return abs;
}

/** Builds a collision-free key such as `media/2026/10/<uuid>.pdf`. */
export function newStorageKey(prefix: string, fileName: string): string {
  const safePrefix = prefix.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+|\/+$/g, "");
  const ext = path.extname(fileName).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return `${safePrefix}/${randomUUID()}${ext}`;
}

export async function putObject(key: string, body: Uint8Array<ArrayBuffer>, contentType: string): Promise<void> {
  if (storageDriver() === "r2") {
    const res = await r2().fetch(r2ObjectUrl(key), { method: "PUT", body, headers: { "Content-Type": contentType }, cache: "no-store" });
    if (!res.ok) throw new Error(`R2 upload failed (${res.status}): ${await res.text()}`);
    return;
  }
  const abs = localPath(key);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, body);
}

export async function getObject(key: string): Promise<Buffer> {
  if (storageDriver() === "r2") {
    const res = await r2().fetch(r2ObjectUrl(key), { cache: "no-store" });
    if (!res.ok) throw new Error(`R2 download failed (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  }
  return readFile(localPath(key));
}

/** Size of a stored object in bytes, or null when it does not exist. */
export async function headObject(key: string): Promise<number | null> {
  if (storageDriver() === "r2") {
    // R2 HEAD responses (as seen through fetch) carry no Content-Length, so read the
    // total size from the Content-Range of a one-byte ranged GET instead.
    const res = await r2().fetch(r2ObjectUrl(key), { headers: { Range: "bytes=0-0" }, cache: "no-store" });
    await res.arrayBuffer().catch(() => undefined); // at most one byte; drains the connection
    if (res.status === 404) return null;
    if (res.status === 416) return 0; // empty object
    if (!res.ok) throw new Error(`R2 size check failed (${res.status})`);
    const total = /\/(\d+)$/.exec(res.headers.get("content-range") ?? "")?.[1];
    return Number(total ?? res.headers.get("content-length") ?? 0);
  }
  try {
    return (await stat(localPath(key))).size;
  } catch {
    return null;
  }
}

export async function deleteObject(key: string): Promise<void> {
  if (storageDriver() === "r2") {
    const res = await r2().fetch(r2ObjectUrl(key), { method: "DELETE", cache: "no-store" });
    if (!res.ok && res.status !== 404) throw new Error(`R2 delete failed (${res.status})`);
    return;
  }
  await unlink(localPath(key)).catch(() => undefined);
}

function contentDisposition(fileName: string, inline: boolean): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

/** Signed R2 download URL (R2 only). Supports HTTP range requests, so video seeking works. */
export async function signedGetUrl(key: string, opts: { fileName: string; contentType: string; inline: boolean; expiresIn?: number }): Promise<string> {
  const url = r2ObjectUrl(key);
  url.searchParams.set("X-Amz-Expires", String(opts.expiresIn ?? 600));
  url.searchParams.set("response-content-disposition", contentDisposition(opts.fileName, opts.inline));
  url.searchParams.set("response-content-type", opts.contentType);
  const signed = await r2().sign(new Request(url), { aws: { signQuery: true } });
  return signed.url;
}

/** Signed R2 upload URL for a direct browser PUT (R2 only). */
export async function signedPutUrl(key: string, contentType: string, expiresIn = 900): Promise<string> {
  const url = r2ObjectUrl(key);
  url.searchParams.set("X-Amz-Expires", String(expiresIn));
  const signed = await r2().sign(new Request(url, { method: "PUT", headers: { "Content-Type": contentType } }), {
    aws: { signQuery: true },
  });
  return signed.url;
}

/** Public URL for objects served from a public bucket domain (R2_PUBLIC_URL), if configured. */
export function publicObjectUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  return base && storageDriver() === "r2" ? `${base}/${key.split("/").map(encodeURIComponent).join("/")}` : null;
}

/**
 * Streams a locally stored file with HTTP range support (development fallback for
 * what R2 signed URLs do natively).
 */
export async function localFileResponse(key: string, req: Request, opts: { fileName: string; contentType: string; inline: boolean }): Promise<Response> {
  const abs = localPath(key);
  const size = (await stat(abs)).size;
  const headers: Record<string, string> = {
    "Content-Type": opts.contentType,
    "Content-Disposition": contentDisposition(opts.fileName, opts.inline),
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=300",
    "X-Content-Type-Options": "nosniff",
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    const stream = Readable.toWeb(createReadStream(abs, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }
  return new Response(Readable.toWeb(createReadStream(abs)) as ReadableStream, { headers: { ...headers, "Content-Length": String(size) } });
}

/* ------------------------------------------------------------------ */
/* Assignment submissions                                              */
/* ------------------------------------------------------------------ */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".csv", ".zip", ".png", ".jpg", ".jpeg", ".txt", ".md", ".py", ".xml"];

export function validateUpload(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) return "File is larger than 5 MB.";
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return `File type ${ext || "(none)"} is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
  return null;
}

/** Stores a submission attachment; `relPath` is the storage key. */
export async function saveUpload(folder: string, file: File): Promise<{ relPath: string; fileName: string }> {
  const relPath = newStorageKey(`submissions/${folder}`, file.name);
  await putObject(relPath, new Uint8Array(await file.arrayBuffer()), "application/octet-stream");
  return { relPath, fileName: path.basename(file.name).slice(0, 200) };
}

export async function readUpload(relPath: string): Promise<Buffer> {
  return getObject(relPath);
}
